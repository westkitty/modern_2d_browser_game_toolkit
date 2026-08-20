# Architecture Linter Rules

The linter is intentionally conservative. It flags high-confidence violations and architecture-contract mismatches; it is not a semantic proof of correctness.

| Code | Severity | Meaning | Normal repair |
|---|---|---|---|
| SEC001 | error | private-key material in scanned text | remove secret; rotate if real |
| SEC002 | error | AWS access-key-like literal | remove/rotate; use trusted credential flow |
| SEC003 | error | API-key-like `sk-...` literal | remove/rotate; keep server-side |
| SEC004 | error | JWT-like literal | remove bearer credential from source |
| SEC005 | error | credential-like query parameter in URL | remove from persistent source/logging; redesign capability flow |
| SEC101 | error | SharedArrayBuffer without COOP same-origin | configure isolation or remove SAB |
| SEC102 | error | SharedArrayBuffer without compatible COEP | configure isolation or remove SAB |
| SEC103 | warning | source uses SharedArrayBuffer but contract does not activate it | update contract or remove code |
| WEBGL101 | error | desktop OpenGL-style API name in browser source | use verified WebGL2 API/extension |
| CFG101 | error | generated assets activated without a manifest path | declare the authoritative manifest |
| ASSET101 | error | declared manifest missing | build/materialize it before runtime integration |
| ASSET102 | warning | direct asset-path literal outside allowed loader/catalog surface | route through manifest/catalog or explicitly allow file |
| LIFE101 | warning | many listener additions with no visible removals | verify lifecycle owner/disposal |
| TIME101 | warning | fixed timing selected without declared validation commands | add simulation/backlog tests |
| TIME102 | info | several rAF calls in one file | verify there is only intended loop ownership |
| DEP101 | warning | deployment automation selected without validation commands | declare dry-run/staging validation |
| AUDIO101 | warning | Web Audio activated but no AudioContext found | implement audio owner or correct contract |
| AUDIO102 | warning | AudioContext found with no resume call | verify user-activation lifecycle |

## Suppression

Use `lint.ignoreCodes` only when the project has an explicit, reviewed reason. Use `lint.ignorePaths` for fixtures, generated reports, or vendored text that should not participate in project lint. Suppression is not proof of correctness; record durable exceptions in an ADR when they affect architecture or security.
