# A connected creative workspace

The original cream, lime and charcoal palette now carries a working creative sequence across the application:

- **Spark (`/spark`)** is a public, interactive poster workshop. Three compositions, six palettes, three sizes, editable headlines/captions and bounded density/variation controls produce native design documents. The preview and saved project use the same geometry; every motif and text line remains editable. No inference provider is called to generate these compositions. Three authored practice briefs connect the workshop to relevant lessons.
- Guests can try compositions and share their settings. Signing in preserves the composition in the return URL. Creating the private project requires an explicit button press. Requests use a stable UUID so retrying a lost response does not duplicate a project. A shared variation URL includes the poster text, as the sharing control explains.
- **Learning → practice:** each lesson opens the relevant studio with a private practice project and its brief. Visual courses start with editable geometric artwork; 3D starts with three native primitives. Photo/video learners supply their own local media. UX practice starts in notes. A user/lesson-specific local reference resumes the same saved project on that browser; deletion is detected before creating another.
- **Studio:** project descriptions are available in a collapsed “Idea behind this work” section. Practice projects link back to their lesson. Focus mode hides this panel. The AI advisor is compact, can expand on request, and safely formats plain model output into paragraphs, lists and code.
- **Projects and portfolio:** search/filter the complete metadata collection, duplicate, rename, archive/restore and publish. Visible design cards request private, owner-checked previews. Long text layers are shortened only in thumbnails; source documents remain intact. The case-story form preserves earlier descriptions and saves the challenge, approach and reflection as plain project-description text (1,000-character limit). Public pages show the author's story alongside the work.
- **Services:** buyers can build a brief from goals, audience, references, files and timing. Answers are inserted into the editable request only when the buyer presses the button. Sending the request is a separate action; privacy, seller-set prices and the existing order lifecycle remain in force.

Workspace metadata excludes editable documents and private order messages. Public portfolios paginate only published, public projects. All interface additions have Russian, English and Kazakh copy. No database migration is required for these changes.

## Loading and recovery

Route bundles load on demand. One session provider owns the account check across navigation. Deliberate navigation intent can prefetch a route; Save-Data and slow 2G connections skip this optimization. Read requests time out with an explicit retry state, and caller cancellation stays distinct from network failure. Fonts are self-hosted with their licenses.

These are browser-based creative tools. Spark offers procedural compositions and practice briefs, not an automated judgment of artistic quality. Self-review checkboxes are the learner's own assessment. Photo/video originals remain in the existing device media cache; they are not uploaded to a cloud media service.

The automated checks cover saved source fidelity, sign-in return state, retry idempotency, owner-only thumbnails, public case stories, practice resumption, multilingual mobile layouts and the pre-existing editor export workflows.
