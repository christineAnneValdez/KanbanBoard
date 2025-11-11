<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Sortable
{
    /**
     * Scope to order by the "sort" column ascending
     */
    public function scopeOrdered(Builder $query)
    {
        return $query->orderBy('sort', 'asc');
    }

    /**
     * Set sort value and save
     */
    public function setSort(int $position)
    {
        $this->sort = $position;
        $this->save();
    }
}
