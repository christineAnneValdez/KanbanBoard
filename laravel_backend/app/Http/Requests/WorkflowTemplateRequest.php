<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkflowTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return backpack_auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stages' => 'required|array|min:1',
            'stages.*' => 'nullable|array',
            'stages.*.name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ];
    }
}

