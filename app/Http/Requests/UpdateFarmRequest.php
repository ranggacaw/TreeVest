<?php

namespace App\Http\Requests;

class UpdateFarmRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude' => ['required', 'numeric', 'min:-90', 'max:90'],
            'longitude' => ['required', 'numeric', 'min:-180', 'max:180'],
            'size_hectares' => ['required', 'numeric', 'min:0.01', 'max:100000'],
            'capacity_trees' => ['required', 'integer', 'min:1', 'max:1000000'],
            'soil_type' => ['nullable', 'string', 'max:100'],
            'climate' => ['nullable', 'string', 'max:100'],
            'historical_performance' => ['nullable', 'string', 'max:5000'],
            'virtual_tour_url' => ['nullable', 'url', 'max:500'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'certifications' => ['nullable', 'array', 'max:20'],
            'certifications.*.name' => ['required', 'string', 'max:200'],
            'certifications.*.issuer' => ['nullable', 'string', 'max:200'],
            'certifications.*.certificate_number' => ['nullable', 'string', 'max:100'],
            'certifications.*.issued_date' => ['nullable', 'date'],
            'certifications.*.expiry_date' => ['nullable', 'date', 'after:certifications.*.issued_date'],
            'certifications.*.file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }
}
