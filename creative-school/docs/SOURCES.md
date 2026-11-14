# Learning sources and editorial notes

The application contains **32 authored lesson expansions and 96 formative questions**, plus the original catalog and eight capstone briefs. Every expansion has Russian, English and Kazakh objectives, explanations, a worked example, a practical task, deliverables, self-review criteria and answer explanations. `curriculum.ts` synchronizes questions, task briefs and study/practice durations from `lesson-materials.ts`; the Worker and interface therefore assess the same version.

The teaching text and exercises are original synthesis, not copies of the linked courses. Publisher names identify further reading, not partnership or certification. The translations were authored for this application; native-speaker or instructor review is not claimed. Practical assignments are self-reviewed. A small formative quiz is not an exam secure against inspecting the client catalog.

## Sources consulted

Sources below were checked during development on 13–14 November 2026 using normal HTTPS requests or the web reader. Page text was inspected for the relevant concepts. Where a page redirects, the current canonical destination is used. Availability, publisher interfaces and course editions can change.

### Visual design and accessibility

- [Visual Hierarchy in UX: Definition](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) — Nielsen Norman Group; hierarchy, grouping and evaluation through reduced/blurred views. HTTPS response 200; relevant body content inspected.
- [Spacing units](https://designsystem.digital.gov/design-tokens/spacing-units/) — U.S. Web Design System; a documented spacing-token example based on multiples of 8 px, not a universal mandate. HTTPS 200; token discussion inspected.
- [Using type](https://designsystem.digital.gov/design-tokens/typesetting/overview/) — USWDS; relationships among typeface metrics, size and line height. HTTPS 200; typesetting sections inspected.
- [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) — W3C WAI; 4.5:1/3:1 thresholds, large-text conditions and avoiding threshold rounding. HTTPS 200; relevant explanation inspected.
- [Understanding SC 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) — W3C WAI; keyboard-focus visibility. HTTPS 200.
- [Understanding SC 3.3.2: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) — W3C WAI; persistent field context and helpful instructions. HTTPS 200.

### User experience, art direction and portfolios

- [Learning about users and their needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) — GOV.UK Service Manual; evidence-based needs and separating problems from selected solutions. HTTPS 200; relevant guidance inspected.
- [Using moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing) — GOV.UK; realistic tasks, observation and facilitation. HTTPS 200.
- [Making prototypes](https://www.gov.uk/service-manual/design/making-prototypes) — GOV.UK; choosing prototypes for learning. HTTPS 200. An older guessed alpha/prototype URL returned 404 and was excluded.
- [5 Steps to Creating a UX-Design Portfolio](https://www.nngroup.com/articles/ux-design-portfolios/) — Nielsen Norman Group; communicating process, roles and relevant evidence. HTTPS 200 and web-reader body inspected.
- [Design Critiques: Encourage a Positive Culture to Improve Products](https://www.nngroup.com/articles/design-critiques/) — Nielsen Norman Group; agreed objectives and constructive, scoped feedback. HTTPS 200 and web-reader body inspected.
- [How to write a creative brief](https://www.figma.com/resource-library/how-to-write-a-creative-brief/) — Figma; audience, purpose, parameters and deliverables. Web-reader body inspected on 14 November.
- [How to make a mood board](https://www.figma.com/resource-library/how-to-make-a-mood-board/) — Figma; direction, annotation and feedback. Web-reader body inspected on 14 November. No generative-AI statistics or marketing claims were imported into the lessons.
- [About CC Licenses](https://creativecommons.org/cc-licenses/) — Creative Commons; license elements and attribution/usage conditions. HTTPS 200. Lessons give a general checklist, not a legal determination for a particular asset.

### Image editing

- [GIMP 3.0: Crop](https://docs.gimp.org/3.0/en/gimp-tool-crop.html) — GIMP Documentation; crop area, ratio, position and output considerations. HTTPS 200 and web-reader body inspected.
- [GIMP 3.0: Colors Menu](https://docs.gimp.org/3.0/en/gimp-colors-menu.html) — GIMP Documentation; available adjustment categories. HTTPS 200.
- [GIMP 3.0: Brightness-Contrast](https://docs.gimp.org/3.0/en/gimp-tool-brightness-contrast.html) — GIMP Documentation; global adjustments and the greater selectivity of Levels/Curves. HTTPS 200 and web-reader body inspected. An inaccessible guessed filters-introduction page was excluded.

### 3D and animation

- [Mesh primitives](https://docs.blender.org/manual/en/latest/modeling/meshes/primitives.html), [modeling introduction](https://docs.blender.org/manual/en/latest/modeling/introduction.html) — Blender Manual; geometry vocabulary and blockout.
- [Principled BSDF](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html) — Blender Manual; physically based material parameters.
- [Light objects](https://docs.blender.org/manual/en/latest/render/lights/light_object.html) — Blender Manual; light types and behavior.
- [Output properties](https://docs.blender.org/manual/en/latest/render/output/properties/output.html) — Blender Manual; output and render workflow.
- [Keyframes introduction](https://docs.blender.org/manual/en/latest/animation/keyframes/introduction.html), [F-curves introduction](https://docs.blender.org/manual/en/latest/editors/graph_editor/fcurves/introduction.html), [cameras](https://docs.blender.org/manual/en/latest/render/cameras.html) — Blender Manual; timing, interpolation and framing.
- [Animation Fundamentals](https://studio.blender.org/training/animation-fundamentals/) — Blender Studio; training overview inspected, not the entire paid/access-controlled course.
- [How to get started on storyboarding](https://www.adobe.com/creativecloud/video/discover/storyboarding.html) — Adobe; storyboard workflow.

The 3D/animation source pages above were retrieved successfully with HTTPS 200 and relevant excerpts inspected before the workspace replacement. A later crawler used by another agent returned an access error for a Blender `latest` page; access varies by client. The links remain official further reading. The source evidence was reconstructed at `work/course-sources/model-source-verification.json` during development, which is a scratch artifact and not needed by the application. A Khan Academy client-challenge response and an Adobe animation-principles 404 were excluded.

### Video and audio

- [Trim clips in Premiere](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/trim-a-clip.html) — Adobe Help; trimming a clip edge and distinguishing editing actions. HTTPS 200 after redirect from the older Premiere Pro URL.
- [Adjust audio gain in Premiere](https://helpx.adobe.com/premiere/desktop/add-audio-effects/adjust-volume-and-levels/adjust-gain-in-audio.html) — Adobe Help; gain, levels and peaks. HTTPS 200 after redirect.
- [DaVinci Resolve: Training](https://www.blackmagicdesign.com/products/davinciresolve/training) — Blackmagic Design; publicly available training overview and links to editing/Fairlight resources. HTTPS 200 and page body inspected. This does not mean every linked video, PDF, lesson file or exam was consumed or is redistributed here.

## Scope of the browser studios

External sources sometimes demonstrate full desktop applications. Lessons distinguish transferable concepts from product-specific capabilities: browser media sources may need relinking, exports depend on browser codec support, and advanced mesh/animation/color/audio pipelines may require Blender, GIMP, Resolve or another editor. Links do not imply every feature of those applications exists here. No external lesson videos, copyrighted example images or course files are bundled.
