<?php

namespace App\Http\Requests\Api;

use App\LeadPriority;
use App\LeadStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
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
            'lead_name' => ['sometimes', 'string', 'max:255'],
            'customer_id' => ['sometimes', 'integer', 'exists:customers,id'],
            'status' => ['sometimes', 'string', Rule::enum(LeadStatus::class)],
            'source' => ['sometimes', 'string', 'max:255'],
            'car_company' => ['sometimes', 'string', 'max:255'],
            'model' => ['sometimes', 'string', 'max:255'],
            'trim' => ['nullable', 'string', 'max:255'],
            'spec' => ['nullable', 'string', 'max:255'],
            'model_year' => ['sometimes', 'integer', 'min:1900', 'max:'.(date('Y') + 2)],
            'interior_colour' => ['nullable', 'string', 'max:255'],
            'exterior_colour' => ['nullable', 'string', 'max:255'],
            'gear_box' => ['nullable', 'string', 'max:255'],
            'car_type' => ['nullable', 'string', Rule::in(['new', 'used'])],
            'fuel_tank' => ['nullable', 'string', 'max:255'],
            'steering_side' => ['nullable', 'string', 'max:255'],
            'export_to' => ['nullable', 'string', 'max:255'],
            'export_to_country' => ['nullable', 'string', 'max:255'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'priority' => ['sometimes', 'string', Rule::enum(LeadPriority::class)],
            'not_converted_reason' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
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
            'lead_name.string' => 'Lead name must be a valid string.',
            'customer_id.integer' => 'Customer ID must be a valid number.',
            'customer_id.exists' => 'The selected customer does not exist.',
            'status.string' => 'Status must be a valid string.',
            'source.string' => 'Source must be a valid string.',
            'car_company.string' => 'Car company must be a valid string.',
            'model.string' => 'Model must be a valid string.',
            'model_year.integer' => 'Model year must be a valid number.',
            'model_year.min' => 'Model year must be at least 1900.',
            'model_year.max' => 'Model year cannot be more than 2 years in the future.',
            'car_type.in' => 'Car type must be either "new" or "used".',
            'quantity.integer' => 'Quantity must be a valid number.',
            'quantity.min' => 'Quantity must be at least 1.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price cannot be negative.',
            'priority.string' => 'Priority must be a valid string.',
            'assigned_to.exists' => 'The selected user does not exist.',
        ];
    }
}
