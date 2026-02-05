<?php
/**
 * Script pour vérifier que tous les endpoints API fonctionnent
 * Usage: php verify_api_endpoints.php
 * 
 * Assurez-vous que le serveur Laravel est en cours d'exécution:
 * php artisan serve
 */

$baseUrl = 'http://localhost:8000/api';

echo "========================================\n";
echo "  VÉRIFICATION DES ENDPOINTS API\n";
echo "  EMRUN BACKEND\n";
echo "========================================\n\n";

$errors = [];
$success = [];
$testToken = null;
$testUserId = null;

// Fonction helper pour faire des requêtes HTTP
function makeRequest($method, $url, $data = null, $token = null) {
    $ch = curl_init();
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
    ];
    
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 10,
    ]);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => 0];
    }
    
    return [
        'http_code' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response,
    ];
}

// Test 1: Inscription
echo "1. Test POST /api/auth/register...\n";
$testEmail = 'test_' . time() . '@emrun.test';
$registerData = [
    'name' => 'Test User API',
    'email' => $testEmail,
    'password' => 'TestPassword123!',
    'password_confirmation' => 'TestPassword123!',
];

$result = makeRequest('POST', $baseUrl . '/auth/register', $registerData);

if ($result['http_code'] === 201 || $result['http_code'] === 200) {
    if (isset($result['data']['access_token'])) {
        $testToken = $result['data']['access_token'];
        $success[] = "Inscription API réussie";
        echo "   ✅ Inscription réussie\n";
        echo "   ✅ Token JWT reçu\n";
        if (isset($result['data']['user']['id'])) {
            $testUserId = $result['data']['user']['id'];
        }
    } else {
        $errors[] = "Inscription réussie mais pas de token";
        echo "   ⚠️  Pas de token dans la réponse\n";
    }
} else {
    $errors[] = "Inscription échouée: HTTP {$result['http_code']}";
    echo "   ❌ Erreur HTTP {$result['http_code']}\n";
    if (isset($result['data']['message'])) {
        echo "   Message: " . $result['data']['message'] . "\n";
    }
}
echo "\n";

// Test 2: Connexion
echo "2. Test POST /api/auth/login...\n";
$loginData = [
    'email' => $testEmail,
    'password' => 'TestPassword123!',
];

$result = makeRequest('POST', $baseUrl . '/auth/login', $loginData);

if ($result['http_code'] === 200) {
    if (isset($result['data']['access_token'])) {
        $testToken = $result['data']['access_token'];
        $success[] = "Connexion API réussie";
        echo "   ✅ Connexion réussie\n";
        echo "   ✅ Token JWT reçu\n";
    } else {
        $errors[] = "Connexion réussie mais pas de token";
        echo "   ⚠️  Pas de token dans la réponse\n";
    }
} else {
    $errors[] = "Connexion échouée: HTTP {$result['http_code']}";
    echo "   ❌ Erreur HTTP {$result['http_code']}\n";
    if (isset($result['data']['message'])) {
        echo "   Message: " . $result['data']['message'] . "\n";
    }
}
echo "\n";

if (!$testToken) {
    echo "⚠️  Impossible de continuer les tests sans token. Vérifiez que le serveur est en cours d'exécution.\n";
    echo "   Lancez: php artisan serve\n\n";
    exit(1);
}

// Test 3: Récupérer l'utilisateur connecté
echo "3. Test GET /api/auth/me...\n";
$result = makeRequest('GET', $baseUrl . '/auth/me', null, $testToken);

if ($result['http_code'] === 200) {
    $success[] = "GET /api/auth/me fonctionne";
    echo "   ✅ Utilisateur récupéré\n";
    if (isset($result['data']['user'])) {
        echo "   ✅ Nom: " . ($result['data']['user']['name'] ?? 'N/A') . "\n";
        echo "   ✅ Email: " . ($result['data']['user']['email'] ?? 'N/A') . "\n";
    }
} else {
    $errors[] = "GET /api/auth/me échoué: HTTP {$result['http_code']}";
    echo "   ❌ Erreur HTTP {$result['http_code']}\n";
}
echo "\n";

// Test 4: Récupérer le profil (vide au début)
echo "4. Test GET /api/profile...\n";
$result = makeRequest('GET', $baseUrl . '/profile', null, $testToken);

