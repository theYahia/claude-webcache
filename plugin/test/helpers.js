// Match production scripts: silence Node 22.5 node:sqlite ExperimentalWarning so
// test output stays readable. cache.js itself does not call removeAllListeners.
process.removeAllListeners('warning');

const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const CACHE_MODULE = require.resolve('../src/cache.js');

// cache.js bakes CACHE_DIR/DB_PATH/TTL_MS at module load from os.homedir() + env.
// To run tests against an isolated SQLite file, we monkey-patch os.homedir before
// freshly requiring cache.js, then restore afterwards.
function freshCache({ ttlDays } = {}) {
  const tmpRoot = path.join(os.tmpdir(), `webcache-test-${crypto.randomUUID()}`);
  fs.mkdirSync(tmpRoot, { recursive: true });

  const origHome = os.homedir;
  const hadTtl = Object.prototype.hasOwnProperty.call(process.env, 'WEBCACHE_TTL_DAYS');
  const origTtl = process.env.WEBCACHE_TTL_DAYS;

  os.homedir = () => tmpRoot;
  if (ttlDays === undefined) {
    delete process.env.WEBCACHE_TTL_DAYS;
  } else {
    process.env.WEBCACHE_TTL_DAYS = String(ttlDays);
  }

  delete require.cache[CACHE_MODULE];
  const cache = require(CACHE_MODULE);

  return {
    cache,
    tmpRoot,
    cleanup() {
      os.homedir = origHome;
      if (hadTtl) process.env.WEBCACHE_TTL_DAYS = origTtl;
      else delete process.env.WEBCACHE_TTL_DAYS;
      delete require.cache[CACHE_MODULE];
      // SQLite handle on Windows may keep the file locked briefly. force:true tries hard;
      // any residual leak ends up in os.tmpdir() which the OS sweeps periodically.
      try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { freshCache, sleep };
