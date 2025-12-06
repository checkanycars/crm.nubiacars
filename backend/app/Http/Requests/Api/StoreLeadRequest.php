<?php

namespace App\Http\Requests\Api;

use App\LeadPriority;
use App\LeadStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
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
            'lead_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'status' => ['required', 'string', Rule::enum(LeadStatus::class)],
            'source' => ['required', 'string', 'max:255'],
            'car_company' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'trim' => ['nullable', 'string', 'max:255'],
            'spec' => ['nullable', 'string', 'max:255'],
            'model_year' => ['required', 'integer', 'min:1900', 'max:'.(date('Y') + 2)],
            'interior_colour' => ['nullable', 'string', 'max:255'],
            'exterior_colour' => ['nullable', 'string', 'max:255'],
            'gear_box' => ['nullable', 'string', 'max:255'],
            'car_type' => ['nullable', 'string', Rule::in(['new', 'used'])],
            'fuel_tank' => ['nullable', 'string', 'max:255'],
            'steering_side' => ['nullable', 'string', 'max:255'],
            'export_to' => ['nullable', 'string', 'max:255'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'priority' => ['required', 'string', Rule::enum(LeadPriority::class)],
            'not_converted_reason' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
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
            'lead_name.required' => 'Lead name is required.',
            'contact_name.required' => 'Contact name is required.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'phone.required' => 'Phone number is required.',
            'status.required' => 'Lead status is required.',
            'source.required' => 'Lead source is required.',
            'car_company.required' => 'Car company is required.',
            'model.required' => 'Car model is required.',
            'model_year.required' => 'Model year is required.',
            'model_year.min' => 'Model year must be at least 1900.',
            'model_year.max' => 'Model year cannot be more than 2 years in the future.',
            'car_type.in' => 'Car type must be either "new" or "used".',
            'quantity.integer' => 'Quantity must be a valid number.',
            'quantity.min' => 'Quantity must be at least 1.',
            'price.required' => 'Price is required.',
            'price.min' => 'Price cannot be negative.',
            'priority.required' => 'Priority is required.',
            'assigned_to.exists' => 'The selected user does not exist.',
        ];
    }
}
