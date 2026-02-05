<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\QuestionnaireSession;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;

class QuestionnaireSessionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test création de session anonyme avec payload vide.
     */
    public function test_can_create_anonymous_session_with_empty_payload(): void
    {
        $response = $this->postJson('/api/questionnaire/sessions', [
            'payload' => [],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'session_uuid',
                    'session_id',
                ],
            ]);

        $this->assertDatabaseHas('questionnaire_sessions', [
            'completed' => false,
            'user_id' => null,
        ]);
    }

    /**
     * Test création de session avec email uniquement.
     */
    public function test_can_create_session_with_email_only(): void
    {
        $response = $this->postJson('/api/questionnaire/sessions', [
            'payload' => [
                'email' => 'test@example.com',
            ],
        ]);

        $response->assertStatus(201);
        
        $session = QuestionnaireSession::where('session_uuid', $response->json('data.session_uuid'))->first();
        $this->assertEquals('test@example.com', $session->payload['email']);
    }

    /**
     * Test création de session avec payload partiel.
     */
    public function test_can_create_session_with_partial_payload(): void
    {
        $response = $this->postJson('/api/questionnaire/sessions', [
            'payload' => [
                'email' => 'test@example.com',
                'first_name' => 'John',
                'last_name' => 'Doe',
            ],
        ]);

        $response->assertStatus(201);
        
        $session = QuestionnaireSession::where('session_uuid', $response->json('data.session_uuid'))->first();
        $this->assertEquals('John', $session->payload['first_name']);
        $this->assertEquals('Doe', $session->payload['last_name']);
    }

    /**
     * Test mise à jour de session avec merge (pas d'écrasement).
     */
    public function test_can_update_session_with_merge(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [
                'email' => 'test@example.com',
                'first_name' => 'John',
            ],
            'completed' => false,
        ]);

        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'last_name' => 'Doe',
            ],
        ]);

        $response->assertStatus(200);
        
        $session->refresh();
        $this->assertEquals('John', $session->payload['first_name']); // Préservé
        $this->assertEquals('Doe', $session->payload['last_name']); // Ajouté
    }

    /**
     * Test nettoyage automatique des champs dépendants.
     */
    public function test_cleans_dependent_fields_automatically(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [
                'primary_goal' => 'courir_race',
                'race_distance' => 'marathon',
                'target_race_date' => '2025-12-31',
            ],
            'completed' => false,
        ]);

        // Changer primary_goal vers un objectif non-course
        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'primary_goal' => 'entretenir',
            ],
        ]);

        $response->assertStatus(200);
        
        $session->refresh();
        $this->assertEquals('entretenir', $session->payload['primary_goal']);
        $this->assertArrayNotHasKey('race_distance', $session->payload);
        $this->assertArrayNotHasKey('target_race_date', $session->payload);
    }

    /**
     * Test nettoyage de primary_goal_other.
     */
    public function test_cleans_primary_goal_other_when_not_autre(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [
                'primary_goal' => 'autre',
                'primary_goal_other' => 'Mon objectif personnalisé',
            ],
            'completed' => false,
        ]);

        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'primary_goal' => 'entretenir',
            ],
        ]);

        $response->assertStatus(200);
        
        $session->refresh();
        $this->assertArrayNotHasKey('primary_goal_other', $session->payload);
    }

    /**
     * Test nettoyage de training_location_other.
     */
    public function test_cleans_training_location_other_when_autre_removed(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [
                'training_locations' => ['route', 'autre'],
                'training_location_other' => 'Mon lieu secret',
            ],
            'completed' => false,
        ]);

        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'training_locations' => ['route', 'piste'],
            ],
        ]);

        $response->assertStatus(200);
        
        $session->refresh();
        $this->assertArrayNotHasKey('training_location_other', $session->payload);
    }

    /**
     * Test validation partielle lors de l'update (types uniquement).
     */
    public function test_partial_validation_on_update(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [],
            'completed' => false,
        ]);

        // Type invalide doit être rejeté
        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'height_cm' => 'not-an-integer',
            ],
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test attach avec validation complète réussie.
     */
    public function test_attach_with_complete_validation_succeeds(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $session = QuestionnaireSession::create([
            'payload' => $this->getCompletePayload(),
            'completed' => false,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'profile',
                    'questionnaire_completed',
                ],
            ]);

        $this->assertTrue($response->json('data.questionnaire_completed'));
        
        // Vérifier que la session est attachée
        $session->refresh();
        $this->assertEquals($user->id, $session->user_id);
        $this->assertTrue($session->completed);
        
        // Vérifier que le profil est créé
        $profile = UserProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('John', $profile->first_name);
    }

    /**
     * Test attach avec payload incomplet échoue.
     */
    public function test_attach_with_incomplete_payload_fails(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $session = QuestionnaireSession::create([
            'payload' => [
                'first_name' => 'John',
                // Manque les autres champs requis
            ],
            'completed' => false,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
            ]);
    }

    /**
     * Test attach avec primary_goal course nécessite race_distance et target_race_date.
     */
    public function test_attach_race_goal_requires_race_fields(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $payload = $this->getCompletePayload();
        $payload['primary_goal'] = 'courir_race';
        unset($payload['race_distance']); // Manque race_distance

        $session = QuestionnaireSession::create([
            'payload' => $payload,
            'completed' => false,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(422)
            ->assertJsonValidationErrors('race_distance');
    }

    /**
     * Test attach déclenche la génération de plan à la première complétion.
     */
    public function test_attach_triggers_plan_generation_on_first_completion(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $session = QuestionnaireSession::create([
            'payload' => $this->getCompletePayload(),
            'completed' => false,
        ]);

        // Mock PlanGeneratorService pour vérifier qu'il est appelé
        $this->mock(\App\Services\PlanGeneratorService::class, function ($mock) use ($user) {
            $mock->shouldReceive('generateInitialPlan')
                ->once()
                ->with($user)
                ->andReturn(true);
        });

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(200);
    }

    /**
     * Test attach ne déclenche pas la génération si questionnaire déjà complété.
     */
    public function test_attach_does_not_trigger_plan_if_already_completed(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        // Créer un profil déjà complété
        UserProfile::create([
            'user_id' => $user->id,
            'questionnaire_completed' => true,
            'first_name' => 'Existing',
        ]);

        $session = QuestionnaireSession::create([
            'payload' => $this->getCompletePayload(),
            'completed' => false,
        ]);

        // Mock PlanGeneratorService - ne doit PAS être appelé
        $this->mock(\App\Services\PlanGeneratorService::class, function ($mock) {
            $mock->shouldNotReceive('generateInitialPlan');
        });

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(200);
    }

    /**
     * Test validation de current_weekly_volume_km multiple de 5.
     */
    public function test_attach_validates_weekly_volume_multiple_of_5(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $payload = $this->getCompletePayload();
        $payload['current_weekly_volume_km'] = 23; // Pas multiple de 5

        $session = QuestionnaireSession::create([
            'payload' => $payload,
            'completed' => false,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(422)
            ->assertJsonValidationErrors('current_weekly_volume_km');
    }

    /**
     * Test validation de training_location_other requis si "autre" présent.
     */
    public function test_attach_validates_training_location_other_when_autre_present(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $payload = $this->getCompletePayload();
        $payload['training_locations'] = ['route', 'autre'];
        unset($payload['training_location_other']); // Manque

        $session = QuestionnaireSession::create([
            'payload' => $payload,
            'completed' => false,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(422)
            ->assertJsonValidationErrors('training_location_other');
    }

    /**
     * Test qu'on ne peut pas update une session déjà attachée.
     */
    public function test_cannot_update_attached_session(): void
    {
        $user = User::factory()->create();
        $session = QuestionnaireSession::create([
            'payload' => ['first_name' => 'John'],
            'completed' => true,
            'user_id' => $user->id,
        ]);

        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => ['last_name' => 'Doe'],
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test qu'on ne peut pas attacher une session à un autre utilisateur.
     */
    public function test_cannot_attach_session_to_different_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $token2 = JWTAuth::fromUser($user2);

        $session = QuestionnaireSession::create([
            'payload' => $this->getCompletePayload(),
            'completed' => true,
            'user_id' => $user1->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token2}")
            ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

        $response->assertStatus(403);
    }

    /**
     * Test flow complet : questionnaire anonyme → signup avec session_uuid → attach automatique → profil complet.
     */
    public function test_complete_flow_questionnaire_to_signup_to_attach(): void
    {
        // 1. Créer une session anonyme avec questionnaire complet
        $sessionResponse = $this->postJson('/api/questionnaire/sessions', [
            'payload' => $this->getCompletePayload(),
        ]);

        $sessionResponse->assertStatus(201);
        $sessionUuid = $sessionResponse->json('data.session_uuid');

        // Vérifier que la session est créée et anonyme
        $session = QuestionnaireSession::where('session_uuid', $sessionUuid)->first();
        $this->assertNotNull($session);
        $this->assertNull($session->user_id);
        $this->assertFalse($session->completed);

        // 2. S'inscrire avec le session_uuid
        $signupResponse = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'session_uuid' => $sessionUuid,
        ]);

        $signupResponse->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user',
                    'access_token',
                    'refresh_token',
                ],
            ]);

        // Vérifier que l'utilisateur est créé
        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);

        // 3. Vérifier que la session est automatiquement attachée
        $session->refresh();
        $this->assertEquals($user->id, $session->user_id);
        $this->assertTrue($session->completed);

        // 4. Vérifier que le profil est créé avec toutes les données
        $profile = UserProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertTrue($profile->questionnaire_completed);
        $this->assertEquals('John', $profile->first_name);
        $this->assertEquals('Doe', $profile->last_name);
        $this->assertEquals(180, $profile->height_cm);
        $this->assertEquals(75, $profile->weight_kg);
        $this->assertEquals('entretenir', $profile->primary_goal);
    }

    /**
     * Test signup avec session_uuid mais questionnaire incomplet - l'inscription réussit mais l'attach échoue silencieusement.
     */
    public function test_signup_with_incomplete_questionnaire_does_not_fail_registration(): void
    {
        // Créer une session avec payload incomplet
        $session = QuestionnaireSession::create([
            'payload' => [
                'email' => 'test@example.com',
                'first_name' => 'John',
                // Manque les autres champs requis
            ],
            'completed' => false,
        ]);

        // S'inscrire avec le session_uuid
        $signupResponse = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'session_uuid' => $session->session_uuid,
        ]);

        // L'inscription doit réussir même si le questionnaire est incomplet
        $signupResponse->assertStatus(201);

        // Vérifier que l'utilisateur est créé
        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);

        // La session ne doit PAS être attachée (questionnaire incomplet)
        $session->refresh();
        $this->assertNull($session->user_id);

        // Le profil ne doit pas être créé
        $profile = UserProfile::where('user_id', $user->id)->first();
        $this->assertNull($profile);
    }

    /**
     * Test signup avec session_uuid mais email différent - l'inscription réussit mais l'attach est ignoré.
     */
    public function test_signup_with_different_email_ignores_session_attach(): void
    {
        // Créer une session avec un email
        $session = QuestionnaireSession::create([
            'payload' => array_merge($this->getCompletePayload(), [
                'email' => 'session@example.com',
            ]),
            'completed' => false,
        ]);

        // S'inscrire avec un email différent
        $signupResponse = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'different@example.com', // Email différent
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'session_uuid' => $session->session_uuid,
        ]);

        $signupResponse->assertStatus(201);

        // Vérifier que l'utilisateur est créé
        $user = User::where('email', 'different@example.com')->first();
        $this->assertNotNull($user);

        // La session ne doit PAS être attachée (email différent)
        $session->refresh();
        $this->assertNull($session->user_id);
    }

    /**
     * Test merge des tableaux avec fusion intelligente (pas d'écrasement).
     */
    public function test_merge_arrays_without_overwriting(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [
                'available_days' => ['monday', 'wednesday'],
                'training_locations' => ['route'],
            ],
            'completed' => false,
        ]);

        // Mettre à jour avec une mise à jour partielle (ajout de valeurs)
        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'available_days' => ['friday'], // Ajout partiel
                'training_locations' => ['piste'], // Ajout partiel
            ],
        ]);

        $response->assertStatus(200);

        $session->refresh();
        // Les valeurs doivent être fusionnées, pas écrasées
        $this->assertContains('monday', $session->payload['available_days']);
        $this->assertContains('wednesday', $session->payload['available_days']);
        $this->assertContains('friday', $session->payload['available_days']);
        $this->assertContains('route', $session->payload['training_locations']);
        $this->assertContains('piste', $session->payload['training_locations']);
        
        // Vérifier qu'il n'y a pas de doublons
        $this->assertEquals(3, count($session->payload['available_days']));
        $this->assertEquals(2, count($session->payload['training_locations']));
    }

    /**
     * Test merge des tableaux avec doublons supprimés.
     */
    public function test_merge_arrays_removes_duplicates(): void
    {
        $session = QuestionnaireSession::create([
            'payload' => [
                'available_days' => ['monday', 'wednesday'],
            ],
            'completed' => false,
        ]);

        // Mettre à jour avec des valeurs qui se chevauchent
        $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
            'payload' => [
                'available_days' => ['monday', 'friday'], // monday est en doublon
            ],
        ]);

        $response->assertStatus(200);

        $session->refresh();
        // monday ne doit apparaître qu'une fois
        $this->assertEquals(3, count($session->payload['available_days']));
        $this->assertCount(3, array_unique($session->payload['available_days']));
        $this->assertContains('monday', $session->payload['available_days']);
        $this->assertContains('wednesday', $session->payload['available_days']);
        $this->assertContains('friday', $session->payload['available_days']);
    }

    /**
     * Retourne un payload complet valide pour les tests.
     */
    protected function getCompletePayload(): array
    {
        return [
            'email' => 'test@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'birth_date' => '1990-01-15',
            'gender' => 'male',
            'height_cm' => 180,
            'weight_kg' => 75,
            'primary_goal' => 'entretenir',
            'current_weekly_volume_km' => 30,
            'current_runs_per_week' => '3_4',
            'available_days' => ['monday', 'wednesday', 'friday'],
            'running_experience_period' => '1_10_ans',
            'training_locations' => ['route', 'piste'],
        ];
    }
}

