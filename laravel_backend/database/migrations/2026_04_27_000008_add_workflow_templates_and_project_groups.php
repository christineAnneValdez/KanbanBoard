<?php

use App\Models\Group;
use App\Models\Project;
use App\Models\Task;
use App\Models\WorkflowTemplate;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('stages');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('workflow_template_id')
                ->nullable()
                ->after('user_id')
                ->constrained('workflow_templates')
                ->nullOnDelete();
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->foreignId('project_id')
                ->nullable()
                ->after('user_id')
                ->constrained('projects')
                ->cascadeOnDelete();
            $table->index(['project_id', 'sort']);
        });

        $legacyStages = Group::query()
            ->orderBy('sort')
            ->orderBy('id')
            ->get(['name'])
            ->pluck('name')
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique(fn ($name) => mb_strtolower($name))
            ->values()
            ->all();

        if (count($legacyStages) === 0) {
            $legacyStages = ['To Do', 'In Progress', 'Done'];
        }

        $defaultTemplate = WorkflowTemplate::create([
            'name' => 'Default Workflow',
            'stages' => $legacyStages,
            'user_id' => null,
        ]);

        Project::query()->whereNull('workflow_template_id')->update([
            'workflow_template_id' => $defaultTemplate->id,
        ]);

        $projects = Project::query()->get(['id', 'user_id', 'workflow_template_id']);

        foreach ($projects as $project) {
            $taskGroupIds = Task::query()
                ->where('project_id', $project->id)
                ->whereNotNull('group_id')
                ->distinct()
                ->pluck('group_id')
                ->all();

            $map = [];

            foreach ($taskGroupIds as $oldGroupId) {
                $oldGroup = Group::query()->find($oldGroupId);
                if (! $oldGroup) {
                    continue;
                }

                $newGroup = Group::query()->create([
                    'name' => $oldGroup->name,
                    'sort' => $oldGroup->sort ?? 0,
                    'user_id' => $project->user_id,
                    'project_id' => $project->id,
                ]);

                $map[$oldGroupId] = $newGroup->id;
            }

            foreach ($map as $oldGroupId => $newGroupId) {
                Task::query()
                    ->where('project_id', $project->id)
                    ->where('group_id', $oldGroupId)
                    ->update(['group_id' => $newGroupId]);
            }

            $templateStages = WorkflowTemplate::query()
                ->whereKey($project->workflow_template_id)
                ->value('stages') ?? [];

            if (is_string($templateStages)) {
                $decoded = json_decode($templateStages, true);
                $templateStages = is_array($decoded) ? $decoded : [];
            }

            $existingNames = Group::query()
                ->where('project_id', $project->id)
                ->pluck('name')
                ->map(fn ($name) => mb_strtolower(trim((string) $name)))
                ->all();

            foreach (array_values($templateStages) as $index => $stageName) {
                $cleanName = trim((string) $stageName);
                if ($cleanName === '') {
                    continue;
                }

                if (in_array(mb_strtolower($cleanName), $existingNames, true)) {
                    continue;
                }

                Group::query()->create([
                    'name' => $cleanName,
                    'sort' => $index + 1,
                    'user_id' => $project->user_id,
                    'project_id' => $project->id,
                ]);
            }
        }

        // Legacy global groups are no longer used after task reassignment.
        Group::query()->whereNull('project_id')->delete();
    }

    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('project_id');
            $table->dropIndex('groups_project_id_sort_index');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('workflow_template_id');
        });

        Schema::dropIfExists('workflow_templates');
    }
};

