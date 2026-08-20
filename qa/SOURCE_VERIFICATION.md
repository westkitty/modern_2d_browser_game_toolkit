# Platform Source Verification

**Checked:** 2026-08-18

The final handbook's unstable platform/API claims were checked against current official or specification sources. This file is evidence of source review; it is not a browser-compatibility guarantee for an arbitrary target matrix.

| Claim family | Primary / official source |
|---|---|
| WebGL2 API and instanced drawing | https://registry.khronos.org/webgl/specs/latest/2.0/ |
| WebGL2 `drawElementsInstanced` | https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawElementsInstanced |
| WebGL2 `vertexAttribDivisor` | https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor |
| WebGL context loss/restoration | https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event |
| WebGL context creation error | https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event |
| requestAnimationFrame scheduling | https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame |
| Page visibility | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API |
| devicePixelRatio changes | https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio |
| OffscreenCanvas transfer | https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/transferControlToOffscreen |
| Canvas / OffscreenCanvas standard | https://html.spec.whatwg.org/multipage/canvas.html |
| SharedArrayBuffer / cross-origin isolation | https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated |
| COOP | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy |
| COEP | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy |
| Web Audio specification | https://webaudio.github.io/web-audio-api/ |
| Web Audio best practices | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices |
| IndexedDB | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API |
| IndexedDB upgrades/blocked connections | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB |
| Browser storage quota/eviction | https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria |
| Google Cloud Storage signed URLs | https://cloud.google.com/storage/docs/access-control/signed-urls |
