<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKycDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $maxSize = config('treevest.kyc.max_file_size', 10) * 1024;
        $allowedTypes = config('treevest.kyc.allowed_document_types', [
            'image/jpeg',
            'image/png',
            'application/pdf',
        ]);

        return [
            'file' => [
                'required',
                'file',
                'max:'.$maxSize,
                'mimes:jpg,jpeg,png,pdf',
                'mimetypes:'.implode(',', $allowedTypes),
                'bail',
            ],
            'document_type' => [
                'required',
                'string',
                'regex:/^[a-z_]+$/',
                Rule::in(['passport', 'national_id', 'drivers_license', 'proof_of_address']),
            ],
        ];
    }

    protected function prepareForValidation()
    {
        $file = $this->file('file');

        if ($file) {
            $this->merge([
                'sanitized_filename' => preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName()),
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload.',
            'file.max' => 'The file must not exceed '.config('treevest.kyc.max_file_size', 10).'MB.',
            'file.mimes' => 'The file must be a JPEG, PNG, or PDF.',
            'file.mimetypes' => 'The file type is not supported.',
            'document_type.required' => 'Please select a document type.',
            'document_type.in' => 'Invalid document type selected.',
        ];
    }
}
