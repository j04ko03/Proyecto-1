<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$rols): Response
    {
        $usuari = Auth::user();
        if(!$usuari || !in_array($usuari->id_rol, $rols)){
            $response = redirect("/login");
        }else{
            $response = $next($request);
        }
        return $response;
    }
}
