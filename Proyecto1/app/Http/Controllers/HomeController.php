<?php

namespace App\Http\Controllers;

use App\Models\Cartucho;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
{
     
     $query = Cartucho::query();

    // FILTRO POR NOMBRE (SI EL USUARIO ESCRIBE ALGO)
    if ($request->filled('codi_buscar')) {
        $filter = $request->codi_buscar;

        $query->orderByRaw("
            CASE
                WHEN nombre LIKE ? THEN 0
                ELSE 1
            END
        ", ["%$filter%"]);

    }

    // ORDENAR SIEMPRE POR NOMBRE
    //$query->orderBy('nombre', 'asc');

    $cartuchos = $query->get();

    $cartuchosConDatos = $cartuchos->map(function ($juego) {
        return $this->agregarDatosJuego($juego);
    });

    return view('home', ['cartuchos' => $cartuchosConDatos]);
}


    private function agregarDatosJuego($juego)
    {
        $rutasJuegos = [
            1 => route('astro.controller'), // ASTRO
            2 => route('volamentes.controller'), // VOLAMENTES
            1002 => route('capi.controller'), // CAPI MATES
            2002 => route('bosque.controller'),
        ];

        $datosAdicionales = [
            'normas' => $this->obtenerNormasJuego($juego->id),
            'controles' => $this->obtenerControlesJuego($juego->id),
            'etiqueta' => $this->obtenerEtiquetaJuego($juego->id),
            'ruta' => $rutasJuegos[$juego->id] ?? '#',
        ];

        $juego->normas = $datosAdicionales['normas'];
        $juego->controles = $datosAdicionales['controles'];
        $juego->etiqueta = $datosAdicionales['etiqueta'];
        $juego->ruta = $datosAdicionales['ruta'];

        return $juego;
    }

    private function obtenerNormasJuego($idJuego)
    {
        // Definir normas para cada juego
        $normas = [
            1 => [ // ASTRO
                'Resuelve operaciones matemáticas',
                'Completa todos los niveles',
                'Consigue la máxima puntuación',
                'Tienes 3 vidas por nivel',
            ],
            // LOS OTROS JUEGOS.
        ];

        return $normas[$idJuego] ?? ['Completa el juego'];
    }

    private function obtenerControlesJuego($idJuego)
    {
        // Controles base para todos los juegos
        return [
            'w' => 'Mover arriba',
            's' => 'Mover abajo',
            'a' => 'Mover izquierda',
            'd' => 'Mover derecha',
            'space' => 'Acción principal',
            'e' => 'Interactuar',
        ];

        // Escribir aqui las excepciones (¿hacer un if else y return = $response?)

    }

    private function obtenerEtiquetaJuego($idJuego)
    {
        $etiquetas = [
            1 => 'MATEMÁTICAS',
            2 => 'INFORMATICA',
            3 => 'MATEMÁTICAS',
            4 => 'INFORMATICA'
        ];

        return $etiquetas[$idJuego] ?? 'JUEGO';
    }

    private function obtenerArchivoJuego($idJuego) // De donde se pillara el js del juego
    {
        $archivos = [
            1 => 'js/scriptJuegos/astro.js',
            2002 => 'js/scriptJuegos/bosque.js',
        ];

        return $archivos[$idJuego] ?? error('No se encontró el juego'); // Insertar una imagen de Capi triste? OPTIONAL
    }
}
