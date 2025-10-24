<?php

use Illuminate\Support\Facades\Route;
use App\Models\Task;
use Illuminate\Http\Request;

Route::get('/tasks', function () {
    return [
        'todo' => Task::where('status', 'todo')->get(),
        'in_progress' => Task::where('status', 'in_progress')->get(),
        'done' => Task::where('status', 'done')->get(),
    ];
});

Route::patch('/tasks/{task}', function (Request $request, Task $task) {
    $task->update(['status' => $request->status]);
    return response()->json(['success' => true]);
});
