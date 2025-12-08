<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'leadName' => $this->lead_name,
            'customerId' => $this->customer_id,
            'contactName' => $this->customer?->full_name,
            'email' => $this->customer?->email,
            'phone' => $this->customer?->phone,
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'fullName' => $this->customer->full_name,
                    'email' => $this->customer->email,
                    'phone' => $this->customer->phone,
                    'status' => $this->customer->status->value,
                ];
            }),
            'status' => $this->status->value,
            'source' => $this->source,
            'carCompany' => $this->car_company,
            'model' => $this->model,
            'trim' => $this->trim,
            'spec' => $this->spec,
            'modelYear' => $this->model_year,
            'interiorColour' => $this->interior_colour,
            'exteriorColour' => $this->exterior_colour,
            'gearBox' => $this->gear_box,
            'carType' => $this->car_type,
            'fuelTank' => $this->fuel_tank,
            'steeringSide' => $this->steering_side,
            'exportTo' => $this->export_to,
            'exportToCountry' => $this->export_to_country,
            'quantity' => $this->quantity,
            'price' => (float) $this->price,
            'notes' => $this->notes,
            'priority' => $this->priority->value,
            'notConvertedReason' => $this->not_converted_reason,
            'assignedTo' => $this->assigned_to,
            'isActive' => $this->is_active,
            'assignedUser' => $this->whenLoaded('assignedUser', function () {
                return [
                    'id' => $this->assignedUser->id,
                    'name' => $this->assignedUser->name,
                    'email' => $this->assignedUser->email,
                    'role' => $this->assignedUser->role->value,
                ];
            }),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
