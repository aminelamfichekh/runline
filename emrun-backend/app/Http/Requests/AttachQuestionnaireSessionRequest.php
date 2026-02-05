<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * AttachQuestionnaireSessionRequest
 * 
 * Validation complète lors de l'attach à un utilisateur.
 * Tous les champs requis doivent être présents.
 */
class AttachQuestionnaireSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Vérifié par middleware auth:api
    }

    /**
     * Get the validation rules that apply to the request.
     * 
     * Note: Cette FormRequest est utilisée uniquement pour l'autorisation.
     * La validation du payload se fait dans le controller car le payload
     * vient de la session, pas de la requête HTTP.
     */
    public function rules(): array
    {
        return [];
    }
}

