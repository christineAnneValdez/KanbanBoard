<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\TaskRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class TaskCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class TaskCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    /**
     * Configure the CrudPanel object. Apply settings to all operations.
     *
     * @return void
     */
    public function setup()
    {
        CRUD::setModel(\App\Models\Task::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/task');
        CRUD::setEntityNameStrings('task', 'tasks');
    }

    /**
     * Define what happens when the List operation is loaded.
     *
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        CRUD::setFromDb(); // set columns from db columns.
        CRUD::column('name')->label('Task Title');
        CRUD::column('description')->label('Description');
        CRUD::column('sort')->label('Sort Order');

        CRUD::addColumn([
            'name' => 'group_id',
            'type' => 'select',
            'entity' => 'group',
            'attribute' => 'name',
            'model' => "App\Models\Group",
            'label' => 'Group'
        ]);
         CRUD::addColumn([
            'name' => 'project_id',
            'type' => 'select',
            'entity' => 'project',
            'attribute' => 'name',
            'model' => "App\Models\Project",
            'label' => 'Project'
        ]);

           CRUD::addColumn([
            'name' => 'labels',
            'label' => 'Labels',
            'type' => 'closure',
            'function' => function ($entry) {
                return $entry->labels->map(function ($label) {
                    return "<span style='
                        background:{$label->color};
                        color:#fff;
                        padding:2px 8px;
                        border-radius:4px;
                        font-size:12px;
                        margin-right:4px;
                        white-space:nowrap;
                    '>{$label->name}</span>";
                })->implode(' ');
            },
            'escaped' => false,
        ]);
    }

    /**
     * Define what happens when the Create operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-create
     * @return void
     */
    protected function setupCreateOperation()
    {
        CRUD::setValidation(TaskRequest::class);

        CRUD::field('name')->label('Task Title')->type('text');
        CRUD::field('description')->label('Description')->type('textarea')->nullable(true);
        CRUD::field('sort')->label('Sort Order')->type('number')->default(0);

        CRUD::addField([
            'name' => 'group_id',
            'type' => 'select',
            'entity' => 'group',
            'attribute' => 'name',
            'model' => "App\Models\Group",
            'label' => 'Group'
        ]);

        CRUD::addField([
            'name' => 'project_id',
            'type' => 'select',
            'entity' => 'project',
            'attribute' => 'name',
            'model' => "App\Models\Project",
            'label' => 'Project',
            'allows_null' => true,
        ]);
         CRUD::addField([
            'name'        => 'labels',              // relation name
            'type'        => 'checklist',           // ✅ shows as checkboxes
            'entity'      => 'labels',
            'attribute'   => 'name',
            'model'       => 'App\Models\Label',
            'label'       => 'Labels',
            'pivot'       => true,                  // since it's many-to-many
        ]);

    }

    protected function setupShowOperation()
    {
        CRUD::column('name')->label('Task Title');
        CRUD::column('description')->label('Description');
        CRUD::column('sort')->label('Sort Order');

        CRUD::addColumn([
            'name' => 'group_id',
            'type' => 'select',
            'entity' => 'group',
            'attribute' => 'name',
            'model' => "App\Models\Group",
            'label' => 'Group'
        ]);

        CRUD::addColumn([
            'name' => 'project_id',
            'type' => 'select',
            'entity' => 'project',
            'attribute' => 'name',
            'model' => "App\Models\Project",
            'label' => 'Project'
        ]);

         CRUD::addColumn([
            'name' => 'labels',
            'label' => 'Labels',
            'type' => 'closure',
            'function' => function ($entry) {
                return $entry->labels->map(function ($label) {
                    return "<span style='
                        background:{$label->color};
                        color:#fff;
                        padding:3px 8px;
                        border-radius:5px;
                        font-size:13px;
                        margin-right:5px;
                        white-space:nowrap;
                    '>{$label->name}</span>";
                })->implode(' ');
            },
            'escaped' => false,
        ]);

        CRUD::column('created_at')->label('Created At')->type('datetime');
        CRUD::column('updated_at')->label('Last Updated')->type('datetime');
    }


    /**
     * Define what happens when the Update operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-update
     * @return void
     */
    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }
}
