<?php

namespace App\Services;

/**
 * QuestionnairePayloadService
 * 
 * Service pour gérer la logique de merge et nettoyage des payloads de questionnaire.
 */
class QuestionnairePayloadService
{
    /**
     * Merge un nouveau payload avec un payload existant (sans écraser).
     * 
     * Pour les tableaux (available_days, training_locations, injuries),
     * on fusionne les valeurs existantes avec les nouvelles, sans doublons.
     * 
     * Comportement:
     * - Si le frontend envoie le tableau complet → OK (remplace l'existant)
     * - Si le frontend envoie une mise à jour partielle → fusionne avec l'existant
     * 
     * @param array $existingPayload
     * @param array $newPayload
     * @return array
     */
    public function mergePayload(array $existingPayload, array $newPayload): array
    {
        // Merge récursif : les nouvelles valeurs remplacent les anciennes
        // mais on préserve les clés existantes non présentes dans le nouveau payload
        $merged = array_merge($existingPayload, $newPayload);
        
        // Pour les tableaux spécifiques, fusionner intelligemment sans doublons
        // Cela permet de gérer à la fois les mises à jour complètes et partielles
        $arrayFields = ['available_days', 'training_locations', 'injuries'];
        
        foreach ($arrayFields as $field) {
            if (isset($newPayload[$field]) && is_array($newPayload[$field])) {
                // Fusionner l'existant avec le nouveau, puis supprimer les doublons
                $existing = $existingPayload[$field] ?? [];
                $new = $newPayload[$field];
                
                // Fusionner les deux tableaux et supprimer les doublons
                $merged[$field] = array_values(array_unique(
                    array_merge($existing, $new)
                ));
            } elseif (isset($existingPayload[$field]) && is_array($existingPayload[$field])) {
                // Préserver l'existant si pas de nouvelle valeur
                $merged[$field] = array_values(array_unique($existingPayload[$field]));
            }
        }
        
        return $merged;
    }

    /**
     * Nettoie les champs dépendants selon les règles métier.
     * 
     * @param array $payload
     * @return array
     */
    public function cleanDependentFields(array $payload): array
    {
        // Si primary_goal n'est pas une course, nettoyer les champs de course
        if (isset($payload['primary_goal']) && !in_array($payload['primary_goal'], ['courir_race', 'ameliorer_chrono'])) {
            unset($payload['race_distance']);
            unset($payload['race_distance_km']);
            unset($payload['race_distance_other']);
            unset($payload['target_race_date']);
            unset($payload['intermediate_objectives']);
        }
        if (isset($payload['race_distance']) && $payload['race_distance'] !== 'autre') {
            unset($payload['race_distance_km']);
            unset($payload['race_distance_other']);
        }
        
        // Si primary_goal n'est pas "autre", nettoyer primary_goal_other
        if (isset($payload['primary_goal']) && $payload['primary_goal'] !== 'autre') {
            unset($payload['primary_goal_other']);
        }
        
        // Si problem_to_solve n'est pas "autre", nettoyer problem_to_solve_other
        if (isset($payload['problem_to_solve']) && $payload['problem_to_solve'] !== 'autre') {
            unset($payload['problem_to_solve_other']);
        }
        
        // Si "autre" n'est pas dans training_locations, nettoyer training_location_other
        $trainingLocations = $payload['training_locations'] ?? [];
        if (!is_array($trainingLocations) || !in_array('autre', $trainingLocations)) {
            unset($payload['training_location_other']);
        }
        
        return $payload;
    }

    /**
     * Prépare le payload pour l'attach (extrait du payload et nettoie).
     * 
     * @param array $sessionPayload
     * @return array
     */
    public function preparePayloadForAttach(array $sessionPayload): array
    {
        // Retirer l'email du payload (il est dans users, pas dans user_profiles)
        $prepared = $sessionPayload;
        unset($prepared['email']);
        
        // Nettoyer les champs dépendants
        $prepared = $this->cleanDependentFields($prepared);
        
        // S'assurer que questionnaire_completed est true
        $prepared['questionnaire_completed'] = true;
        
        return $prepared;
    }
}