if ($result['http_code'] === 200) {
    $success[] = "GET /api/profile fonctionne";
    echo "   ✅ Profil récupéré\n";
    if (isset($result['data']['profile'])) {
        echo "   ✅ Profil existe\n";
    } else {
        echo "   ℹ️  Profil vide (normal si questionnaire non complété)\n";
    }
} else {
    $errors[] = "GET /api/profile échoué: HTTP {$result['http_code']}";
    echo "   ❌ Erreur HTTP {$result['http_code']}\n";
}
echo "\n";

// Test 5: Mettre à jour le profil (questionnaire complet)
echo "5. Test PUT /api/profile (questionnaire complet)...\n";
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

$result = makeRequest('PUT', $baseUrl . '/profile', $profileData, $testToken);

if ($result['http_code'] === 200) {
    $success[] = "PUT /api/profile fonctionne";
    echo "   ✅ Profil mis à jour\n";
    if (isset($result['data']['questionnaire_completed'])) {
        $completed = $result['data']['questionnaire_completed'] ? 'Oui' : 'Non';
        echo "   ✅ Questionnaire complété: {$completed}\n";
    }
    if (isset($result['data']['profile'])) {
        $profile = $result['data']['profile'];
        echo "   ✅ Données sauvegardées:\n";
        echo "      - Nom: {$profile['first_name']} {$profile['last_name']}\n";
        echo "      - Objectif: {$profile['primary_goal']}\n";
        echo "      - Distance: {$profile['race_distance']}\n";
    }
} else {
    $errors[] = "PUT /api/profile échoué: HTTP {$result['http_code']}";
    echo "   ❌ Erreur HTTP {$result['http_code']}\n";
    if (isset($result['data']['message'])) {
        echo "   Message: " . $result['data']['message'] . "\n";
    }
    if (isset($result['data']['errors'])) {
        echo "   Erreurs de validation:\n";
        foreach ($result['data']['errors'] as $field => $messages) {
            echo "      - {$field}: " . implode(', ', $messages) . "\n";
        }
    }
}
echo "\n";

// Test 6: Vérifier que le profil est bien sauvegardé
echo "6. Test GET /api/profile (après mise à jour)...\n";
$result = makeRequest('GET', $baseUrl . '/profile', null, $testToken);

if ($result['http_code'] === 200 && isset($result['data']['profile'])) {
    $profile = $result['data']['profile'];
    if ($profile['first_name'] === 'John' && $profile['last_name'] === 'Doe') {
        $success[] = "Profil correctement sauvegardé et récupéré";
        echo "   ✅ Profil récupéré avec succès\n";
        echo "   ✅ Données persistées correctement\n";
        echo "   ✅ Questionnaire complété: " . ($result['data']['questionnaire_completed'] ? 'Oui' : 'Non') . "\n";
    } else {
        $errors[] = "Données du profil incorrectes";
        echo "   ❌ Données ne correspondent pas\n";
    }
} else {
    $errors[] = "Récupération profil après mise à jour échouée";
    echo "   ❌ Erreur\n";
}
echo "\n";

// Test 7: Rafraîchir le token
echo "7. Test POST /api/auth/refresh...\n";
// Note: Pour ce test, vous auriez besoin du refresh_token, qui n'est pas stocké ici
echo "   ⏭️  Skippé (nécessite refresh_token)\n\n";

// Test 8: Déconnexion
echo "8. Test POST /api/auth/logout...\n";
$result = makeRequest('POST', $baseUrl . '/auth/logout', null, $testToken);

if ($result['http_code'] === 200) {
    $success[] = "Déconnexion API fonctionne";
    echo "   ✅ Déconnexion réussie\n";
} else {
    $errors[] = "Déconnexion échouée: HTTP {$result['http_code']}";
    echo "   ❌ Erreur HTTP {$result['http_code']}\n";
}
echo "\n";

// Résumé
echo "========================================\n";
echo "  RÉSUMÉ DES TESTS API\n";
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
    echo "\n🎉 Tous les tests API sont passés!\n";
}

echo "\n";
echo "📝 Note: Assurez-vous que le serveur Laravel est en cours d'exécution:\n";
echo "   php artisan serve\n\n";

