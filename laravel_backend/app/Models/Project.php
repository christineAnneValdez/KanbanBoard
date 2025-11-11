<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use CrudTrait, HasFactory;

    protected $fillable = ['name','user_id'];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
