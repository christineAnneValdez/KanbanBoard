<?php

namespace App\Http\Controllers\Admin;

use Backpack\PermissionManager\app\Http\Controllers\RoleCrudController as BackpackRoleCrudController;

class RoleCrudController extends BackpackRoleCrudController
{
    public function setup()
    {
        parent::setup();

        // Restrict access
        if (!backpack_user()->can('manage users')) {
    abort(403, 'Access denied');
}
    }
}
