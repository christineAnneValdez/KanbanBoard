<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Sortable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Backpack\CRUD\app\Models\Traits\CrudTrait;

class Group extends Model
{
     use HasFactory, CrudTrait, Sortable;

     protected $fillable = [
        'name',
        'sort',
         'user_id'
     ];

     public function getSortableQuery()
     {
        return $this->user->groups();
     }

     public function tasks(): HasMany
     {
        return $this->hasMany(Task::class);
     }

     public function user()
    {
        return $this->belongsTo(User::class);
    }
}
