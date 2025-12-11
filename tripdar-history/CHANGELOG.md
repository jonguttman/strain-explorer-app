# Tripdar Changelog

## 0.3.3 — Microdose Radial Bars

**Feature:** New microdose-specific visualization replacing Golden Aura radar when viewing the Micro dose level.

### Data Model
- Added `MicroVibeId`, `MicroVibes`, `MicroVibesByDose` types to `lib/types.ts`
- Extended `StrainJsonEntry` with optional `microVibes` field
- Extended `StrainDoseResult` with optional `microVibes` field
- Added validation for complete micro-vibe sets (all 6 required)

### New Component
- Created `app/components/tripdar/MicrodoseRadialBars.tsx`
- 6 radial bars: ease, desire, lift, connect, create, focus
- Golden semicircle plate with "Tripdar™ / MICRODOSE PROFILE" branding
- Bars with Golden Aura-style glow (outer blur + tip sparkle)
- Breathing pulse animation with synchronized glow
- Elegant tilted labels (~10deg) for modern data-viz aesthetic

### Behavior
- Renders when `doseKey === "micro"` AND `microVibes` data exists
- Falls back to Golden Aura radar if no microVibes data available
- Preserves all surrounding UI (starfield, header, chips, mode switch)
- Added visualization transition system (fade + translate) for mode swap
- Added `?microviz=1` query parameter override for developer testing

### Visual Specifications
- Semi-halo bar arrangement: -100°, -60°, -20°, +20°, +60°, +100°
- Minimum bar visibility rule (values < 10 display as 10)
- Arc path rendering for plate (avoids mask blur issues)
- Correct z-index stacking above starfield

### Files Changed
- `lib/types.ts` — New MicroVibe types
- `data/strainData.ts` — MicroVibes extraction + validation logic
- `app/api/strains/[strainId]/dose/[doseKey]/route.ts` — microVibes in payload
- `app/StrainExplorerClient.tsx` — Pass microVibes to RadarPanel
- `app/components/RadarPanel.tsx` — Conditional render + transition + override

### Files Added
- `app/components/tripdar/MicrodoseRadialBars.tsx` — New visualization component
- `tripdar-history/CHANGELOG.md` — This changelog

### Admin (Future)
- Architecture planned for strain-specific microVibes editing
- Preview mode for MicrodoseRadialBars component
