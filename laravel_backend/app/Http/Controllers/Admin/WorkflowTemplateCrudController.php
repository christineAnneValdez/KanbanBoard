<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\WorkflowTemplateRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

class WorkflowTemplateCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    public function setup(): void
    {
        CRUD::setModel(\App\Models\WorkflowTemplate::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/workflow-template');
        CRUD::setEntityNameStrings('group template', 'group templates');
    }

    protected function setupListOperation(): void
    {
        CRUD::column('name')->label('Group Template Name');
        CRUD::addColumn([
            'name' => 'stages',
            'label' => 'Stages',
            'type' => 'closure',
            'function' => function ($entry) {
                $stages = collect($entry->stages ?? [])
                    ->map(function ($item) {
                        if (is_array($item)) {
                            return trim((string) ($item['name'] ?? ''));
                        }

                        return trim((string) $item);
                    })
                    ->filter()
                    ->values()
                    ->all();

                return implode(' -> ', $stages);
            },
        ]);
        CRUD::addColumn([
            'name' => 'projects',
            'label' => 'Projects Using This Template',
            'type' => 'closure',
            'function' => function ($entry) {
                return $entry->projects()
                    ->orderBy('name')
                    ->pluck('name')
                    ->implode(', ');
            },
        ]);
    }

    protected function setupCreateOperation(): void
    {
        CRUD::setValidation(WorkflowTemplateRequest::class);

        CRUD::field('name')->label('Group Template Name')->type('text');
        $currentStages = [];
        if ($this->crud->getCurrentEntry()) {
            $currentStages = collect($this->crud->getCurrentEntry()->stages ?? [])
                ->map(function ($item) {
                    if (is_array($item)) {
                        return trim((string) ($item['name'] ?? ''));
                    }

                    return trim((string) $item);
                })
                ->filter()
                ->values()
                ->all();
        }
        $stagesText = old('stages_text', implode(PHP_EOL, $currentStages));

        CRUD::addField([
            'name' => 'stages_text',
            'label' => 'Group Columns',
            'type' => 'textarea',
            'attributes' => [
                'rows' => 6,
                'placeholder' => "To Do\nIn Progress\nDone",
            ],
            'hint' => 'Add one column per line.',
            'value' => $stagesText,
        ]);
        CRUD::addField([
            'name' => 'stages',
            'type' => 'hidden',
            'value' => (function () {
                if (is_string(old('stages'))) {
                    return old('stages');
                }

                $entry = $this->crud->getCurrentEntry();
                if (! is_object($entry)) {
                    return json_encode([], JSON_UNESCAPED_UNICODE);
                }

                return json_encode(
                    $entry->getRawOriginal('stages') ?? ($entry->stages ?? []),
                    JSON_UNESCAPED_UNICODE
                );
            })(),
        ]);
    }

    protected function setupUpdateOperation(): void
    {
        $this->setupCreateOperation();
    }
}
