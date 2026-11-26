# Portafolio de Dylan Montes Castrillón

Portafolio personal: desarrollador full stack (React, PHP Laravel, SQL, Kotlin).
Sitio en vivo: https://portafolio-dylan-montes-2etk.vercel.app

## Stack

Vite + React 18, Three.js con React Three Fiber (pila de contenedores 3D del inicio), GSAP y CSS propio.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Cómo agregar un proyecto

1. Agrega un objeto al arreglo `projects` en `src/data.js` (título, estado, stack, enlaces).
2. Si tiene captura, guárdala en `public/shots/` (WebP, 900 px de ancho) y referencia la ruta en `shot`.
   `shotType: 'scroll'` hace que la captura se desplace al pasar el cursor; `'static'` la deja fija.
3. Los primeros 11 proyectos aparecen como contenedores en la pila 3D; los 4 primeros quedan al frente.

## CV

`public/cv/CV_Dylan_Montes_Castrillon.pdf` es la versión pública del CV (sin teléfonos de referencias).
