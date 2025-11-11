<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    use CrudTrait, HasFactory;

    protected $fillable=[
        'name',
        'color'
    ];

     public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class);
    }
}
