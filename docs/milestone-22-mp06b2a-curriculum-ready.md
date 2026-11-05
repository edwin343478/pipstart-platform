# M22 MP06b2a — curriculum editor hydration readiness

## Source scope

Owner-run correction to the accepted MP06b2 course and module editor, applied after MP06d. It is the same fix MP06c2a made to the lesson editor: React resets a server-rendered controlled field when the page hydrates, so text typed before hydration was silently dropped, or merged with the stored value when a selection straddled hydration (proven in the MP06c2 investigation).

The editor now stays inert until it has hydrated: the form reports `aria-busy`, and its fieldset, Save draft and Load latest buttons are disabled until then. It uses the same `useSyncExternalStore` hydration signal as the lesson editor and `SteppedLessonArticle`, declared after the native leave guard, so the guard is active before the first field accepts input. Nothing else changes.

## Verification and owner application

See the packet's preparation results for focused and full unit tests (including a new check that the server-rendered editor is inert), both TypeScript configurations, scoped lint and format, the default-off production webpack build and the public-bundle check. The connected acceptance adds a step that opens the module editor and types its title without waiting, the pattern that failed for lessons, and requires the exact typed value. No migration, account, hosted setting, flag, commit or push is included.
