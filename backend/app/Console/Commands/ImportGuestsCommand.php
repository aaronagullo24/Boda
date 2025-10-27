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
    protected $signature = 'import:guests {--f|file= : Archivo CSV para importar invitados}';

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
        $validator = Validator::make(['file' => $this->option('file')], [
            'file' => 'required|file',
        ]);
        if ($validator->fails()) {
            $this->error('Error: El archivo no es válido.');
            return 1;
        }

        // Leer el archivo CSV
        $csvFile = $this->option('file');
        $data = File::get($csvFile);
        $rows = explode("\n", $data);

        // Procesar cada fila del archivo CSV
        foreach ($rows as $row) {
            // Dividir la fila en campos
            $fields = explode(',', $row);

            // Crear un nuevo invitado
            $guest = new Guest();
            $guest->nombre = $fields[0];
            $guest->apellido = $fields[1];
            $guest->email = $fields[2];
            $guest->telefono = $fields[3];
            $guest->familiaridad = $fields[4];
            $guest->comentarios = $fields[5];
            $guest->save();
        }

        $this->info('Invitados importados correctamente.');

        return 0;
    }
}