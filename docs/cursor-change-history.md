# Cursor Change History

This document tracks significant changes made to the codebase, organized by phase.

---

## Phase 8: Megaphase (8A-8F)

### Phase 8A - Cosmic Timeline 2.0

**Goal**: Extend timeline engine from single-band to multi-band layered animation system.

**Changes Made**:

1. **New Files Created**:
   - `app/lib/tripdarExperienceState.ts` - Unified experience state shared between themes
   - `app/cosmic-theme/choreography/timelineEngine.ts` - Multi-band timeline engine
   - `app/cosmic-theme/hooks/useCosmicTimelinePlayer.ts` - RAF-based animation loop
   - `app/cosmic-theme/config/cosmicThemeVisualPresets.ts` - Visual preset configurations
   - `app/cosmic-theme/config/cosmicThemeChoreography.ts` - Choreography profiles
   - `app/cosmic-theme/CosmicThemeHalo.tsx` - Multi-band gradient halo component
   - `app/cosmic-theme/CosmicThemeStars.tsx` - Two-layer star anchor component
   - `app/cosmic-theme/CosmicThemeRadar.tsx` - Animated radar polygon renderer
   - `app/cosmic-theme/CosmicThemeMessages.tsx` - Animated message display
   - `app/cosmic-theme/CosmicThemeDemo.tsx` - Orchestrator component
   - `app/cosmic-theme/index.ts` - Module exports
   - `app/components/CosmicThemeAdapter.tsx` - Adapter for existing UI integration
   - `app/lab/cosmic-theme/page.tsx` - Lab page for testing

2. **Key Features**:
   - Multi-band halo (up to 3 independent bands with offset rotations)
   - Two-layer star system (foreground/background with parallax)
   - Effect word categories map to motion profiles
   - Dose intensity scales animation amplitude
   - Strain-specific signatures via deterministic hash
   - Full `reduceMotion` accessibility support

---

### Phase 8B - Apothecary Theme

**Goal**: Fully realize the Apothecary theme as a selectable option.

**Changes Made**:

1. **Enhanced Presets**:
   - Refined `APOTHECARY_PRESET` with warm sepia/parchment tones
   - "Candle glow" halo effect with amber gradients
   - Softer motion profile (35% slower than Cosmic)

2. **New Files**:
   - `app/cosmic-theme/CosmicThemeContext.tsx` - Theme context for state management
   - `app/components/ThemeAwareModeSwitch.tsx` - Enhanced mode switch with preset selector

3. **Architecture Decision**:
   - Apothecary implemented as Cosmic preset variant (Option A)
   - `themeMode` stays `"classic" | "cosmic"`, with `presetId` as sub-selector

---

### Phase 8C - Single-Engine Radar Unification (Scaffolding)

**Goal**: Define architecture for eventual unified radar engine.

**Changes Made**:

1. **New Files**:
   - `lib/radar/unifiedRadarTypes.ts` - Shared radar interfaces
   - `lib/radar/unifiedRadarGeometry.ts` - Shared geometry helpers
   - `lib/radar/index.ts` - Module exports

2. **Key Types Defined**:
   - `RadarGeometry` - Physical layout configuration
   - `RadarAxisData` - Single axis data point
   - `RadarPolygonData` - Computed polygon with vertices
   - `RadarVisualSkin` - Theme-agnostic styling

3. **Note**: This phase is scaffolding only - no rendering changes.

---

### Phase 8D - Performance and GPU Optimization

**Goal**: Ensure 60fps on kiosk-class hardware.

**Changes Made**:

1. **Memoization**:
   - Added `React.memo` wrappers to all Cosmic theme components
   - Verified stable prop references throughout

2. **New Files**:
   - `app/cosmic-theme/hooks/useCosmicPerfTracer.tsx` - Performance instrumentation
   - `CosmicDebugHud` component for debug overlay (gated by `enabled` flag)

3. **Optimizations**:
   - Single RAF loop enforced by `useCosmicTimelinePlayer`
   - `willChange` CSS hints on animated elements
   - Throttle mode support for low-power environments

---

### Phase 8E - Classic+ Modernization

**Goal**: Upgrade Classic visuals to match Cosmic polish.

**Changes Made**:

1. **New Files**:
   - `app/hooks/useThemedColors.ts` - Theme-aware color utilities

2. **Enhanced Files**:
   - `app/components/strainConstants.ts`:
     - Extended `DOSE_STYLE` with `glowBlur`, `glowOpacity`, `pointGlow`
     - Enhanced `heroGlowPlugin` with multi-layer glow effects
   - `app/components/RadarPanel.tsx`:
     - Updated to use enhanced glow settings

3. **Visual Enhancements**:
   - Layered glow effect (outer diffuse + inner sharp)
   - Point glow highlights at vertices for higher doses
   - Progressive intensity scaling by dose level

---

### Phase 8F - Integration, Cleanup, and Documentation

**Goal**: Ensure codebase coherence, documentation, and production safety.

**Changes Made**:

1. **Documentation**:
   - Created `docs/cursor-change-history.md` (this file)
   - Added JSDoc comments to public APIs

2. **Verification**:
   - TypeScript strict mode passes
   - All debug overlays gated by flags
   - Feature flags default to safe production values

---

## Summary

Phase 8 introduced a complete Cosmic theme visualization system alongside enhancements to the Classic radar. Key architectural decisions:

1. **Theme Architecture**: Cosmic themes are implemented as preset variants, keeping the theme mode binary (classic/cosmic) with presets as a secondary selector.

2. **Shared Abstractions**: The `lib/radar/` module provides type scaffolding for future unification of Classic and Cosmic renderers.

3. **Performance**: All components are memoized, and the single RAF loop pattern ensures smooth 60fps animation.

4. **Accessibility**: Full `prefers-reduced-motion` support throughout.
