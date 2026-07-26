# VENOM ARCHIVE — Especificación de Diseño

> Fecha: 2026-07-02
> Tema: Animales Venenosos (Rediseño SPA)
> Archivos: index.html, styles.css, app.js

---

## 1. Stack Tecnológico

- **3 archivos**: index.html, styles.css, app.js
- **Sin dependencias externas** (no Three.js, no React)
- **Canvas API nativa** para sistema de partículas
- **Custom Elements** (<pixel-canvas>) para efecto shimmer
- **Google Fonts CDN**: Syncopate (700), Space Mono (400/700), Noto Sans JP (500/900)
- **Unsplash CDN**: Imágenes de animales

---

## 2. Sistema de Rutas (Hash SPA)

| Hash | Vista | Descripción |
|------|-------|-------------|
| #/ | Loading | Pantalla de carga inicial con partículas |
| #/galeria | Galería | Grid de 8 tarjetas con pixel-canvas |
| #/especimen/:id | Detalle | Página de información del animal |
| #/acerca | Acerca | Información del proyecto |
| #/autor | Autor | Perfil del estudiante |

---

## 3. Paleta de Colores (Venom Dark)

--void: #030303
--ink-deep: #1a0002
--venom: #d1001c
--venom-glow: #ff2d3d
--anodized: #a1a1a1
--anodized-dim: #52525b
--silver: #c0c0c0
--gold: #b5893d
--card-bg: rgba(10,0,0,0.85)
--card-border: rgba(209,0,28,0.3)

---

## 4. Fondo: Sistema de Partículas (Canvas)

- Canvas fijo, position:fixed, z-index:0, pointer-events:none
- ~1500-2000 partículas circulares (1-3px radius)
- Distribución: 70% void, 15% anodized-dim, 10% venom, 4% venom-glow, 1% gold
- Movimiento Browniano lento (velocidad 0.1-0.5)
- Mouse: atracción de partículas dentro de 150px
- requestAnimationFrame con limitación
- prefers-reduced-motion: desactiva animación
- Overlay: vignette CSS + ruido SVG (5% opacidad)

---

## 5. Cursor Personalizado

- Círculo hueco 40px borde --venom
- Punto central 4px --venom
- mix-blend-mode: exclusion
- Lerp suave (easing 0.08)
- Escala 0.8 en mousedown
- Expansión a 60px en hover tarjetas
- Oculto en táctiles (hover: none)

---

## 6. Tipografía

- Logo / Títulos grandes: Syncopate 700
- ID espécimen: Syncopate 700, 0.7rem
- Nombre científico: Space Mono 400 itálico, 0.85rem
- Meta datos: Space Mono 400, 0.65rem
- Body: Noto Sans JP 500, 1rem
- Acentos japoneses: Noto Sans JP 900

---

## 7. Tarjetas: Pixel Canvas Cards

Cada tarjeta contiene un elemento <pixel-canvas> como fondo interactivo:

- Web Component con Shadow DOM
- Píxeles que aparecen desde el centro al hacer hover
- data-colors: colores del shimmer
- data-gap: espaciado (4-50)
- data-speed: velocidad (0-100)
- data-no-focus: desactiva foco

Estructura de tarjeta:
- SVG icono del animal (serpiente, araña, escorpión, medusa, caracol, pez, pulpo, rana)
- Nombre común
- Nombre científico
- Clase y tipo de toxina
- Hover: pixel shimmer, borde -> venom, translateY(-4px)

---

## 8. Barra de Navegación (Limpia)

- Izquierda: "VENOM ARCHIVE" (Syncopate)
- Centro: ESPECÍMENES · ACERCA · AUTOR (Space Mono)
- Derecha: punto de estado + "SISTEMA ACTIVO"
- Sin emojis, sin "tóxica"
- Fondo semi-transparente con backdrop-filter: blur
- Sticky en parte superior

---

## 9. Páginas de Detalle (8 Especímenes)

Cada espécimen tiene:
- Imagen de Unsplash (lazy-load con IntersectionObserver)
- Nombre (Syncopate, grande)
- Nombre japonés
- Nombre científico
- Barra de progreso de lectura
- 4 secciones de contenido:
  a) PERFIL DE TOXINA — composición, mecanismo, LD50, antídoto
  b) HÁBITAT Y COMPORTAMIENTO — rango geográfico, actividad, alimentación
  c) PROTOCOLO DE ENCUENTRO — primeros auxilios, síntomas, tratamiento
  d) DATOS DEL ESPÉCIMEN — tamaño, peso, longevidad, conservación
- Navegación entre especímenes (anterior/siguiente)
- Botón de volver a galería

Lista de especímenes:
1. Inland Taipan (Oxyuranus microlepidotus) - Neurotoxina
2. Brazilian Wandering Spider (Phoneutria nigriventer) - Neurotoxina
3. Deathstalker Scorpion (Leiurus quinquestriatus) - Neurotoxina
4. Box Jellyfish (Chironex fleckeri) - Toxina poro-formadora
5. Cone Snail (Conus geographus) - Conotoxina
6. Stonefish (Synanceia verrucosa) - Veneno proteico
7. Blue-Ringed Octopus (Hapalochlaena lunulata) - Tetrodotoxina
8. Golden Poison Dart Frog (Phyllobates terribilis) - Batracotoxina

---

## 10. Pantalla de Carga (Loading)

- Centrado: "VENOM ARCHIVE" + "毒性生物資料館"
- Partículas canvas ya funcionando detrás
- Barra de progreso delgada (color venom)
- Auto-avance a /galeria tras 2.5s
- Click para entrar manualmente

---

## 11. Interacciones y Animaciones

| Interacción | Implementación |
|-------------|----------------|
| Partículas mouse | Atracción radio 150px, lerp 0.05 |
| Hover tarjeta | Pixel shimmer, borde -> venom, translateY |
| Transición de vista | Fade 300ms (opacity + translateY) |
| Scroll reveal | IntersectionObserver: translateY(30px) -> 0 |
| Cursor personalizado | mousemove -> lerp posición |
| Reduced motion | Desactiva partículas, shimmer, transiciones |

---

## 12. Imágenes (Unsplash CDN)

Cada detalle usa imágenes de Unsplash:
- Inland Taipan: https://images.unsplash.com/photo-snake-desert
- Brazilian Wandering Spider: https://images.unsplash.com/photo-spider-web
- etc. (8 imágenes en total)
- Lazy-load con IntersectionObserver + data-src pattern
- Fade in al cargar

---

## 13. Archivos

/index.html - Templates HTML, estilos inline críticos, pixel-canvas
/styles.css - Todos los estilos CSS, variables, animaciones, responsive
/app.js - Router SPA, sistema de partículas, pixel-canvas, cursor, navegación
