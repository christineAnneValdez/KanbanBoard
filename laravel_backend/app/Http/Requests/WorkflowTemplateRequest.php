<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkflowTemplateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $rawStages = (string) $this->input('stages_text', '');
        $stages = collect(preg_split('/\r\n|\r|\n/', $rawStages))
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique(fn ($value) => mb_strtolower($value))
            ->values()
            ->all();

        $this->merge([
            'stages' => $stages,
        ]);
    }

    public function authorize(): bool
    {
        return backpack_auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stages_text' => 'required|string',
            'stages' => 'required|array|min:1',
            'stages.*' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ];
    }
}
