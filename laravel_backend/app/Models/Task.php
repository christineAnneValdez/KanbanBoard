<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Sortable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory, CrudTrait, Sortable;

     protected $fillable = [
        'project_id',
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

}
