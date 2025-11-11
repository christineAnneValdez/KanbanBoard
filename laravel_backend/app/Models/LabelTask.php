<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabelTask extends Model
{
    use CrudTrait, HasFactory;

    protected $fillable = [
        'label_id',
        'rask_id',
    ];
     public function label()
    {
        return $this->belongsTo(Label::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
