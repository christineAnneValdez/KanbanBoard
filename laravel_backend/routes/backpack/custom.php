<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserCrudController;
use Backpack\PermissionManager\app\Http\Controllers\RoleCrudController;
use Backpack\PermissionManager\app\Http\Controllers\PermissionCrudController;

// --------------------------
// Custom Backpack Routes
// --------------------------
// This route file is loaded automatically by Backpack\CRUD.
// Routes you generate using Backpack\Generators will be placed here.

Route::group([
    'prefix' => config('backpack.base.route_prefix', 'admin'),
    'middleware' => array_merge(
        (array) config('backpack.base.web_middleware', 'web'),
        (array) config('backpack.base.middleware_key', 'admin')
    ),
    'namespace' => 'App\Http\Controllers\Admin',
], function () {
   Route::group(['middleware' => ['permission:manage project']], function () {
        Route::crud('project', 'ProjectCrudController');
    });

    Route::group(['middleware' => ['permission:manage groups']], function () {
        Route::crud('group', 'GroupCrudController');
        Route::crud('workflow-template', 'WorkflowTemplateCrudController');
    });

    Route::group(['middleware' => ['permission:manage task']], function () {
        Route::crud('task', 'TaskCrudController');
    });

    Route::group(['middleware' => ['permission:manage labels']], function () {
        Route::crud('label', 'LabelCrudController');
        Route::crud('label-task', 'LabelTaskCrudController');
    });

    Route::group(['middleware' => ['permission:manage checklists']], function () {
        Route::crud('checklist', 'ChecklistCrudController');
    });

    Route::crud('role', RoleCrudController::class);
    Route::crud('permission', PermissionCrudController::class);
    Route::crud('user', UserCrudController::class);


}); // this should be the absolute last line of this file

/**
 * DO NOT ADD ANYTHING HERE.
 */
