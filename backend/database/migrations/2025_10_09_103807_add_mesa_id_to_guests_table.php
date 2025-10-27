<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            // Agregar columna mesa_id con clave foránea a mesas
            if (!Schema::hasColumn('guests', 'mesa_id')) {
                $table->foreignId('mesa_id')->nullable()->constrained('mesas')->nullOnDelete()->after('confirmado');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            if (Schema::hasColumn('guests', 'mesa_id')) {
                $table->dropConstrainedForeignId('mesa_id');
            }
        });
    }
};
