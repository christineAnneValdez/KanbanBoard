<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Sortable;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory, CrudTrait, Sortable;

     protected $fillable = [
        'project_id',
        'ticket_no',
        'name',
        'group_id',
        'sort',
        'description',
        'assigned_user_id',
        'start_date',
        'due_date',
    ];

     public function getSortableQuery()
    {
        return $this->group->tasks();
    }

    public function scopeForProject(Builder $query, $projectId)
    {
        $query->where('project_id', $projectId);
    }

    public function scopeFilter(Builder $query, string $search)
    {
        $query->where('description', 'like', "%$search%");
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class);
    }

    public function checklists()
    {
    return $this->hasMany(Checklist::class)->orderBy('sort');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    protected static function booted(): void
    {
        static::creating(function (Task $task) {
            if (! Schema::hasColumn('tasks', 'ticket_no')) {
                return;
            }

            if (! empty($task->ticket_no)) {
                return;
            }

            $task->ticket_no = self::generateUniqueTicketNo($task->project_id);
        });
    }

    protected static function generateUniqueTicketNo(?int $projectId): string
    {
        $projectName = null;
        if ($projectId) {
            $projectName = Project::whereKey($projectId)->value('name');
        }

        $prefix = Str::upper(
            collect(preg_split('/[^A-Za-z0-9]+/', (string) $projectName))
                ->filter()
                ->map(fn ($part) => Str::substr($part, 0, 1))
                ->join('')
        );
        $prefix = $prefix !== '' ? $prefix : 'TASK';

        $existing = self::query()
            ->where('ticket_no', 'like', "{$prefix}-%")
            ->pluck('ticket_no');

        $max = 0;
        foreach ($existing as $ticket) {
            if (preg_match('/-(\d+)$/', $ticket, $matches)) {
                $max = max($max, (int) $matches[1]);
            }
        }

        $next = $max + 1;
        $candidate = "{$prefix}-{$next}";
        while (self::where('ticket_no', $candidate)->exists()) {
            $next++;
            $candidate = "{$prefix}-{$next}";
        }

        return $candidate;
    }

}
