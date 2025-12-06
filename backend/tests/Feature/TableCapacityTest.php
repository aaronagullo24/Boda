<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Mesa;
use App\Models\Guest;

class TableCapacityTest extends TestCase
{
    use RefreshDatabase;

    public function test_reducing_capacity_unassigns_excess_guests()
    {
        // 1. Crear mesa con capacidad 5
        $mesa = Mesa::create(['nombre' => 'Mesa Grande', 'capacidad' => 5]);

        // 2. Asignar 5 invitados
        for ($i = 0; $i < 5; $i++) {
            Guest::create([
                'nombre' => "Invitado $i",
                'mesa_id' => $mesa->id,
                'confirmado' => true,
                'email' => "guest$i@test.com",
                'apellido' => 'Test',
                'familiaridad' => 'Amigo',
                'seat_position' => $i
            ]);
        }

        $this->assertEquals(5, $mesa->guests()->count());

        // 3. Editar mesa a capacidad 3
        $response = $this->putJson("/api/mesas/{$mesa->id}", ['capacidad' => 3]);

        $response->assertStatus(200);

        // 4. Verificar que 2 invitados ahora tienen mesa_id null
        $this->assertEquals(3, $mesa->guests()->count());
        $this->assertEquals(2, Guest::whereNull('mesa_id')->count());
    }
}
