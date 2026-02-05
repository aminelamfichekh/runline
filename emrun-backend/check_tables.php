<?php
/**
 * Script simple pour vérifier les tables de la base de données
 * Usage: php check_tables.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "========================================\n";
echo "  VÉRIFICATION DES TABLES - EMRUN\n";
echo "========================================\n\n";

// Lister toutes les tables (compatible SQLite et PostgreSQL)
$connection = DB::connection()->getDriverName();
if ($connection === 'sqlite') {
    $tables = DB::select("SELECT name as table_name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
} else {
    $tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
}

echo "Tables dans la base de données:\n";
echo str_repeat("-", 50) . "\n";

foreach ($tables as $table) {
    $tableName = $table->table_name;
    try {
        $count = DB::table($tableName)->count();
        echo sprintf("%-30s : %5d enregistrements\n", $tableName, $count);
    } catch (\Exception $e) {
        echo sprintf("%-30s : ERREUR - %s\n", $tableName, $e->getMessage());
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Détails des tables principales:\n";
echo str_repeat("=", 50) . "\n\n";

// Détails pour les tables principales
$mainTables = ['users', 'user_profiles', 'plans', 'subscriptions', 'payments', 'notifications', 'device_tokens'];

foreach ($mainTables as $tableName) {
    if (in_array($tableName, array_column($tables, 'table_name'))) {
        echo "\n📋 Table: {$tableName}\n";
        echo str_repeat("-", 50) . "\n";
        
        // Colonnes
        try {
            $columns = Schema::getColumnListing($tableName);
            echo "Colonnes (" . count($columns) . "): " . implode(', ', $columns) . "\n";
        } catch (\Exception $e) {
            echo "Erreur lors de la récupération des colonnes: " . $e->getMessage() . "\n";
        }
        
        // Nombre d'enregistrements
        try {
            $count = DB::table($tableName)->count();
            echo "Enregistrements: {$count}\n";
            
            // Afficher quelques exemples si la table n'est pas vide
            if ($count > 0 && $count <= 5) {
                $records = DB::table($tableName)->limit(3)->get();
                echo "Exemples:\n";
                foreach ($records as $record) {
                    echo "  - " . json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
                }
            }
        } catch (\Exception $e) {
            echo "Erreur: " . $e->getMessage() . "\n";
        }
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "✅ Vérification terminée!\n";

