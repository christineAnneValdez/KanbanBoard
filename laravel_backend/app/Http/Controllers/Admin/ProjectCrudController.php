<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\ProjectRequest;
use App\Services\ProjectWorkflowService;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;
use App\Models\User;

/**
 * Class ProjectCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class ProjectCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    /**
     * Configure the CrudPanel object. Apply settings to all operations.
     *
     * @return void
     */
    public function setup()
    {
        CRUD::setModel(\App\Models\Project::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/project');
        CRUD::setEntityNameStrings('project', 'projects');
    }

    /**
     * Define what happens when the List operation is loaded.
     *
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        CRUD::column('name')->label('Project Name');
        CRUD::addColumn([
            'name' => 'user_id',
            'type' => 'select',
            'entity' => 'user',
            'attribute' => 'name',
            'model' => "App\Models\User",
            'label' => 'User'
        ]);
        CRUD::addColumn([
            'name' => 'workflow_template_id',
            'type' => 'select',
            'entity' => 'workflowTemplate',
            'attribute' => 'name',
            'model' => "App\Models\WorkflowTemplate",
            'label' => 'Workflow Template'
        ]);

        CRUD::addColumn([
            'name'      => 'members',
            'type'      => 'select_multiple',   // <= changed
            'label'     => 'Members',
            'entity'    => 'members',
            'attribute' => 'name',
            'separator' => ', '
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
        CRUD::setValidation(ProjectRequest::class);

        CRUD::field('name')
            ->label('Project Name')
            ->type('text');

        CRUD::addField([
            'name' => 'user_id',
            'type' => 'select',
            'entity' => 'user',
            'attribute' => 'name',
            'model' => "App\Models\User",
            'label' => 'Assigned User'
        ]);
        CRUD::addField([
            'name' => 'workflow_template_id',
            'type' => 'select',
            'entity' => 'workflowTemplate',
            'attribute' => 'name',
            'model' => "App\Models\WorkflowTemplate",
            'label' => 'Workflow Template'
        ]);

        CRUD::addField([
            'name'        => 'members',
            'type'        => 'checklist',
            'label'       => 'Additional members',
            'entity'      => 'members',
            'attribute'   => 'name',
            'pivot'       => true,
            'allows_null' => true,
            'options'     => function () {

        $ownerId = old('user_id')
                 ?? $this->crud->getCurrentEntry()->user_id
                 ?? request()->input('user_id');

        return User::whereKeyNot($ownerId)->pluck('name', 'id');
    },
        ]);
    }

    protected function setupShowOperation()
    {
        CRUD::column('name')->label('Project Name');

        CRUD::addColumn([
            'name' => 'user_id',
            'label' => 'Owner',
            'type' => 'select',
            'entity' => 'user',
            'attribute' => 'name',
            'model' => "App\Models\User",
        ]);
        CRUD::addColumn([
            'name' => 'workflow_template_id',
            'type' => 'select',
            'entity' => 'workflowTemplate',
            'attribute' => 'name',
            'model' => "App\Models\WorkflowTemplate",
            'label' => 'Workflow Template'
        ]);

         CRUD::addColumn([
            'name'      => 'members',
            'type'      => 'select_multiple',
            'label'     => 'Members',
            'entity'    => 'members',
            'attribute' => 'name',
            'separator' => ', '
        ]);

         CRUD::column('created_at')
            ->label('Created At')
            ->type('datetime');

         CRUD::column('updated_at')
            ->label('Last Updated')
            ->type('datetime');
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

    public function store()
    {
        $response = $this->traitStore();
        $this->syncProjectWorkflow();

        return $response;
    }

    public function update()
    {
        $response = $this->traitUpdate();
        $this->syncProjectWorkflow();

        return $response;
    }

    private function syncProjectWorkflow(): void
    {
        if (! $this->crud->entry) {
            return;
        }

        app(ProjectWorkflowService::class)->syncProjectGroups($this->crud->entry->fresh());
    }
}
