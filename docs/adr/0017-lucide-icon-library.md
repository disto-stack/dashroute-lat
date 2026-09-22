# ADR 0017: Icon Library — Lucide

## Status

Accepted

## Context

ADR 0015 define `packages/ui` como la librería compartida de componentes del design system, pero no especifica cómo se implementa `Icon`. Durante la construcción inicial de `Icon` (`packages/ui/src/Icon/`) se copiaron a mano, desde el `bundle.js` de referencia del artifact del design system, los 15 paths SVG usados por el sistema (`chevron`, `pin`, `box`, `arrow`, `check`, `logout`, `power`, `nav`, `close`, `search`, `plus`, `list`, `user`, `sliders`, `menu`).

El set de íconos del design system se dibujó desde el inicio siguiendo el lenguaje visual de [Lucide](https://lucide.dev) (trazo 2px, extremos y uniones redondeados, cuadrícula de 24px), y los 15 nombres cortos del sistema tienen equivalente 1:1 en la librería real. Mantener los paths copiados a mano significa duplicar y sostener manualmente geometría que ya existe, mantenida y versionada, en una librería con soporte nativo dual para web (`lucide-react`) y React Native (`lucide-react-native`) con la misma API (`size`, `strokeWidth`, `color`).

## Decision

`Icon` (`packages/ui/src/Icon/Icon.tsx` y `Icon.native.tsx`) usa las librerías reales `lucide-react` (web) y `lucide-react-native` (React Native, sobre `react-native-svg`, ya dependencia del paquete) en vez de paths SVG dibujados a mano. Ambas versiones exponen la misma API pública del sistema (`IconName`, `size?`, `strokeWidth?`, `color?`) — el consumidor nunca ve el nombre real del ícono de Lucide, solo el nombre corto del sistema.

Tabla de mapeo, fuente de verdad para agregar íconos nuevos:

| Sistema | Lucide | Sistema | Lucide | Sistema | Lucide |
| --- | --- | --- | --- | --- | --- |
| `chevron` | `ChevronDown` | `logout` | `LogOut` | `plus` | `Plus` |
| `pin` | `MapPin` | `power` | `Power` | `list` | `List` |
| `box` | `Package` | `nav` | `Navigation` | `user` | `User` |
| `arrow` | `ArrowRight` | `close` | `X` | `sliders` | `SlidersHorizontal` |
| `check` | `Check` | `search` | `Search` | `menu` | `Menu` |

Un ícono nuevo se agrega primero a esta tabla (nombre corto del sistema + ícono real de Lucide) y solo después al mapa `ICONS` de `Icon.tsx`/`Icon.native.tsx`.

Fuera de alcance: `Logo` (la marca de DashRoute — el ícono cuadrado con la ruta punteada) sigue dibujada a mano con formas SVG propias en ambas plataformas; no es un ícono genérico y no tiene equivalente en Lucide.

## Consequences

### Positive

- **Menos código para mantener:** no hay geometría SVG propia que sostener a mano; Lucide versiona y corrige sus propios paths.
- **Paridad real web/native:** `lucide-react` y `lucide-react-native` comparten API y catálogo de nombres, evitando que las dos plataformas diverjan.
- **Set de íconos ampliable sin esfuerzo:** un ícono nuevo del sistema casi siempre ya existe en Lucide (+1500 íconos), solo hay que mapearlo.

### Negative

- **Nueva dependencia externa** (`lucide-react` + `lucide-react-native`) en `packages/ui`, con su propio ciclo de versiones a seguir.
- **El nombre corto del sistema es indirección obligatoria:** cualquiera que lea el código de un componente consumidor (`<Icon name="pin" />`) necesita la tabla de mapeo para saber qué ícono real de Lucide se está usando.
