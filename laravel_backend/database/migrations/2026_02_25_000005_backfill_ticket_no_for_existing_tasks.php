<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! DB::getSchemaBuilder()->hasColumn('tasks', 'ticket_no')) {
            return;
        }

        $tasks = DB::table('tasks')
            ->leftJoin('projects', 'projects.id', '=', 'tasks.project_id')
            ->select('tasks.id', 'tasks.ticket_no', 'projects.name as project_name')
            ->orderBy('tasks.id')
            ->get();

        $used = [];
        $counters = [];

        foreach ($tasks as $task) {
            if (! $task->ticket_no) {
                continue;
            }

            $used[$task->ticket_no] = true;
            if (preg_match('/^([A-Z0-9]+)-(\d+)$/', $task->ticket_no, $matches)) {
                $prefix = $matches[1];
                $num = (int) $matches[2];
                $counters[$prefix] = max($counters[$prefix] ?? 0, $num);
            }
        }

        foreach ($tasks as $task) {
            if ($task->ticket_no) {
                continue;
            }

            $parts = preg_split('/[^A-Za-z0-9]+/', (string) $task->project_name);
            $prefix = Str::upper(
                collect($parts)
                    ->filter()
                    ->map(fn ($part) => Str::substr($part, 0, 1))
                    ->join('')
            );
            $prefix = $prefix !== '' ? $prefix : 'TASK';

            $next = ($counters[$prefix] ?? 0) + 1;
            $candidate = "{$prefix}-{$next}";
            while (isset($used[$candidate])) {
                $next++;
                $candidate = "{$prefix}-{$next}";
            }

            DB::table('tasks')->where('id', $task->id)->update(['ticket_no' => $candidate]);
            $used[$candidate] = true;
            $counters[$prefix] = $next;
        }
    }

    public function down(): void
    {
        // Intentionally left empty to avoid deleting already assigned ticket numbers.
    }
};
