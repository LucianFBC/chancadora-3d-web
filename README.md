# Chancadora de Mandíbulas — Simulador 3D (prototipo v0.1)

Prototipo interactivo gratuito, con **React 19, Three.js y React Three Fiber**, para explorar una chancadora de mandíbulas en cuatro estados: **vista general**, **funcionamiento**, **X-ray** (transparencia selectiva) y **vista explotada**.

> **Aviso técnico:** el modelo 3D fue construido a partir de primitivas geométricas con proporciones aproximadas. No representa geometría CAD validada, no reproduce esfuerzos ni fractura real del material, y no debe usarse para fabricación ni seguridad operativa.

## Ejecutar en StackBlitz

1. Importa el repositorio de GitHub usando **Import Repository**, o abre `https://stackblitz.com/github/USUARIO/REPOSITORIO` sustituyendo usuario y nombre de repositorio reales.
2. Espera la instalación de las dependencias; ejecuta `npm run dev` si la vista previa no inicia automáticamente.
3. Abre **Preview** y comprueba que la GPU/navegador admite WebGL 2.

## Ejecutar localmente

Necesitas Node.js 22.12+ o Node.js 24 LTS.

```sh
npm install
npm run dev
```

## Alcance

- Navegación orbital, zoom y cambio de vistas.
- Selección de 13 grupos de componentes mediante lista y objetos 3D.
- Animación ilustrativa de volante, eje y mandíbula móvil; control de velocidad y pausa.
- Transparencia de ciertas carcasas en modo X-ray.
- Vista explotada con transición animada.
- Fichas técnicas sin inventar dimensiones reales.

## Siguiente etapa

Sustituir las mallas primitivas por componentes CAD reales exportados a GLB, definir pivotes y cinemática desde dimensiones verificadas y añadir sección interactiva con planos de corte.

## Material de referencia

El ZIP original incluía imágenes y un plano aportados en la conversación. **No se distribuyen en este repositorio público**, porque no se ha establecido su licencia de redistribución; los materiales permanecen disponibles para el trabajo privado de modelado.
