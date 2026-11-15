# Editor engines

The interface keeps the existing visual theme. Source assets remain immutable and local. Project JSON remains backward compatible; new properties are optional. Serialization and validation happen at document boundaries, not inside the new evaluation loops.

## Boundaries and memory

- History: a framework-independent command interface and bounded ring buffers. A drag/slider gesture is one transaction. Snapshots reference immutable settings, never media buffers.
- Numbers: pointer input updates scalar scratch state; requestAnimationFrame publishes changes. Shift multiplies the step by ten, Alt divides it by ten. Escape cancels a gesture. Pointer lock, when available, permits continuous scrubbing.
- Images: a dedicated worker owns the decoded ImageBitmap, reusable geometry stages and the color renderer. Geometry and color have separate dirty keys. Pixel histograms and export encoding execute in the worker. Transferable bitmaps carry previews; each is closed after presentation. The GPU color stage works on bounded tiles with a floating-point intermediate when supported, followed by a display transform. The source bitmap is closed and GPU objects explicitly disposed on replacement/termination.
- Video: integer flicks (705,600,000 ticks/second) and exact rational frame rates form the timeline core. Browser seconds are converted only at media/UI boundaries. Compiled keyframes write into caller-owned scratch state. The same evaluator serves preview and export. UI playback snapshots are throttled independently of frame presentation.
- Models: a background worker evaluates an ordered, optional modifier stack on typed vertex/index buffers. Cache keys depend only on source geometry and upstream modifier settings. Buffers cross the worker boundary by ownership transfer; materials/transforms do not trigger geometry evaluation. Half-edge adjacency uses integer arrays. GPU geometry is replaced/disposed only when evaluation changes.

## Failure and race handling

Worker results have generation IDs: stale results cannot replace newer settings or another source. Queues retain the latest interactive job rather than accumulating pointer updates. Export uses an explicit snapshot. Worker errors, context loss and unsupported browser features produce a usable fallback or a clear error. Output/evaluated geometry sizes are bounded before allocation. Changes remain undoable; disabling/reordering a modifier preserves the original mesh.

## Verification and limits

Tests cover transactional history, exact frame boundaries, interpolation, topology/modifier output, validation and lifecycle behavior; browser tests exercise persistence and actual exported files. Timings and engine capability information report measured work, not a promised frame rate.

This browser application does not implement full ACES/ICC color management, RAW/HDR decoding, a Photoshop brush/layer engine, predictive hardware decoder proxies, arbitrary multitrack compositing, USD/rigging, or production CAD booleans. An sRGB bitmap source and an 8-bit downloadable image cannot become HDR solely through floating-point intermediates. Browser codecs, WebGL extensions and device memory determine available acceleration. Existing export limits remain explicit in the UI.

## Delivered controls

- All four studios share bounded command history. Numeric values support scrubbing, fine/coarse steps and cancel; photo/video sliders also have exact editable numbers. High-frequency 2D/crop pointer input is coalesced by animation frames. Snap targets are computed once at gesture start. Account draft backups are debounced and flushed on page exit; settings objects keep their identity across parent UI changes.
- 2D groups select/move together, survive JSON saves and receive independent IDs when copied. Exported SVG/PNG still reflects the same composed geometry.
- The photo worker decodes an immutable cached Blob directly; the CSP need not allow fetching blob URLs. Separate geometry/color keys reuse the expensive oriented stage. Up to 512×512 GPU tiles use a halo and a float16 intermediate when available; CPU processing in the same worker remains the compatibility path. RGB histogram analysis is capped at a 256-pixel longest side. The fitted ACES tone curve is a display option, not an ACES-certified pipeline. Compatibility blur uses Canvas's filter implementation.
- Video supports 23.976/24/25/29.97/30/59.94/60 fps. Integer ticks determine clip boundaries, seeking and splitting. Up to 120 unique source-time keys per clip animate zoom, pan, brightness and volume, using linear, smooth Hermite or hold interpolation. A 3-band native biquad EQ is routed identically in preview and export. A real audio analyser supplies peak/RMS meters; frame timing summaries measure CPU paint cost. Composition remains driven by browser media playback; sample-accurate editorial audio synchronization and offline audio rendering are not claimed.
- 3D supports eight ordered Mirror/Array/Loop-or-linear Subdivision/Twist modifiers per object. Typed half-edge tables handle adjacency; subdivision welds duplicate source positions and refuses non-manifold inputs. Each evaluation is capped at 100,000 vertices / 600,000 indices; total scene export is capped at 1,000,000 vertices / 3,000,000 indices. The 32 MB CPU cache keeps upstream results, and stale interactive work is coalesced per object. Worker outputs transfer ownership to direct BufferAttributes without an additional main-thread typed-array copy. Baking obeys the original 10,000-vertex / 60,000-index / 200 KB editable-document limits. OBJ parsing and OBJ/GLB export also run in the worker. World/local transform controls remain screen-sized, and the viewport redraws on demand, including camera damping.

There are bounded copies when converting persisted JSON to typed buffers and when retaining a cache while transferring an output. This release does not claim zero-copy throughout the browser or zero allocation throughout the React UI. Tests validate correctness and measured behavior on the test browser; no universal 60–120 fps guarantee is made.
