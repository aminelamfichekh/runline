<?php

namespace App\Jobs;

use App\Models\Plan;
use App\Services\PlanGeneratorService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use OpenAI\Factory as OpenAIFactory;

/**
 * GeneratePlanJob
 * 
 * Asynchronous job to generate a training plan using OpenAI.
 * This job handles the heavy lifting of calling OpenAI API and processing the response.
 */
class GeneratePlanJob implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Plan $plan,
        public string $type = 'initial'
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(
        PlanGeneratorService $planGeneratorService,
        NotificationService $notificationService
    ): void {
        try {
            // Update plan status to generating
            $this->plan->update(['status' => 'generating']);

            // Build the prompt
            $prompt = $planGeneratorService->buildPrompt($this->plan, $this->type);

            // Store the prompt used
            $this->plan->update(['openai_prompt' => $prompt]);

            // Initialize OpenAI client
            $apiKey = config('services.openai.api_key');
            if (!$apiKey) {
                throw new \Exception('OpenAI API key not configured');
            }

            $factory = new OpenAIFactory();
            $client = $factory
                ->withApiKey($apiKey)
                ->withOrganization(config('services.openai.organization'))
                ->make();

            // Call OpenAI API
            $response = $client->chat()->create([
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert running coach. Generate detailed, personalized training plans in JSON format. Always respond with valid JSON.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 4000,
            ]);

            // Extract the response
            $content = $response->choices[0]->message->content;
            $tokensUsed = $response->usage->totalTokens ?? null;

            // Parse JSON content
            $planContent = json_decode($content, true);
            
            // If JSON parsing fails, store as text
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('OpenAI response is not valid JSON, storing as text', [
                    'plan_id' => $this->plan->id,
                    'content' => $content,
                ]);
                $planContent = ['raw_content' => $content];
            }

            // Update plan with generated content
            $this->plan->update([
                'status' => 'completed',
                'content' => $planContent,
                'openai_response' => $content,
                'openai_tokens_used' => $tokensUsed,
            ]);

            // Send notification to user
            $notificationService->notifyPlanGenerated($this->plan->user, $this->type);

            Log::info('Plan generated successfully', [
                'plan_id' => $this->plan->id,
                'user_id' => $this->plan->user_id,
                'type' => $this->type,
                'tokens_used' => $tokensUsed,
            ]);

        } catch (\Exception $e) {
            Log::error('Plan generation failed', [
                'plan_id' => $this->plan->id,
                'user_id' => $this->plan->user_id,
                'type' => $this->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Update plan status to failed
            $this->plan->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     *
     * @param \Throwable $exception
     * @return void
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Plan generation job failed permanently', [
            'plan_id' => $this->plan->id,
            'user_id' => $this->plan->user_id,
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);

        $this->plan->update([
            'status' => 'failed',
            'error_message' => 'Job failed after ' . $this->tries . ' attempts: ' . $exception->getMessage(),
        ]);
    }
}

