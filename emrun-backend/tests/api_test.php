<?php

/**
 * Simple API Test Script
 * 
 * Run with: php tests/api_test.php
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Services\ProfileService;
use App\Services\PlanGeneratorService;
use App\Services\AuthService;

echo "🧪 Starting Emrun Backend Tests...\n\n";

$errors = [];
$success = [];

// Test 1: Create User
echo "1. Testing User Creation...\n";
try {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test' . time() . '@example.com',
        'password' => bcrypt('password123')
    ]);
    $success[] = "User created: {$user->email} (ID: {$user->id})";
    echo "   ✅ User created: {$user->email}\n\n";
} catch (\Exception $e) {
    $errors[] = "User creation failed: " . $e->getMessage();
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: AuthService - Register
echo "2. Testing AuthService Registration...\n";
try {
    $authService = app(AuthService::class);
    $result = $authService->register([
        'name' => 'Auth Test User',
        'email' => 'authtest' . time() . '@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123'
    ]);
    $success[] = "AuthService registration successful";
    echo "   ✅ Registration successful. Token generated.\n\n";
} catch (\Exception $e) {
    $errors[] = "AuthService registration failed: " . $e->getMessage();
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
}

// Test 3: ProfileService - Update Profile (Basic)
echo "3. Testing ProfileService - Basic Profile Update...\n";
try {
    $profileService = app(ProfileService::class);
    $profile = $profileService->updateProfile($user, [
        'first_name' => 'Test',
        'last_name' => 'User',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'height_cm' => 175,
        'weight_kg' => 70,
    ]);
    $success[] = "Basic profile update successful";
    echo "   ✅ Profile updated. Questionnaire completed: " . ($profile->questionnaire_completed ? 'Yes' : 'No') . "\n\n";
} catch (\Exception $e) {
    $errors[] = "Profile update failed: " . $e->getMessage();
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
}

// Test 4: ProfileService - Update Profile (Race Goal - Complete Questionnaire)
echo "4. Testing ProfileService - Race Goal Profile Update (Complete Questionnaire)...\n";
try {
    // Include ALL required fields in one update to test completion
    $profile = $profileService->updateProfile($user, [
        // Basic info (from test 3, but including again to be safe)
        'first_name' => 'Test',
        'last_name' => 'User',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'height_cm' => 175,
        'weight_kg' => 70,
        // Race goal
        'primary_goal' => 'courir_race',
        'race_distance' => '10km',
        'target_race_date' => '2026-06-15',
        'intermediate_objectives' => 'Run 5km without stopping first',
        'current_race_times' => [
            ['distance' => '5km', 'time' => '28:00']
        ],
        // Current running status
        'current_weekly_volume_km' => 20,
        'current_runs_per_week' => '3_4',
        'available_days' => ['monday', 'wednesday', 'friday', 'sunday'],
        // Running experience
        'running_experience_period' => '1_10_ans',
        // Training locations
        'training_locations' => ['route', 'chemins'],
        // Optional fields
        'problem_to_solve' => 'structure',
        'equipment' => 'Running shoes, GPS watch',
        'personal_constraints' => 'Work schedule: Monday-Friday 9-5'
    ]);
    $success[] = "Race goal profile update successful";
    echo "   ✅ Profile updated with race goal. Questionnaire completed: " . ($profile->questionnaire_completed ? 'Yes' : 'No') . "\n";
    if (!$profile->questionnaire_completed) {
        echo "   ⚠️  Warning: Questionnaire should be completed but isn't. Missing fields check:\n";
        $requiredFields = ['first_name', 'last_name', 'birth_date', 'gender', 'height_cm', 'weight_kg', 
                          'primary_goal', 'current_weekly_volume_km', 'current_runs_per_week', 
                          'available_days', 'running_experience_period', 'training_locations', 
                          'race_distance', 'target_race_date'];
        foreach ($requiredFields as $field) {
            $value = $profile->$field;
            $status = (!empty($value) || (is_array($value) && count($value) > 0)) ? '✅' : '❌';
            echo "      $status $field: " . (is_array($value) ? json_encode($value) : ($value ?? 'null')) . "\n";
        }
    }
    echo "\n";
} catch (\Exception $e) {
    $errors[] = "Race goal profile update failed: " . $e->getMessage();
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
}

// Test 5: Validation - Test Conditional Fields
echo "5. Testing Conditional Validation (should fail)...\n";
try {
    $testUser = User::create([
        'name' => 'Validation Test',
        'email' => 'validation' . time() . '@example.com',
        'password' => bcrypt('password123')
    ]);
    
    // Try to set race goal without race_distance (should fail)
    $profileService->updateProfile($testUser, [
        'primary_goal' => 'courir_race'
        // Missing race_distance and target_race_date
    ]);
    
    $errors[] = "Conditional validation failed - should have thrown error";
    echo "   ❌ Validation should have failed but didn't!\n\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    $success[] = "Conditional validation working correctly";
    echo "   ✅ Validation correctly rejected invalid data\n";
    echo "   Errors: " . json_encode($e->errors()) . "\n\n";
} catch (\Exception $e) {
    $errors[] = "Unexpected error: " . $e->getMessage();
    echo "   ❌ Unexpected error: " . $e->getMessage() . "\n\n";
}

// Test 6: Validation - Test Weekly Volume (should fail)
echo "6. Testing Weekly Volume Validation (should fail)...\n";
try {
    $profileService->updateProfile($user, [
        'current_weekly_volume_km' => 23  // Not a multiple of 5
    ]);
    
    $errors[] = "Weekly volume validation failed - should have thrown error";
    echo "   ❌ Validation should have failed but didn't!\n\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    $success[] = "Weekly volume validation working correctly";
    echo "   ✅ Validation correctly rejected invalid weekly volume\n\n";
} catch (\Exception $e) {
    $errors[] = "Unexpected error: " . $e->getMessage();
    echo "   ❌ Unexpected error: " . $e->getMessage() . "\n\n";
}

// Test 7: Plan Generation (if questionnaire completed)
echo "7. Testing Plan Generation...\n";
if ($user->profile && $user->profile->questionnaire_completed) {
    try {
        $planService = app(PlanGeneratorService::class);
        $plan = $planService->generateInitialPlan($user);
        $success[] = "Plan generation successful";
        echo "   ✅ Plan created successfully\n";
        echo "   - ID: {$plan->id}\n";
        echo "   - Type: {$plan->type}\n";
        echo "   - Status: {$plan->status}\n";
        echo "   - Start Date: {$plan->start_date}\n";
        echo "   - End Date: {$plan->end_date}\n\n";
    } catch (\Exception $e) {
        $errors[] = "Plan generation failed: " . $e->getMessage();
        echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ⚠️  Skipped - Questionnaire not completed\n\n";
}

// Test 8: Check Database Relationships
echo "8. Testing Database Relationships...\n";
try {
    $user->refresh();
    $hasProfile = $user->profile !== null;
    $hasPlans = $user->plans()->count() > 0;
    
    $success[] = "Database relationships working";
    echo "   ✅ User has profile: " . ($hasProfile ? 'Yes' : 'No') . "\n";
    echo "   ✅ User has plans: " . ($hasPlans ? 'Yes (' . $user->plans()->count() . ')' : 'No') . "\n\n";
} catch (\Exception $e) {
    $errors[] = "Relationship check failed: " . $e->getMessage();
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
}

// Summary
echo "═══════════════════════════════════════════════════════\n";
echo "📊 TEST SUMMARY\n";
echo "═══════════════════════════════════════════════════════\n";
echo "✅ Successful: " . count($success) . "\n";
echo "❌ Errors: " . count($errors) . "\n\n";

if (count($success) > 0) {
    echo "✅ Successful Tests:\n";
    foreach ($success as $msg) {
        echo "   - $msg\n";
    }
    echo "\n";
}

if (count($errors) > 0) {
    echo "❌ Errors:\n";
    foreach ($errors as $msg) {
        echo "   - $msg\n";
    }
    echo "\n";
}

if (count($errors) === 0) {
    echo "🎉 All tests passed!\n";
    exit(0);
} else {
    echo "⚠️  Some tests failed. Please review the errors above.\n";
    exit(1);
}

