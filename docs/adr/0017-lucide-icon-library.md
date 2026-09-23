# ADR 0017: Icon Library — Lucide

## Status

Accepted

## Context

ADR 0015 defines `packages/ui` as the shared component library for the design system, but does not specify how `Icon` is implemented. During the initial build of `Icon` (`packages/ui/src/Icon/`), the 15 SVG paths used by the system (`chevron`, `pin`, `box`, `arrow`, `check`, `logout`, `power`, `nav`, `close`, `search`, `plus`, `list`, `user`, `sliders`, `menu`) were copied by hand from the reference `bundle.js` of the design system artifact.

The design system's icon set was drawn from the start following [Lucide](https://lucide.dev)'s visual language (2px stroke, rounded caps and joins, 24px grid), and the system's 15 short names each have a 1:1 equivalent in the real library. Keeping the hand-copied paths means duplicating and manually maintaining geometry that already exists, maintained and versioned, in a library with native dual support for web (`lucide-react`) and React Native (`lucide-react-native`) sharing the same API (`size`, `strokeWidth`, `color`).

## Decision

`Icon` (`packages/ui/src/Icon/Icon.tsx` and `Icon.native.tsx`) uses the real `lucide-react` (web) and `lucide-react-native` (React Native, on top of `react-native-svg`, already a dependency of the package) libraries instead of hand-drawn SVG paths. Both versions expose the same public system API (`IconName`, `size?`, `strokeWidth?`, `color?`) — consumers never see the real Lucide icon name, only the system's short name.

Mapping table, the source of truth for adding new icons:

| System | Lucide | System | Lucide | System | Lucide |
| --- | --- | --- | --- | --- | --- |
| `chevron` | `ChevronDown` | `logout` | `LogOut` | `plus` | `Plus` |
| `pin` | `MapPin` | `power` | `Power` | `list` | `List` |
| `box` | `Package` | `nav` | `Navigation` | `user` | `User` |
| `arrow` | `ArrowRight` | `close` | `X` | `sliders` | `SlidersHorizontal` |
| `check` | `Check` | `search` | `Search` | `menu` | `Menu` |

A new icon is added first to this table (system short name + real Lucide icon) and only then to the `ICONS` map in `Icon.tsx`/`Icon.native.tsx`.

Out of scope: `Logo` (the DashRoute mark — the square icon with the dotted route) stays hand-drawn with its own SVG shapes on both platforms; it is not a generic icon and has no Lucide equivalent.

## Consequences

### Positive

- **Less code to maintain:** no custom SVG geometry to hand-maintain; Lucide versions and fixes its own paths.
- **Real web/native parity:** `lucide-react` and `lucide-react-native` share an API and icon catalog, keeping the two platforms from drifting apart.
- **Icon set grows with near-zero effort:** a new system icon almost always already exists in Lucide (1500+ icons), it just needs mapping.

### Negative

- **New external dependency** (`lucide-react` + `lucide-react-native`) in `packages/ui`, with its own version cycle to track.
- **The system's short name is a mandatory layer of indirection:** anyone reading a consumer component's code (`<Icon name="pin" />`) needs the mapping table to know which real Lucide icon is being used.
