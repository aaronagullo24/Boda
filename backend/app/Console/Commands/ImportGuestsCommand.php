<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Guest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ImportGuestsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:guests {--f|file= : Archivo CSV para importar invitados} {--header : Indica si el CSV tiene encabezado}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa invitados desde un archivo CSV';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Validar el archivo CSV
        $csvFile = $this->option('file');
        if (!$csvFile || !is_string($csvFile) || !File::exists($csvFile)) {
            $this->error('Error: El archivo no es válido.');
            return 1;
        }

        // Leer el archivo CSV
        $data = File::get($csvFile);

        // Resetear la tabla de invitados antes de importar
        Guest::truncate();

        // Detectar saltos de línea y dividir filas
        $rows = preg_split("/(\r\n|\n|\r)/", trim($data));

        $hasHeader = (bool) $this->option('header');
        $rowNumber = 0;
        foreach ($rows as $row) {
            $rowNumber++;
            if ($hasHeader && $rowNumber === 1) {
                // Omitir encabezado
                continue;
            }
            $row = trim($row);
            if ($row === '') {
                continue;
            }

            // Soportar campos delimitados por coma respetando comillas
            $fields = str_getcsv($row);
            $count = count($fields);
            if ($count < 2) {
                // Requiere al menos nombre y apellido
                $this->warn("Fila $rowNumber omitida: columnas insuficientes");
                continue;
            }

            $nombre = trim($fields[0] ?? '');
            $apellido = trim($fields[1] ?? '');
            $familiaridad = trim($fields[$count - 1] ?? ''); // última columna

            if ($nombre === '' && $apellido === '') {
                $this->warn("Fila $rowNumber omitida: nombre y apellido vacíos");
                continue;
            }

            // Crear un nuevo invitado con valores por defecto para campos no provistos
            $guest = new Guest();
            $guest->nombre = $nombre;
            $guest->apellido = $apellido;
            $guest->email = 'invitado_' . uniqid() . '@boda.local';
            $guest->confirmado = false;
            $guest->mesa_id = null;
            $guest->familiaridad = $familiaridad;
            $guest->save();
        }

        $this->info('Invitados importados correctamente.');

        return 0;
    }
}