<?php

namespace App\Http\Controllers\Admin;

use Backpack\PermissionManager\app\Http\Controllers\PermissionCrudController as BackpackPermissionCrudController;

class PermissionCrudController extends BackpackPermissionCrudController
{
    public function setup()
    {
        parent::setup();

        // Restrict access
        if (!backpack_user()->can('manage permissions')) {
            abort(403, 'Access denied');
        }
    }
}
