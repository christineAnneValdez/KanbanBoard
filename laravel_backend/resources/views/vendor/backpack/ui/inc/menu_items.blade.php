{{-- This file is used for menu items by any Backpack v6 theme --}}
<li class="nav-item"><a class="nav-link" href="{{ backpack_url('dashboard') }}"><i class="la la-home nav-icon"></i> {{ trans('backpack::base.dashboard') }}</a></li>

<x-backpack::menu-separator title="Kanban Board" />
<x-backpack::menu-item title="Tasks" icon="la la-tasks" :link="backpack_url('task')" />
<x-backpack::menu-item title="Projects" icon="la la-briefcase" :link="backpack_url('project')" />
<x-backpack::menu-item title="Groups" icon="la la-columns" :link="backpack_url('group')" />
<x-backpack::menu-item title="Labels" icon="la la-tags" :link="backpack_url('label')" />
{{-- <x-backpack::menu-item title="Checklists" icon="la la-question" :link="backpack_url('checklist')" /> --}}
