<?php

use Illuminate\Support\Facades\Route;
use App\Models\Task;
use App\Models\Project;
use App\Models\Group;
use App\Models\Label;
use App\Models\Checklist;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

Route::post("/login", [AuthController::class, "login"]);
Route::post("/register", [AuthController::class, "register"]);
Route::post("/logout", [AuthController::class, "logout"])->middleware("auth:sanctum");
Route::get("/user", [AuthController::class, "user"])->middleware("auth:sanctum");
Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});
Route::patch('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::post('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::patch('/profile/password', [AuthController::class, 'updatePassword'])->middleware('auth:sanctum');


Route::get('/tasks', function () {
    return [
        'todo' => Task::where('status', 'todo')->get(),
        'in_progress' => Task::where('status', 'in_progress')->get(),
        'done' => Task::where('status', 'done')->get(),
    ];
});

Route::middleware('auth:sanctum')->get('/projects', function (Request $request) {
    return $request->user()
        ->projects()        // only projects assigned through project_user pivot
        ->with('user')      // also show creator
        ->get();
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
                      ->with(['labels', 'assignee:id,name,email,profile_photo_path']);
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
        'assigned_user_id' => 'nullable|integer|exists:users,id',
        'start_date' => 'nullable|date',
        'due_date' => 'nullable|date|after_or_equal:start_date',
    ]);

    $task = Task::create($validated);

    return response()->json($task->load('assignee:id,name,email,profile_photo_path'), 201);
});

Route::match(['put', 'patch'], '/tasks/{task}', function (Request $request, Task $task) {
    $validated = $request->validate([
        'name' => 'nullable|string|max:255',
        'description' => 'nullable|string|max:1000',
        'group_id' => 'nullable|integer|exists:groups,id',
        'sort' => 'nullable|integer',
        'assigned_user_id' => 'nullable|integer|exists:users,id',
        'start_date' => 'nullable|date',
        'due_date' => 'nullable|date|after_or_equal:start_date',
    ]);

    $task->update($validated);

    return response()->json($task->load('assignee:id,name,email,profile_photo_path'));
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

Route::get('/tasks/{task}/comments', function (Task $task) {
    return $task->comments()
        ->whereNull('parent_id')
        ->with([
            'user:id,name',
            'replies.user:id,name',
        ])
        ->latest()
        ->get();
});

Route::post('/tasks/{task}/comments', function (Request $request, Task $task) {
    $validated = $request->validate([
        'content' => 'required|string|max:2000',
        'author_name' => 'nullable|string|max:255',
        'parent_id' => 'nullable|integer|exists:comments,id',
    ]);

    $authUser = $request->user();
    $parentId = $validated['parent_id'] ?? null;

    if ($parentId) {
        $belongsToTask = $task->comments()->where('id', $parentId)->exists();
        if (! $belongsToTask) {
            return response()->json(['message' => 'Invalid parent comment for this task'], 422);
        }
    }

    $comment = $task->comments()->create([
        'user_id' => $authUser?->id,
        'parent_id' => $parentId,
        'author_name' => $authUser?->name ?? ($validated['author_name'] ?? 'User'),
        'content' => $validated['content'],
    ]);

    return response()->json($comment->load('user:id,name'), 201);
});

Route::patch('/tasks/{task}/comments/{comment}', function (Request $request, Task $task, Comment $comment) {
    if ((int) $comment->task_id !== (int) $task->id) {
        return response()->json(['message' => 'Comment does not belong to this task'], 422);
    }

    $authUser = $request->user();
    $isAdmin = $authUser && method_exists($authUser, 'hasRole') && $authUser->hasRole('admin');
    $isOwner = $authUser && (int) $comment->user_id === (int) $authUser->id;
    $isOwnerByName = $authUser
        && ! $comment->user_id
        && $comment->author_name
        && strcasecmp($comment->author_name, $authUser->name) === 0;

    if (! $isOwner && ! $isOwnerByName && ! $isAdmin) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $validated = $request->validate([
        'content' => 'required|string|max:2000',
    ]);

    $comment->update([
        'content' => $validated['content'],
    ]);

    return response()->json($comment->fresh()->load('user:id,name'));
})->middleware('auth:sanctum');

Route::delete('/tasks/{task}/comments/{comment}', function (Request $request, Task $task, Comment $comment) {
    if ((int) $comment->task_id !== (int) $task->id) {
        return response()->json(['message' => 'Comment does not belong to this task'], 422);
    }

    $authUser = $request->user();
    $isAdmin = $authUser && method_exists($authUser, 'hasRole') && $authUser->hasRole('admin');
    $isOwner = $authUser && (int) $comment->user_id === (int) $authUser->id;
    $isOwnerByName = $authUser
        && ! $comment->user_id
        && $comment->author_name
        && strcasecmp($comment->author_name, $authUser->name) === 0;

    if (! $isOwner && ! $isOwnerByName && ! $isAdmin) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $comment->delete();

    return response()->json(['message' => 'Deleted']);
})->middleware('auth:sanctum');

Route::get('/tasks/{task}/mentionable-users', function (Task $task) {
    $project = $task->project()->with(['members:id,name,email,profile_photo_path', 'user:id,name,email,profile_photo_path'])->first();

    if (! $project) {
        return [];
    }

    $users = collect([$project->user])
        ->merge($project->members)
        ->filter()
        ->unique('id')
        ->values()
        ->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo_url' => $user->profile_photo_url,
        ]);

    return $users;
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
