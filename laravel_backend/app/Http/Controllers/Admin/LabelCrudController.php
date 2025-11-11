<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\LabelRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;

/**
 * Class LabelCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class LabelCrudController extends CrudController
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
        CRUD::setModel(\App\Models\Label::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/label');
        CRUD::setEntityNameStrings('label', 'labels');
    }

    /**
     * Define what happens when the List operation is loaded.
     *
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        CRUD::column('name')->label('Label Name');

        CRUD::addColumn([
            'name' => 'color',
            'label' => 'Color',
            'type' => 'closure',
            'function' => function($entry) {
                return "<div style='display:flex;align-items:center;gap:8px'>
                        <div style='width:18px;height:18px;border-radius:4px;background:{$entry->color};border:1px solid #ccc'></div>
                        <span>{$entry->color}</span>
                        </div>";
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
        CRUD::setValidation(LabelRequest::class);
       // Label name input
        CRUD::field('name')
            ->label('Label Name')
            ->type('text');

        // Color picker field
        CRUD::addField([
            'name' => 'color',
            'label' => 'Color',
            'type' => 'color', // nice color selector
            'default' => '#000000', // optional
        ]);
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
