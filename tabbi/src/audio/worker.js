// Builds the soundtrack off the main thread so the title card stays responsive.
import { buildSoundtrack } from './mix.js';
self.onmessage = async () => {
  try {
    const st = await buildSoundtrack();
    self.postMessage({ ok: true, L: st.L, R: st.R, n: st.n }, [st.L.buffer, st.R.buffer]);
  } catch (e) { self.postMessage({ ok: false, error: String(e && e.message) }); }
};
