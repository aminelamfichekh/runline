<?php

namespace App\Jobs;

use App\Models\Plan;
use App\Services\PlanGeneratorService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Anthropic\Client as AnthropicClient;

/**
 * GeneratePlanJob
 *
 * Asynchronous job to generate a training plan using Claude (Anthropic).
 * Sends a structured prompt and parses JSON from the response.
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
            $this->plan->update(['ai_prompt' => $prompt]);

            // Initialize Anthropic (Claude) client
            $apiKey = config('services.anthropic.api_key');
            if (!$apiKey) {
                throw new \Exception('Anthropic API key not configured');
            }

            $client = new AnthropicClient(apiKey: $apiKey);

            // Get JSON schema for the system prompt
            $jsonSchema = $planGeneratorService->getJsonSchema();
            $schemaJson = json_encode($jsonSchema, JSON_UNESCAPED_UNICODE);

            $systemPrompt = 'Tu es un expert en coaching running pour athlètes amateurs. Tu génères des plans d\'entraînement personnalisés en JSON. Réponds UNIQUEMENT avec un objet JSON valide dont la structure racine est exactement { "weeks": [...] }. Sans aucun texte avant ou après, sans balises markdown, sans clé enveloppante. Voici le schema JSON à respecter strictement : ' . $schemaJson;

            // Call Claude API
            $response = $client->messages->create(
                maxTokens: 16000,
                messages: [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                model: 'claude-sonnet-4-5-20250929',
                system: $systemPrompt,
                temperature: 0.7,
            );

            // Extract the response
            $content = $response->content[0]->text;
            $tokensUsed = ($response->usage->inputTokens ?? 0) + ($response->usage->outputTokens ?? 0);

            Log::info('Claude response received', [
                'plan_id' => $this->plan->id,
                'tokens_used' => $tokensUsed,
                'content_length' => strlen($content),
            ]);

            // Claude may wrap JSON in ```json ... ``` blocks, strip them
            $content = trim($content);
            if (str_starts_with($content, '```')) {
                $content = preg_replace('/^```(?:json)?\s*/', '', $content);
                $content = preg_replace('/\s*```$/', '', $content);
                $content = trim($content);
            }

            // Parse JSON content
            $planContent = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON parsing failed from Claude response', [
                    'plan_id' => $this->plan->id,
                    'json_error' => json_last_error_msg(),
                    'content' => substr($content, 0, 500),
                ]);
                throw new \Exception('Failed to parse Claude response as JSON: ' . json_last_error_msg());
            }

            // Validate the structure
            if (!isset($planContent['weeks']) || !is_array($planContent['weeks'])) {
                throw new \Exception('Invalid plan structure: missing weeks array');
            }

            // Update plan with generated content
            $this->plan->update([
                'status' => 'completed',
                'content' => $planContent,
                'ai_response' => $content,
                'ai_tokens_used' => $tokensUsed,
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
