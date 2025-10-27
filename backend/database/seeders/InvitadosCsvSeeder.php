<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Guest;
use Illuminate\Support\Facades\File;

class InvitadosCsvSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Guest::truncate(); // Opcional: vacía la tabla antes de importar

        $csvPath = base_path('INVITADOS 2.csv');
        $file = File::get($csvPath);
        $rows = explode("\n", trim($file));

        // Omitir la primera fila (cabeceras de categoría) y la última (total)
        $dataRows = array_slice($rows, 1, -1);

        $guestCounter = 0;

        foreach ($dataRows as $row) {
            if (empty(trim($row))) continue;

            $columns = str_getcsv($row, ';');

            for ($i = 0; $i < 3; $i++) {
                if (isset($columns[$i]) && !empty(trim($columns[$i]))) {
                    $guestCounter++;
                    Guest::create([
                        'nombre' => trim($columns[$i]),
                        'apellido' => '',
                        'email' => 'invitado' . $guestCounter . '@boda.com',
                        'confirmado' => false,
                    ]);
                }
            }
        }
    }
}
