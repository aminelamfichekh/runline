<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Vérification des tables contenant 'question'...\n\n";

try {
    $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
    $dbName = \Illuminate\Support\Facades\DB::getDatabaseName();
    $tableKey = "Tables_in_{$dbName}";
    
    $questionTables = [];
    foreach ($tables as $table) {
        $tableName = $table->$tableKey;
        if (stripos($tableName, 'question') !== false) {
            $questionTables[] = $tableName;
        }
    }
    
    if (empty($questionTables)) {
        echo "❌ Aucune table contenant 'question' trouvée.\n";
        echo "\nTables existantes liées au questionnaire:\n";
        foreach ($tables as $table) {
            $tableName = $table->$tableKey;
            if (stripos($tableName, 'questionnaire') !== false || 
                stripos($tableName, 'profile') !== false) {
                echo "  - {$tableName}\n";
            }
        }
    } else {
        echo "✅ Tables trouvées:\n";
        foreach ($questionTables as $table) {
            echo "  - {$table}\n";
            
            // Vérifier la structure
            $columns = \Illuminate\Support\Facades\Schema::getColumnListing($table);
            echo "    Colonnes: " . implode(', ', $columns) . "\n";
        }
    }
    
    echo "\n";
    echo "Recherche de modèles Question...\n";
    $modelFiles = glob(__DIR__ . '/app/Models/*Question*.php');
    if (empty($modelFiles)) {
        echo "❌ Aucun modèle Question trouvé.\n";
    } else {
        echo "✅ Modèles trouvés:\n";
        foreach ($modelFiles as $file) {
            echo "  - " . basename($file) . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}

