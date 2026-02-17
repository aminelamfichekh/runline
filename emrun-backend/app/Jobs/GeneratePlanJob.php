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
 * Uses structured outputs (json_schema) for guaranteed valid JSON.
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

            Log::info('Starting plan generation', [
                'plan_id' => $this->plan->id,
                'user_id' => $this->plan->user_id,
                'type' => $this->type,
            ]);

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

            // Get JSON schema for structured output
            $jsonSchema = $planGeneratorService->getJsonSchema();

            // Call OpenAI API with structured output
            $response = $client->chat()->create([
                'model' => 'gpt-4o-2024-08-06', // Model that supports structured outputs
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Tu es un expert en coaching running pour athlètes amateurs. Tu génères des plans d\'entraînement personnalisés en JSON. Réponds UNIQUEMENT avec un objet JSON valide.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'response_format' => [
                    'type' => 'json_schema',
                    'json_schema' => [
                        'name' => 'training_plan',
                        'strict' => true,
                        'schema' => $jsonSchema,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 8000, // Increased for longer plans
            ]);

            // Extract the response
            $content = $response->choices[0]->message->content;
            $tokensUsed = $response->usage->totalTokens ?? null;

            Log::info('OpenAI response received', [
                'plan_id' => $this->plan->id,
                'tokens_used' => $tokensUsed,
                'content_length' => strlen($content),
            ]);

            // Parse JSON content - should always be valid with structured outputs
            $planContent = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON parsing failed despite structured output', [
                    'plan_id' => $this->plan->id,
                    'json_error' => json_last_error_msg(),
                    'content' => substr($content, 0, 500),
                ]);
                throw new \Exception('Failed to parse OpenAI response as JSON: ' . json_last_error_msg());
            }

            // Validate the structure
            if (!isset($planContent['weeks']) || !is_array($planContent['weeks'])) {
                throw new \Exception('Invalid plan structure: missing weeks array');
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
                'weeks_count' => count($planContent['weeks']),
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
