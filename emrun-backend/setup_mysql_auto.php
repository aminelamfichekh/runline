<?php
/**
 * Script automatique pour configurer MySQL
 * Crée la base de données et configure le .env automatiquement
 * Usage: php setup_mysql_auto.php
 */

$envPath = __DIR__ . '/.env';

if (!file_exists($envPath)) {
    echo "❌ Fichier .env non trouvé!\n";
    exit(1);
}

echo "========================================\n";
echo "  CONFIGURATION MYSQL AUTOMATIQUE\n";
echo "========================================\n\n";

// Configuration par défaut (basée sur votre HeidiSQL)
$config = [
    'host' => '127.0.0.1',
    'port' => '3306',
    'database' => 'emrun',
    'username' => 'root',
    'password' => '', // Pas de mot de passe par défaut
];

echo "Configuration utilisée:\n";
echo "  Host: {$config['host']}\n";
echo "  Port: {$config['port']}\n";
echo "  Database: {$config['database']}\n";
echo "  Username: {$config['username']}\n";
echo "  Password: " . (empty($config['password']) ? '(vide)' : '***') . "\n\n";

// Lire le fichier .env
$envContent = file_get_contents($envPath);

// Mettre à jour les paramètres MySQL dans .env
$envContent = preg_replace('/^DB_CONNECTION=.*/m', 'DB_CONNECTION=mysql', $envContent);
$envContent = preg_replace('/^DB_HOST=.*/m', "DB_HOST={$config['host']}", $envContent) ?: preg_replace('/^(DB_CONNECTION=mysql.*)$/m', "$1\nDB_HOST={$config['host']}", $envContent);
$envContent = preg_replace('/^DB_PORT=.*/m', "DB_PORT={$config['port']}", $envContent) ?: preg_replace('/^(DB_HOST=.*)$/m', "$1\nDB_PORT={$config['port']}", $envContent);
$envContent = preg_replace('/^DB_DATABASE=.*/m', "DB_DATABASE={$config['database']}", $envContent) ?: preg_replace('/^(DB_PORT=.*)$/m', "$1\nDB_DATABASE={$config['database']}", $envContent);
$envContent = preg_replace('/^DB_USERNAME=.*/m', "DB_USERNAME={$config['username']}", $envContent) ?: preg_replace('/^(DB_DATABASE=.*)$/m', "$1\nDB_USERNAME={$config['username']}", $envContent);
$envContent = preg_replace('/^DB_PASSWORD=.*/m', "DB_PASSWORD={$config['password']}", $envContent) ?: preg_replace('/^(DB_USERNAME=.*)$/m', "$1\nDB_PASSWORD={$config['password']}", $envContent);

// Sauvegarder
file_put_contents($envPath, $envContent);
echo "✅ Fichier .env mis à jour\n\n";

// Tester la connexion et créer la base de données
echo "Test de connexion MySQL...\n";

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};port={$config['port']}",
        $config['username'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Connexion MySQL réussie\n\n";
} catch (PDOException $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "\n";
    echo "\nVérifiez que:\n";
    echo "- MySQL est démarré (Apache/MySQL dans XAMPP)\n";
    echo "- Les informations de connexion sont correctes\n\n";
    exit(1);
}

// Créer la base de données si elle n'existe pas
echo "Vérification de la base de données '{$config['database']}'...\n";

try {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Base de données '{$config['database']}' existe ou a été créée\n\n";
} catch (PDOException $e) {
    echo "❌ Erreur lors de la création: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Nettoyer le cache Laravel
echo "Nettoyage du cache Laravel...\n";
exec('php artisan config:clear 2>&1', $output, $return);
exec('php artisan cache:clear 2>&1', $output2, $return2);
echo "✅ Cache nettoyé\n\n";

// Tester la connexion Laravel
echo "Test de connexion Laravel à MySQL...\n";

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "✅ Laravel peut se connecter à MySQL\n";
    echo "   Driver: " . \Illuminate\Support\Facades\DB::connection()->getDriverName() . "\n";
    echo "   Database: " . \Illuminate\Support\Facades\DB::connection()->getDatabaseName() . "\n\n";
} catch (\Exception $e) {
    echo "❌ Erreur de connexion Laravel: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Exécuter les migrations
echo "Exécution des migrations (création des tables)...\n";
exec('php artisan migrate:fresh --force 2>&1', $migrationOutput, $migrationReturn);

if ($migrationReturn === 0) {
    echo "✅ Migrations exécutées avec succès!\n";
    echo "   Toutes les tables ont été créées dans MySQL\n\n";
} else {
    echo "⚠️  Erreur lors des migrations:\n";
    echo implode("\n", array_slice($migrationOutput, -10)) . "\n\n";
    echo "Essayez manuellement: php artisan migrate:fresh\n\n";
}

echo "========================================\n";
echo "  CONFIGURATION TERMINÉE!\n";
echo "========================================\n\n";

echo "✅ MySQL est maintenant configuré et prêt à l'emploi\n\n";

echo "Vérifications:\n";
echo "1. Vérifier les tables: php check_tables.php\n";
echo "2. Tester les fonctionnalités: php test_all_functionality.php\n";
echo "3. Démarrer le serveur: php artisan serve\n\n";

