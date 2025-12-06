<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarTrimRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'model_id' => ['required', 'integer', 'exists:car_models,id'],
            'trim_name' => ['required', 'string', 'max:255'],
            'body_type' => ['required', 'string', 'max:255'],
            'popularity_level' => ['required', 'string', 'in:High,Medium,Low'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'model_id.required' => 'The car model is required.',
            'model_id.integer' => 'The model ID must be an integer.',
            'model_id.exists' => 'The selected car model does not exist.',
            'trim_name.required' => 'The trim name is required.',
            'trim_name.string' => 'The trim name must be a string.',
            'trim_name.max' => 'The trim name must not exceed 255 characters.',
            'body_type.required' => 'The body type is required.',
            'body_type.string' => 'The body type must be a string.',
            'body_type.max' => 'The body type must not exceed 255 characters.',
            'popularity_level.required' => 'The popularity level is required.',
            'popularity_level.string' => 'The popularity level must be a string.',
            'popularity_level.in' => 'The popularity level must be one of: High, Medium, Low.',
        ];
    }
}
