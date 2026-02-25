<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tasks', 'ticket_no')) {
            return;
        }

        Schema::table('tasks', function (Blueprint $table) {
            $table->unique('ticket_no');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tasks', 'ticket_no')) {
            return;
        }

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropUnique(['ticket_no']);
        });
    }
};
