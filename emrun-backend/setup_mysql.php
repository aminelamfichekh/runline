<?php
/**
 * Script pour configurer MySQL automatiquement
 * Usage: php setup_mysql.php
 * 
 * Ce script va:
 * 1. Demander les informations MySQL
 * 2. Créer la base de données
 * 3. Mettre à jour le .env
 * 4. Exécuter les migrations
 */

require __DIR__.'/vendor/autoload.php';

echo "========================================\n";
echo "  CONFIGURATION MYSQL POUR EMRUN\n";
echo "========================================\n\n";

// Lire le fichier .env actuel
$envPath = __DIR__ . '/.env';
if (!file_exists($envPath)) {
    echo "❌ Fichier .env non trouvé!\n";
    exit(1);
}

$envContent = file_get_contents($envPath);

// Demander les informations MySQL
echo "Entrez les informations MySQL:\n\n";

$host = readline("Host [127.0.0.1]: ") ?: '127.0.0.1';
$port = readline("Port [3306]: ") ?: '3306';
$database = readline("Nom de la base de données [emrun]: ") ?: 'emrun';
$username = readline("Username [root]: ") ?: 'root';
$password = readline("Password: ");

echo "\n";

// Tester la connexion MySQL
try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port}",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Connexion MySQL réussie\n\n";
} catch (PDOException $e) {
    echo "❌ Erreur de connexion MySQL: " . $e->getMessage() . "\n";
    exit(1);
}

// Créer la base de données
try {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Base de données '{$database}' créée ou existe déjà\n\n";
} catch (PDOException $e) {
    echo "❌ Erreur lors de la création de la base de données: " . $e->getMessage() . "\n";
    exit(1);
}

// Mettre à jour le fichier .env
$newEnvContent = preg_replace(
    '/^DB_CONNECTION=.*/m',
    "DB_CONNECTION=mysql",
    $envContent
);

$newEnvContent = preg_replace(
    '/^DB_HOST=.*/m',
    "DB_HOST={$host}",
    $newEnvContent
);

$newEnvContent = preg_replace(
    '/^DB_PORT=.*/m',
    "DB_PORT={$port}",
    $newEnvContent
);

$newEnvContent = preg_replace(
    '/^DB_DATABASE=.*/m',
    "DB_DATABASE={$database}",
    $newEnvContent
);

$newEnvContent = preg_replace(
    '/^DB_USERNAME=.*/m',
    "DB_USERNAME={$username}",
    $newEnvContent
);

$newEnvContent = preg_replace(
    '/^DB_PASSWORD=.*/m',
    "DB_PASSWORD={$password}",
    $newEnvContent
);

// Supprimer la ligne DB_DATABASE pour SQLite si elle existe
$newEnvContent = preg_replace(
    '/^#.*SQLite.*\n/m',
    '',
    $newEnvContent
);

file_put_contents($envPath, $newEnvContent);
echo "✅ Fichier .env mis à jour\n\n";

// Nettoyer le cache de configuration
echo "Nettoyage du cache...\n";
exec('php artisan config:clear', $output, $return);
echo "✅ Cache nettoyé\n\n";

// Exécuter les migrations
echo "Voulez-vous exécuter les migrations maintenant? (y/n): ";
$answer = trim(readline());

if (strtolower($answer) === 'y') {
    echo "\nExécution des migrations...\n";
    echo "⚠️  ATTENTION: Cela va créer/supprimer toutes les tables!\n";
    echo "Continuer? (y/n): ";
    $confirm = trim(readline());
    
    if (strtolower($confirm) === 'y') {
        exec('php artisan migrate:fresh', $output, $return);
        if ($return === 0) {
            echo "✅ Migrations exécutées avec succès\n\n";
        } else {
            echo "❌ Erreur lors des migrations\n";
            echo implode("\n", $output) . "\n\n";
        }
    } else {
        echo "Migrations annulées\n\n";
    }
} else {
    echo "Migrations non exécutées\n";
    echo "Exécutez manuellement: php artisan migrate\n\n";
}

echo "========================================\n";
echo "  CONFIGURATION TERMINÉE\n";
echo "========================================\n\n";

echo "Prochaines étapes:\n";
echo "1. Vérifier la connexion: php artisan tinker\n";
echo "   >>> DB::connection()->getPdo();\n";
echo "2. Vérifier les tables: php check_tables.php\n";
echo "3. Tester les fonctionnalités: php test_all_functionality.php\n";
echo "4. Démarrer le serveur: php artisan serve\n\n";

