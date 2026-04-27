<?php

namespace App\Services;

use App\Models\Group;
use App\Models\Project;
use App\Models\WorkflowTemplate;
use Illuminate\Support\Collection;

class ProjectWorkflowService
{
    public function syncProjectGroups(Project $project): void
    {
        $project->loadMissing('workflowTemplate');

        if (! $project->workflowTemplate) {
            $template = WorkflowTemplate::query()->orderBy('id')->first();
            if (! $template) {
                return;
            }

            $project->workflow_template_id = $template->id;
            $project->save();
            $project->setRelation('workflowTemplate', $template);
        }

        $stages = $this->normalizeStages($project->workflowTemplate->stages ?? []);
        if ($stages->isEmpty()) {
            return;
        }

        $existingGroups = Group::query()
            ->where('project_id', $project->id)
            ->orderBy('sort')
            ->orderBy('id')
            ->get();

        $usedGroupIds = Group::query()
            ->where('project_id', $project->id)
            ->whereHas('tasks')
            ->pluck('id')
            ->all();

        $usedGroupIdsLookup = array_flip($usedGroupIds);

        $matchedGroupIds = [];

        foreach ($stages->values() as $index => $stageName) {
            $normalizedStage = mb_strtolower($stageName);
            $group = $existingGroups->first(function (Group $item) use ($normalizedStage, $matchedGroupIds) {
                return ! in_array($item->id, $matchedGroupIds, true)
                    && mb_strtolower(trim((string) $item->name)) === $normalizedStage;
            });

            if ($group) {
                $group->update([
                    'name' => $stageName,
                    'sort' => $index + 1,
                ]);
                $matchedGroupIds[] = $group->id;
                continue;
            }

            $created = Group::query()->create([
                'name' => $stageName,
                'sort' => $index + 1,
                'user_id' => $project->user_id,
                'project_id' => $project->id,
            ]);
            $matchedGroupIds[] = $created->id;
        }

        $extraGroups = $existingGroups->filter(
            fn (Group $group) => ! in_array($group->id, $matchedGroupIds, true)
        );

        foreach ($extraGroups as $group) {
            if (isset($usedGroupIdsLookup[$group->id])) {
                continue;
            }

            $group->delete();
        }
    }

    private function normalizeStages(array $stages): Collection
    {
        return collect($stages)
            ->map(function ($value) {
                if (is_array($value)) {
                    return trim((string) ($value['name'] ?? ''));
                }

                return trim((string) $value);
            })
            ->filter()
            ->unique(fn ($name) => mb_strtolower($name))
            ->values();
    }
}
