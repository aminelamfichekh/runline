<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            // Section: Basic Information
            [
                'key' => 'email',
                'section' => 'basic_info',
                'order' => 1,
                'type' => 'email',
                'label' => 'Adresse email',
                'description' => 'Votre adresse email pour créer votre compte',
                'required' => true,
                'active' => true,
                'validation_rules' => ['email' => true, 'max' => 255],
            ],
            [
                'key' => 'first_name',
                'section' => 'basic_info',
                'order' => 2,
                'type' => 'text',
                'label' => 'Prénom',
                'description' => null,
                'required' => true,
                'active' => true,
                'validation_rules' => ['max' => 255],
            ],
            [
                'key' => 'last_name',
                'section' => 'basic_info',
                'order' => 3,
                'type' => 'text',
                'label' => 'Nom',
                'description' => null,
                'required' => true,
                'active' => true,
                'validation_rules' => ['max' => 255],
            ],
            [
                'key' => 'birth_date',
                'section' => 'basic_info',
                'order' => 4,
                'type' => 'date',
                'label' => 'Date de naissance',
                'description' => null,
                'required' => true,
                'active' => true,
                'validation_rules' => ['before' => 'today'],
            ],
            [
                'key' => 'gender',
                'section' => 'basic_info',
                'order' => 5,
                'type' => 'enum',
                'label' => 'Genre',
                'description' => null,
                'required' => true,
                'active' => true,
                'options' => [
                    ['value' => 'male', 'label' => 'Homme'],
                    ['value' => 'female', 'label' => 'Femme'],
                    ['value' => 'other', 'label' => 'Autre'],
                ],
            ],
            [
                'key' => 'height_cm',
                'section' => 'basic_info',
                'order' => 6,
                'type' => 'number',
                'label' => 'Taille (cm)',
                'description' => null,
                'required' => true,
                'active' => true,
                'validation_rules' => ['min' => 50, 'max' => 250, 'integer' => true],
            ],
            [
                'key' => 'weight_kg',
                'section' => 'basic_info',
                'order' => 7,
                'type' => 'number',
                'label' => 'Poids (kg)',
                'description' => null,
                'required' => true,
                'active' => true,
                'validation_rules' => ['min' => 20, 'max' => 300, 'integer' => true],
            ],

            // Section: Primary Goal
            [
                'key' => 'primary_goal',
                'section' => 'goals',
                'order' => 10,
                'type' => 'enum',
                'label' => 'Objectif principal',
                'description' => 'Quel est votre objectif principal avec la course à pied ?',
                'required' => true,
                'active' => true,
                'options' => [
                    ['value' => 'me_lancer', 'label' => 'Me lancer dans la course à pied'],
                    ['value' => 'reprendre', 'label' => 'Reprendre la course à pied'],
                    ['value' => 'entretenir', 'label' => 'Entretenir ma forme'],
                    ['value' => 'ameliorer_condition', 'label' => 'Améliorer ma condition physique générale'],
                    ['value' => 'courir_race', 'label' => 'Courir un 5 km / 10 km / semi-marathon / marathon'],
                    ['value' => 'ameliorer_chrono', 'label' => 'Améliorer mon chrono sur 5 km / 10 km / semi-marathon / marathon'],
                    ['value' => 'autre', 'label' => 'Autres'],
                ],
                'other_field_key' => 'primary_goal_other',
            ],
            [
                'key' => 'primary_goal_other',
                'section' => 'goals',
                'order' => 11,
                'type' => 'textarea',
                'label' => 'Précisez votre objectif',
                'description' => null,
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'primary_goal',
                    'values' => ['autre'],
                ],
                'validation_rules' => ['max' => 500],
            ],

            // Section: Race Goal Details (conditional)
            [
                'key' => 'race_distance',
                'section' => 'race_goals',
                'order' => 20,
                'type' => 'enum',
                'label' => 'Distance de course',
                'description' => null,
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'primary_goal',
                    'values' => ['courir_race', 'ameliorer_chrono'],
                ],
                'options' => [
                    ['value' => '5km', 'label' => '5 km'],
                    ['value' => '10km', 'label' => '10 km'],
                    ['value' => 'semi_marathon', 'label' => 'Semi-marathon'],
                    ['value' => 'marathon', 'label' => 'Marathon'],
                ],
            ],
            [
                'key' => 'target_race_date',
                'section' => 'race_goals',
                'order' => 21,
                'type' => 'date',
                'label' => 'Date de la course cible',
                'description' => null,
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'primary_goal',
                    'values' => ['courir_race', 'ameliorer_chrono'],
                ],
                'validation_rules' => ['after' => 'today'],
            ],
            [
                'key' => 'intermediate_objectives',
                'section' => 'race_goals',
                'order' => 22,
                'type' => 'textarea',
                'label' => 'Objectif(s) intermédiaire(s)',
                'description' => null,
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'primary_goal',
                    'values' => ['courir_race', 'ameliorer_chrono'],
                ],
                'validation_rules' => ['max' => 1000],
            ],
            [
                'key' => 'current_race_times',
                'section' => 'race_goals',
                'order' => 23,
                'type' => 'multi_object',
                'label' => 'Chronos actuels',
                'description' => 'Vos meilleurs temps sur différentes distances',
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'primary_goal',
                    'values' => ['courir_race', 'ameliorer_chrono'],
                ],
            ],

            // Section: Current Running Status
            [
                'key' => 'current_weekly_volume_km',
                'section' => 'running_status',
                'order' => 30,
                'type' => 'number',
                'label' => 'Volume hebdomadaire actuel (km)',
                'description' => null,
                'required' => true,
                'active' => true,
                'validation_rules' => ['min' => 0, 'max' => 100, 'multiple_of' => 5, 'integer' => true],
            ],
            [
                'key' => 'current_runs_per_week',
                'section' => 'running_status',
                'order' => 31,
                'type' => 'enum',
                'label' => 'Nombre de sorties par semaine',
                'description' => null,
                'required' => true,
                'active' => true,
                'options' => [
                    ['value' => '0', 'label' => 'Pas du tout'],
                    ['value' => '1_2', 'label' => '1-2 fois'],
                    ['value' => '3_4', 'label' => '3-4 fois'],
                    ['value' => '5_6', 'label' => '5-6 fois'],
                    ['value' => '7_plus', 'label' => '7 fois ou plus'],
                ],
            ],
            [
                'key' => 'available_days',
                'section' => 'running_status',
                'order' => 32,
                'type' => 'multi_select',
                'label' => 'Jours disponibles pour l\'entraînement',
                'description' => null,
                'required' => true,
                'active' => true,
                'options' => [
                    ['value' => 'monday', 'label' => 'Lundi'],
                    ['value' => 'tuesday', 'label' => 'Mardi'],
                    ['value' => 'wednesday', 'label' => 'Mercredi'],
                    ['value' => 'thursday', 'label' => 'Jeudi'],
                    ['value' => 'friday', 'label' => 'Vendredi'],
                    ['value' => 'saturday', 'label' => 'Samedi'],
                    ['value' => 'sunday', 'label' => 'Dimanche'],
                ],
                'validation_rules' => ['min_selections' => 1],
            ],

            // Section: Running Experience
            [
                'key' => 'running_experience_period',
                'section' => 'experience',
                'order' => 40,
                'type' => 'enum',
                'label' => 'Expérience en course à pied',
                'description' => null,
                'required' => true,
                'active' => true,
                'options' => [
                    ['value' => 'je_commence', 'label' => 'Je commence'],
                    ['value' => '1_11_mois', 'label' => '1 mois à 11 mois'],
                    ['value' => '1_10_ans', 'label' => '1 an à 10 ans'],
                    ['value' => 'plus_10_ans', 'label' => 'Plus de 10 ans'],
                ],
            ],

            // Section: Problem to Solve
            [
                'key' => 'problem_to_solve',
                'section' => 'problems',
                'order' => 50,
                'type' => 'enum',
                'label' => 'Problème à résoudre',
                'description' => null,
                'required' => false,
                'active' => true,
                'options' => [
                    ['value' => 'structure', 'label' => 'Besoin de structure'],
                    ['value' => 'blessure', 'label' => 'Retour de blessure'],
                    ['value' => 'motivation', 'label' => 'Motivation'],
                    ['value' => 'autre', 'label' => 'Autre'],
                ],
                'other_field_key' => 'problem_to_solve_other',
            ],
            [
                'key' => 'problem_to_solve_other',
                'section' => 'problems',
                'order' => 51,
                'type' => 'textarea',
                'label' => 'Précisez le problème',
                'description' => null,
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'problem_to_solve',
                    'values' => ['autre'],
                ],
                'validation_rules' => ['max' => 500],
            ],
            [
                'key' => 'injuries',
                'section' => 'problems',
                'order' => 52,
                'type' => 'multi_text',
                'label' => 'Blessures et limitations',
                'description' => 'Listez vos blessures ou limitations actuelles',
                'required' => false,
                'active' => true,
            ],

            // Section: Training Locations
            [
                'key' => 'training_locations',
                'section' => 'training',
                'order' => 60,
                'type' => 'multi_select',
                'label' => 'Lieux d\'entraînement',
                'description' => null,
                'required' => true,
                'active' => true,
                'options' => [
                    ['value' => 'route', 'label' => 'Route'],
                    ['value' => 'chemins', 'label' => 'Chemins'],
                    ['value' => 'piste', 'label' => 'Piste'],
                    ['value' => 'tapis', 'label' => 'Tapis de course'],
                    ['value' => 'autre', 'label' => 'Autre'],
                ],
                'other_field_key' => 'training_location_other',
                'validation_rules' => ['min_selections' => 1],
            ],
            [
                'key' => 'training_location_other',
                'section' => 'training',
                'order' => 61,
                'type' => 'text',
                'label' => 'Précisez le lieu d\'entraînement',
                'description' => null,
                'required' => false,
                'active' => true,
                'conditional_logic' => [
                    'depends_on' => 'training_locations',
                    'values' => ['autre'],
                ],
                'validation_rules' => ['max' => 255],
            ],

            // Section: Additional Context
            [
                'key' => 'equipment',
                'section' => 'additional',
                'order' => 70,
                'type' => 'textarea',
                'label' => 'Équipement',
                'description' => 'Chaussures, ceinture cardio, montre GPS...',
                'required' => false,
                'active' => true,
                'validation_rules' => ['max' => 1000],
            ],
            [
                'key' => 'personal_constraints',
                'section' => 'additional',
                'order' => 71,
                'type' => 'textarea',
                'label' => 'Contraintes personnelles/professionnelles',
                'description' => 'Travail de nuit, garde d\'enfants...',
                'required' => false,
                'active' => true,
                'validation_rules' => ['max' => 1000],
            ],
        ];

        foreach ($questions as $questionData) {
            Question::updateOrCreate(
                ['key' => $questionData['key']],
                $questionData
            );
        }

        $this->command->info('Questions seeded successfully!');
    }
}

