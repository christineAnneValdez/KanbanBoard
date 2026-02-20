<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('assigned_user_id')->nullable()->after('project_id')->constrained('users')->nullOnDelete();
            $table->date('start_date')->nullable()->after('assigned_user_id');
            $table->date('due_date')->nullable()->after('start_date');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_user_id');
            $table->dropColumn(['start_date', 'due_date']);
        });
    }
};
