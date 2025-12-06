<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Mesa;
use App\Models\Guest;

class GuestAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_assign_guest_to_full_table()
    {
        // 1. Crear una mesa con capacidad 1
        $mesa = Mesa::create(['nombre' => 'Mesa Test', 'capacidad' => 1]);

        // 2. Crear 2 invitados
        $guest1 = Guest::create(['nombre' => 'Invitado 1', 'apellido' => 'Test', 'email' => 'g1@test.com', 'confirmado' => true, 'familiaridad' => 'Amigo']);
        $guest2 = Guest::create(['nombre' => 'Invitado 2', 'apellido' => 'Test', 'email' => 'g2@test.com', 'confirmado' => true, 'familiaridad' => 'Amigo']);

        // 3. Asignar invitado 1 a la mesa -> Debe retornar 200 OK
        $response1 = $this->putJson("/api/guests/{$guest1->id}", ['mesa_id' => $mesa->id]);
        $response1->assertStatus(200);

        // 4. Asignar invitado 2 a la mesa -> Debe retornar 422 Unprocessable Entity
        $response2 = $this->putJson("/api/guests/{$guest2->id}", ['mesa_id' => $mesa->id]);
        $response2->assertStatus(422)
            ->assertJson(['message' => 'La mesa está llena.']);
    }
}
