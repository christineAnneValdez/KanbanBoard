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
        CRUD::setEntityNameStrings('workflow template', 'workflow templates');
    }

    protected function setupListOperation(): void
    {
        CRUD::column('name')->label('Template Name');
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
    }

    protected function setupCreateOperation(): void
    {
        CRUD::setValidation(WorkflowTemplateRequest::class);

        CRUD::field('name')->label('Template Name')->type('text');
        CRUD::addField([
            'name' => 'stages',
            'label' => 'Workflow Stages',
            'type' => 'repeatable',
            'new_item_label' => 'Add Stage',
            'init_rows' => 2,
            'min_rows' => 1,
            'fields' => [
                [
                    'name' => 'name',
                    'type' => 'text',
                    'label' => 'Stage Name',
                    'wrapper' => ['class' => 'form-group col-md-12'],
                ],
            ],
        ]);
    }

    protected function setupUpdateOperation(): void
    {
        $this->setupCreateOperation();
    }
}

