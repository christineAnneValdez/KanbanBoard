<?php

namespace App\Http\Controllers\Admin;

use Backpack\CRUD\app\Http\Controllers\CrudController;
use Backpack\CRUD\app\Library\CrudPanel\CrudPanelFacade as CRUD;
use App\Models\User;

class UserCrudController extends CrudController
{
    public function setup(): void
    {
        CRUD::setModel(User::class);
        CRUD::setRoute(config('backpack.base.route_prefix') . '/user');
        CRUD::setEntityNameStrings('user', 'users');

        // Columns to show in the table
        CRUD::addColumns([
            [
                'name'  => 'name',
                'label' => 'Name',
            ],
            [
                'name'  => 'email',
                'label' => 'Email',
            ],
        ]);

        // Fields for create/edit forms
        CRUD::addFields([
            [
                'name'  => 'name',
                'label' => 'Name',
                'type'  => 'text',
            ],
            [
                'name'  => 'email',
                'label' => 'Email',
                'type'  => 'email',
            ],
            [
                'name'  => 'password',
                'label' => 'Password',
                'type'  => 'password',
            ],
            [
                'name' => 'roles',
                'type' => 'select2_multiple',
                'label' => 'Roles',
                'entity' => 'roles',
                'attribute' => 'name',
                'model' => "Spatie\Permission\Models\Role",
                'pivot' => true,
            ],
        ]);

    }

    public function store()
    {
        $this->crud->request->request->set(
            'password',
            bcrypt($this->crud->getRequest()->input('password'))
        );

        return parent::store();
    }

    public function update()
    {
        if ($this->crud->getRequest()->input('password')) {
            $this->crud->request->request->set(
                'password',
                bcrypt($this->crud->getRequest()->input('password'))
            );
        } else {
            $this->crud->request->request->remove('password');
        }

        return parent::update();
    }
}
