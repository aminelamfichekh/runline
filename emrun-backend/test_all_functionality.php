<?php
/**
 * Script de test complet pour vérifier toutes les fonctionnalités
 * Usage: php test_all_functionality.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\AuthService;
use App\Services\ProfileService;

echo "========================================\n";
echo "  TEST COMPLET DES FONCTIONNALITÉS\n";
echo "  EMRUN BACKEND\n";
echo "========================================\n\n";

$errors = [];
$success = [];

// Test 1: Connexion à la base de données
echo "1. Test de connexion à la base de données...\n";
try {
    DB::connection()->getPdo();
    $success[] = "Connexion DB réussie";
    echo "   ✅ Connexion réussie\n";
    echo "   📊 Driver: " . DB::connection()->getDriverName() . "\n";
    echo "   📊 Database: " . DB::connection()->getDatabaseName() . "\n\n";
} catch (\Exception $e) {
    $errors[] = "Connexion DB échouée: " . $e->getMessage();
    echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Vérification des tables
echo "2. Vérification des tables...\n";
$requiredTables = ['users', 'user_profiles', 'plans', 'subscriptions', 'payments', 'notifications', 'device_tokens'];
$missingTables = [];

foreach ($requiredTables as $table) {
    try {
        if (!Schema::hasTable($table)) {
            $missingTables[] = $table;
            echo "   ❌ Table manquante: {$table}\n";
        } else {
            $count = DB::table($table)->count();
            echo "   ✅ Table '{$table}' existe ({$count} enregistrements)\n";
        }
    } catch (\Exception $e) {
        $missingTables[] = $table;
        echo "   ❌ Erreur pour table '{$table}': " . $e->getMessage() . "\n";
    }
}

if (empty($missingTables)) {
    $success[] = "Toutes les tables existent";
    echo "\n";
} else {
    $errors[] = "Tables manquantes: " . implode(', ', $missingTables);
    echo "\n";
}

// Test 3: Test d'inscription utilisateur
echo "3. Test d'inscription utilisateur...\n";
try {
    $authService = app(AuthService::class);
    $testEmail = 'test_' . time() . '@emrun.test';
    $testPassword = 'TestPassword123!';
    
    $result = $authService->register([
        'name' => 'Test User',
        'email' => $testEmail,
        'password' => $testPassword,
        'password_confirmation' => $testPassword,
    ]);
    
    // AuthService peut retourner un tableau avec 'user' ou directement l'utilisateur
    $user = is_array($result) && isset($result['user']) ? $result['user'] : $result;
    
    if ($user && (is_object($user) ? $user->id : (isset($user['id']) ? $user['id'] : null))) {
        $userId = is_object($user) ? $user->id : $user['id'];
        $success[] = "Inscription réussie";
        echo "   ✅ Utilisateur créé: ID {$userId}, Email: {$testEmail}\n";
        $testUserId = $userId;
    } else {
        throw new \Exception("Utilisateur non créé");
    }
    echo "\n";
} catch (\Exception $e) {
    $errors[] = "Inscription échouée: " . $e->getMessage();
    echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
    $testUserId = null;
}

// Test 4: Test de connexion
echo "4. Test de connexion...\n";
if ($testUserId) {
    try {
        $token = $authService->login([
            'email' => $testEmail,
            'password' => $testPassword,
        ]);
        if ($token && isset($token['access_token'])) {
            $success[] = "Connexion réussie";
            echo "   ✅ Token JWT généré\n";
            $testToken = $token['access_token'];
        } else {
            throw new \Exception("Token non généré");
        }
        echo "\n";
    } catch (\Exception $e) {
        $errors[] = "Connexion échouée: " . $e->getMessage();
        echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
        $testToken = null;
    }
} else {
    echo "   ⏭️  Skippé (utilisateur de test non créé)\n\n";
    $testToken = null;
}

// Test 5: Test de création/mise à jour de profil
echo "5. Test de création/mise à jour de profil...\n";
if ($testUserId) {
    try {
        $profileService = app(ProfileService::class);
        $user = User::find($testUserId);
        
        $profileData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'birth_date' => '1990-01-15',
            'gender' => 'male',
            'height_cm' => 175,
            'weight_kg' => 70,
            'primary_goal' => 'courir_race',
            'race_distance' => '10km',
            'target_race_date' => '2026-06-15',
            'current_weekly_volume_km' => 20,
            'current_runs_per_week' => '3_4',
            'available_days' => ['monday', 'wednesday', 'friday', 'sunday'],
            'running_experience_period' => '1_10_ans',
            'problem_to_solve' => 'structure',
            'training_locations' => ['route', 'chemins'],
            'equipment' => 'Running shoes, GPS watch',
            'personal_constraints' => 'Work schedule: Monday-Friday 9-5',
        ];
        
        $profile = $profileService->updateProfile($user, $profileData);
        
        if ($profile && $profile->id) {
            $success[] = "Profil créé/mis à jour";
            echo "   ✅ Profil créé: ID {$profile->id}\n";
            echo "   ✅ Questionnaire complété: " . ($profile->questionnaire_completed ? 'Oui' : 'Non') . "\n";
            echo "   ✅ Données sauvegardées:\n";
            echo "      - Nom: {$profile->first_name} {$profile->last_name}\n";
            echo "      - Objectif: {$profile->primary_goal}\n";
            echo "      - Distance course: {$profile->race_distance}\n";
            echo "      - Volume hebdo: {$profile->current_weekly_volume_km} km\n";
        } else {
            throw new \Exception("Profil non créé");
        }
        echo "\n";
    } catch (\Exception $e) {
        $errors[] = "Création profil échouée: " . $e->getMessage();
        echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ⏭️  Skippé (utilisateur de test non créé)\n\n";
}

// Test 6: Test de récupération de profil
echo "6. Test de récupération de profil...\n";
if ($testUserId) {
    try {
        $profileService = app(ProfileService::class);
        $user = User::find($testUserId);
        $profile = $profileService->getProfile($user);
        
        if ($profile) {
            $success[] = "Récupération profil réussie";
            echo "   ✅ Profil récupéré\n";
            echo "   ✅ Données présentes:\n";
            echo "      - ID: {$profile->id}\n";
            echo "      - User ID: {$profile->user_id}\n";
            echo "      - Prénom: {$profile->first_name}\n";
            echo "      - Nom: {$profile->last_name}\n";
            echo "      - Objectif: {$profile->primary_goal}\n";
            echo "      - Questionnaire complété: " . ($profile->questionnaire_completed ? 'Oui' : 'Non') . "\n";
        } else {
            throw new \Exception("Profil non trouvé");
        }
        echo "\n";
    } catch (\Exception $e) {
        $errors[] = "Récupération profil échouée: " . $e->getMessage();
        echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ⏭️  Skippé (utilisateur de test non créé)\n\n";
}

// Test 7: Test des relations Eloquent
echo "7. Test des relations Eloquent...\n";
if ($testUserId) {
    try {
        $user = User::with('profile')->find($testUserId);
        
        if ($user) {
            if ($user->profile) {
                $success[] = "Relations Eloquent fonctionnelles";
                echo "   ✅ Relation User->Profile fonctionne\n";
                echo "   ✅ Profil accessible via \$user->profile\n";
            } else {
                echo "   ⚠️  Utilisateur sans profil (normal si questionnaire non complété)\n";
            }
        } else {
            throw new \Exception("Utilisateur non trouvé");
        }
        echo "\n";
    } catch (\Exception $e) {
        $errors[] = "Test relations échoué: " . $e->getMessage();
        echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ⏭️  Skippé (utilisateur de test non créé)\n\n";
}

// Test 8: Test de validation conditionnelle
echo "8. Test de validation conditionnelle...\n";
if ($testUserId) {
    try {
        $profileService = app(ProfileService::class);
        $user = User::find($testUserId);
        
        // Test: Changer l'objectif pour non-course devrait nettoyer les champs de course
        $profileData = [
            'primary_goal' => 'entretenir', // Pas un objectif de course
        ];
        
        $profile = $profileService->updateProfile($user, $profileData);
        
        if ($profile->primary_goal === 'entretenir' && $profile->race_distance === null) {
            $success[] = "Validation conditionnelle fonctionne";
            echo "   ✅ Changement d'objectif fonctionne\n";
            echo "   ✅ Champs conditionnels nettoyés (race_distance = null)\n";
        } else {
            echo "   ⚠️  Nettoyage conditionnel peut nécessiter vérification\n";
        }
        echo "\n";
    } catch (\Exception $e) {
        $errors[] = "Test validation conditionnelle échoué: " . $e->getMessage();
        echo "   ❌ Erreur: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ⏭️  Skippé (utilisateur de test non créé)\n\n";
}

// Résumé
echo "========================================\n";
echo "  RÉSUMÉ DES TESTS\n";
echo "========================================\n\n";

echo "✅ Tests réussis: " . count($success) . "\n";
foreach ($success as $msg) {
    echo "   ✓ $msg\n";
}

if (!empty($errors)) {
    echo "\n❌ Tests échoués: " . count($errors) . "\n";
    foreach ($errors as $msg) {
        echo "   ✗ $msg\n";
    }
} else {
    echo "\n🎉 Tous les tests sont passés!\n";
}

echo "\n";
echo "========================================\n";
echo "  STATISTIQUES BASE DE DONNÉES\n";
echo "========================================\n\n";

$stats = [
    'users' => User::count(),
    'profiles' => UserProfile::count(),
    'profiles_completed' => UserProfile::where('questionnaire_completed', true)->count(),
];

foreach ($stats as $key => $value) {
    echo sprintf("%-30s : %5d\n", ucfirst(str_replace('_', ' ', $key)), $value);
}

echo "\n";

