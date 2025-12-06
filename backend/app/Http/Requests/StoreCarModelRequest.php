<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarModelRequest extends FormRequest
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
            'brand_id' => ['required', 'integer', 'exists:car_brands,id'],
            'model_name' => ['required', 'string', 'max:255'],
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
            'brand_id.required' => 'The brand is required.',
            'brand_id.integer' => 'The brand ID must be an integer.',
            'brand_id.exists' => 'The selected brand does not exist.',
            'model_name.required' => 'The model name is required.',
            'model_name.string' => 'The model name must be a string.',
            'model_name.max' => 'The model name must not exceed 255 characters.',
        ];
    }
}
