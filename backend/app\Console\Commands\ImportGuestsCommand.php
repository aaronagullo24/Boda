<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Guest;
use Illuminate\Support\Facades\Validator;
class ImportGuestsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:guests {file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa invitados desde un archivo CSV';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // 1. Vaciar la tabla de invitados para empezar de cero.
        $this->info('Vaciando la tabla de invitados...');
        Guest::truncate();

        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("El archivo no se encuentra en la ruta: {$filePath}");
            return 1;
        }

        $file = fopen($filePath, 'r');
        $isFirstLine = true;

        $this->info('Iniciando la importación de invitados...');
        $progressBar = $this->output->createProgressBar(count(file($filePath)));
        $progressBar->start();

        while (($data = fgetcsv($file, 2000, ";")) !== FALSE) {
            if ($isFirstLine) {
                $isFirstLine = false;
                $progressBar->advance();
                continue;
            }

            // Limpiamos los datos de espacios en blanco
            $nombre = trim($data[0] ?? '');
            $apellido = trim($data[1] ?? '');
            $familiaridad = trim($data[2] ?? ''); // Leer la columna 'familiaridad'

            // Si el nombre está vacío, saltamos la fila. Permitimos apellidos vacíos.
            if (empty($nombre)) {
                $progressBar->advance();
                continue;
            }

            // Generar un email único para evitar conflictos.
            $email = strtolower(str_replace(' ', '', $nombre . $apellido)) . uniqid() . '@example.com';

            Guest::create([
                'nombre' => $nombre,
                'apellido' => $apellido,
                'familiaridad' => $familiaridad, // Agregar 'familiaridad' al crear el registro
                'mesa_id' => null,
                'email' => $email,
            ]);

            $progressBar->advance();
        }

        fclose($file);
        $progressBar->finish();
        $this->info("\n¡Importación completada con éxito!");

        return 0;
    }
}