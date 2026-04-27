{{-- This file is used for menu items by any Backpack v6 theme --}}
<li class="nav-item"><a class="nav-link" href="{{ backpack_url('dashboard') }}"><i class="la la-home nav-icon"></i> {{ trans('backpack::base.dashboard') }}</a></li>


{{-- Kanban Board --}}
@php
$canSeeKanban =
    backpack_user()->can('manage task') ||
    backpack_user()->can('manage project') ||
    backpack_user()->can('manage groups') ||
    backpack_user()->can('manage labels');
@endphp

@if($canSeeKanban)
    <x-backpack::menu-separator title="Kanban Board" />
@endif

@if(backpack_user()->can('manage task'))
    <x-backpack::menu-item title="Tasks" icon="la la-tasks" :link="backpack_url('task')" />
@endif

@if(backpack_user()->can('manage project'))
    <x-backpack::menu-item title="Projects" icon="la la-briefcase" :link="backpack_url('project')" />
@endif

@if(backpack_user()->can('manage groups'))
    <x-backpack::menu-item title="Groups" icon="la la-columns" :link="backpack_url('group')" />
    <x-backpack::menu-item title="Workflow Templates" icon="la la-project-diagram" :link="backpack_url('workflow-template')" />
@endif

@if(backpack_user()->can('manage labels'))
    <x-backpack::menu-item title="Labels" icon="la la-tags" :link="backpack_url('label')" />
@endif

{{-- Authentication --}}

@php
$canSeeAdmin =
    backpack_user()->can('manage users') ||
    backpack_user()->can('manage roles') ||
    backpack_user()->can('manage permissions');
@endphp

@if($canSeeAdmin)
    <x-backpack::menu-separator title="Administration" />
@endif

@if(backpack_user()->can('manage users'))
    <x-backpack::menu-item title="Users" icon="la la-user" :link="backpack_url('user')" />
@endif

@if(backpack_user()->can('manage roles'))
    <x-backpack::menu-item title="Roles" icon="la la-user-shield" :link="backpack_url('role')" />
@endif

@if(backpack_user()->can('manage permissions'))
    <x-backpack::menu-item title="Permissions" icon="la la-key" :link="backpack_url('permission')" />
@endif
