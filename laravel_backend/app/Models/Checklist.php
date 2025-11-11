<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use CrudTrait;
    use HasFactory;

    protected $fillable = [
        'task_id',
        'name',
        'is_done',
        'sort'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
