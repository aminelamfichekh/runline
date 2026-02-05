<?php
/**
 * Script pour configurer MySQL automatiquement dans le .env
 * Usage: php configure_mysql.php
 */

$envPath = __DIR__ . '/.env';

if (!file_exists($envPath)) {
    echo "❌ Fichier .env non trouvé!\n";
    exit(1);
}

echo "========================================\n";
echo "  CONFIGURATION MYSQL POUR EMRUN\n";
echo "========================================\n\n";

// Lire le fichier .env
$envContent = file_get_contents($envPath);

// Demander les informations (avec valeurs par défaut basées sur HeidiSQL)
echo "Configuration MySQL (appuyez sur Entrée pour les valeurs par défaut):\n\n";

$host = readline("Host [127.0.0.1]: ") ?: '127.0.0.1';
$port = readline("Port [3306]: ") ?: '3306';
$database = readline("Nom de la base de données [emrun]: ") ?: 'emrun';
$username = readline("Username [root]: ") ?: 'root';
echo "Password (laisser vide si pas de mot de passe): ";
$password = readline() ?: '';

echo "\n";

// Mettre à jour DB_CONNECTION
$envContent = preg_replace('/^DB_CONNECTION=.*/m', 'DB_CONNECTION=mysql', $envContent);

// Mettre à jour ou ajouter DB_HOST
if (preg_match('/^DB_HOST=/m', $envContent)) {
    $envContent = preg_replace('/^DB_HOST=.*/m', "DB_HOST={$host}", $envContent);
} else {
    $envContent = preg_replace('/^(DB_CONNECTION=mysql.*)$/m', "$1\nDB_HOST={$host}", $envContent);
}

// Mettre à jour ou ajouter DB_PORT
if (preg_match('/^DB_PORT=/m', $envContent)) {
    $envContent = preg_replace('/^DB_PORT=.*/m', "DB_PORT={$port}", $envContent);
} else {
    $envContent = preg_replace('/^(DB_HOST=.*)$/m', "$1\nDB_PORT={$port}", $envContent);
}

// Mettre à jour DB_DATABASE
if (preg_match('/^DB_DATABASE=/m', $envContent)) {
    $envContent = preg_replace('/^DB_DATABASE=.*/m', "DB_DATABASE={$database}", $envContent);
} else {
    $envContent = preg_replace('/^(DB_PORT=.*)$/m', "$1\nDB_DATABASE={$database}", $envContent);
}

// Mettre à jour ou ajouter DB_USERNAME
if (preg_match('/^DB_USERNAME=/m', $envContent)) {
    $envContent = preg_replace('/^DB_USERNAME=.*/m', "DB_USERNAME={$username}", $envContent);
} else {
    $envContent = preg_replace('/^(DB_DATABASE=.*)$/m', "$1\nDB_USERNAME={$username}", $envContent);
}

// Mettre à jour ou ajouter DB_PASSWORD
if (preg_match('/^DB_PASSWORD=/m', $envContent)) {
    $envContent = preg_replace('/^DB_PASSWORD=.*/m', "DB_PASSWORD={$password}", $envContent);
} else {
    $envContent = preg_replace('/^(DB_USERNAME=.*)$/m', "$1\nDB_PASSWORD={$password}", $envContent);
}

// Supprimer les lignes SQLite si elles existent (commentaires)
$envContent = preg_replace('/^#.*SQLite.*$/m', '', $envContent);

// Sauvegarder
file_put_contents($envPath, $envContent);

echo "✅ Fichier .env mis à jour avec la configuration MySQL\n\n";

// Tester la connexion
echo "Test de connexion à MySQL...\n";

try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port}",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Connexion MySQL réussie\n\n";
} catch (PDOException $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "\n";
    echo "\nVérifiez:\n";
    echo "- MySQL est démarré (Apache/MySQL dans XAMPP)\n";
    echo "- Les informations de connexion sont correctes\n";
    echo "- La base de données '{$database}' existe (créez-la dans HeidiSQL)\n\n";
    exit(1);
}

// Vérifier si la base de données existe
try {
    $pdo->exec("USE `{$database}`");
    echo "✅ Base de données '{$database}' existe et est accessible\n\n";
} catch (PDOException $e) {
    echo "⚠️  Base de données '{$database}' n'existe pas encore\n";
    echo "Créez-la dans HeidiSQL:\n";
    echo "  - Nom: {$database}\n";
    echo "  - Charset: utf8mb4\n";
    echo "  - Collation: utf8mb4_unicode_ci\n\n";
    
    echo "Voulez-vous que je la crée maintenant? (y/n): ";
    $create = trim(readline());
    
    if (strtolower($create) === 'y') {
        try {
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo "✅ Base de données créée!\n\n";
        } catch (PDOException $e) {
            echo "❌ Erreur lors de la création: " . $e->getMessage() . "\n";
            echo "Créez-la manuellement dans HeidiSQL\n\n";
        }
    }
}

// Nettoyer le cache
echo "Nettoyage du cache Laravel...\n";
exec('php artisan config:clear', $output, $return);
echo "✅ Cache nettoyé\n\n";

// Demander si on veut exécuter les migrations
echo "Voulez-vous exécuter les migrations maintenant? (y/n): ";
$migrate = trim(readline());

if (strtolower($migrate) === 'y') {
    echo "\n⚠️  ATTENTION: migrate:fresh va supprimer toutes les tables existantes!\n";
    echo "Continuer? (y/n): ";
    $confirm = trim(readline());
    
    if (strtolower($confirm) === 'y') {
        echo "\nExécution des migrations...\n";
        exec('php artisan migrate:fresh', $output, $return);
        
        if ($return === 0) {
            echo "✅ Migrations exécutées avec succès!\n\n";
        } else {
            echo "❌ Erreur lors des migrations:\n";
            echo implode("\n", $output) . "\n\n";
        }
    } else {
        echo "Migrations annulées\n";
        echo "Exécutez manuellement: php artisan migrate\n\n";
    }
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

