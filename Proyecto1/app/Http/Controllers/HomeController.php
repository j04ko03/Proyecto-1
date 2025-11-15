<?php

namespace App\Http\Controllers;

use App\Models\Cartucho;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $cartuchos = Cartucho::where('isBlocked', false)
                            ->orderBy('nombre')
                            ->get();


        $cartuchosConDatos = $cartuchos->map(function ($juego) {
            return $this->agregarDatosJuego($juego);
        });

        return view('home', ['cartuchos' => $cartuchosConDatos]);
    }

    private function agregarDatosJuego($juego) 
    {
        // Definir normas y controles específicos para cada juego
        $datosAdicionales = [
            'normas' => $this->obtenerNormasJuego($juego->id),
            'controles' => $this->obtenerControlesJuego($juego->id),
            'etiqueta' => $this->obtenerEtiquetaJuego($juego->id),
            'archivo' => $this->obtenerArchivoJuego($juego->id)
        ];

        // Combinar datos del juego con datos adicionales
        $juego->normas = $datosAdicionales['normas'];
        $juego->controles = $datosAdicionales['controles'];
        $juego->etiqueta = $datosAdicionales['etiqueta'];
        $juego->archivo = $datosAdicionales['archivo'];

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
                'Tienes 3 vidas por nivel'
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
            'e' => 'Interactuar'
        ];

        // Escribir aqui las excepciones (¿hacer un if else y return = $response?)

    }

    private function obtenerEtiquetaJuego($idJuego)
    {
        $etiquetas = [
            1 => 'MATEMÁTICAS'
        ];

        return $etiquetas[$idJuego] ?? 'JUEGO';
    }

    private function obtenerArchivoJuego($idJuego) // De donde se pillara el js del juego
    {
        $archivos = [
            1 => 'js/scriptJuegos/astro.js'
        ];

        return $archivos[$idJuego] ?? error('No se encontró el juego'); // Insertar una imagen de Capi triste? OPTIONAL
    }
}