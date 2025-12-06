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
            'contactName' => $this->contact_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status->value,
            'source' => $this->source,
            'carCompany' => $this->car_company,
            'model' => $this->model,
            'trim' => $this->trim,
            'spec' => $this->spec,
            'modelYear' => $this->model_year,
            'kilometers' => $this->kilometers,
            'price' => (float) $this->price,
            'notes' => $this->notes,
            'priority' => $this->priority->value,
            'notConvertedReason' => $this->not_converted_reason,
            'assignedTo' => $this->assigned_to,
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
