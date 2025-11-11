<?php

use Illuminate\Support\Facades\Route;
use App\Models\Task;
use App\Models\Project;
use App\Models\Group;
use App\Models\Label;
use App\Models\Checklist;
use Illuminate\Http\Request;

Route::get('/tasks', function () {
    return [
        'todo' => Task::where('status', 'todo')->get(),
        'in_progress' => Task::where('status', 'in_progress')->get(),
        'done' => Task::where('status', 'done')->get(),
    ];
});

Route::get('/projects', function () {
    return Project::with('user')->get();
});

Route::get('/projects/{project}', function (Project $project) {
    return $project;
});

Route::get('/projects/{project}/kanban', function (Project $project) {
    return [
        'project' => $project,
        'groups' => Group::with([
            'tasks' => function ($query) use ($project) {
                $query->where('project_id', $project->id)
                      ->with('labels');
            }
        ])
        ->orderBy('sort')
        ->get(),
    ];
});

Route::post('/groups', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'sort' => 'nullable|integer',
        'user_id' => 'required|integer',
    ]);

    $group = Group::create($validated);
    return response()->json($group, 201);
});

Route::post('/tasks', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string|max:1000',
        'group_id' => 'required|integer|exists:groups,id',
        'project_id' => 'required|integer|exists:projects,id',
        'sort' => 'nullable|integer',
    ]);

    $task = Task::create($validated);

    return response()->json($task, 201);
});

Route::match(['put', 'patch'], '/tasks/{task}', function (Request $request, Task $task) {
    $validated = $request->validate([
        'name' => 'nullable|string|max:255',
        'description' => 'nullable|string|max:1000',
        'group_id' => 'nullable|integer|exists:groups,id',
        'sort' => 'nullable|integer',
    ]);

    $task->update($validated);

    return response()->json($task);
});


Route::match(['put', 'patch'], '/groups/{group}', function (Request $request, Group $group) {
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'sort' => 'nullable|integer',
    ]);

    $group->update($validated);

    return response()->json($group);
});

Route::get('/labels', fn() => Label::all());

// Get task labels
Route::get('/tasks/{task}/labels', fn(Task $task) => $task->labels);

// Attach label
Route::post('/tasks/{task}/labels', function (Request $request, Task $task) {
    $task->labels()->syncWithoutDetaching($request->label_id);
    return $task->labels;
});

// Detach label
Route::delete('/tasks/{task}/labels/{label}', function (Task $task, Label $label) {
    $task->labels()->detach($label->id);
    return $task->labels;
});


Route::get('/tasks/{task}/checklists', function (Task $task) {
    return $task->checklists()->orderBy('sort')->get();
});

// Add a checklist item
Route::post('/tasks/{task}/checklists', function (Request $request, Task $task) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'sort' => 'nullable|integer',
    ]);

    $validated['is_done'] = false;
    $validated['task_id'] = $task->id;

    $checklist = Checklist::create($validated);
    return response()->json($checklist, 201);
});

Route::put('/checklists/{checklist}', function (Request $request, Checklist $checklist) {
    $validated = $request->validate([
        'name' => 'nullable|string|max:255',
        'is_done' => 'nullable|boolean',
        'sort' => 'nullable|integer',
    ]);

    $checklist->update($validated);
    return response()->json($checklist);
});

Route::delete('/checklists/{checklist}', function (Checklist $checklist) {
    $checklist->delete();
    return response()->json(['message' => 'Deleted']);
});
