// Match production scripts: silence Node 22.5 node:sqlite ExperimentalWarning so
// test output stays readable. cache.js itself does not call removeAllListeners.
process.removeAllListeners('warning');

const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const CACHE_MODULE = require.resolve('../src/cache.js');

const ENV_KEYS = ['WEBCACHE_TTL_DAYS', 'WEBCACHE_MAX_SIZE_MB', 'WEBCACHE_DOMAIN_TTL'];

function snapshotEnv() {
  const snap = {};
  for (const k of ENV_KEYS) {
    snap[k] = Object.prototype.hasOwnProperty.call(process.env, k)
      ? { had: true, val: process.env[k] }
      : { had: false };
  }
  return snap;
}

function restoreEnv(snap) {
  for (const k of ENV_KEYS) {
    if (snap[k].had) process.env[k] = snap[k].val;
    else delete process.env[k];
  }
}

function applyEnv({ ttlDays, maxSizeMb, domainTtl }) {
  if (ttlDays === undefined) delete process.env.WEBCACHE_TTL_DAYS;
  else process.env.WEBCACHE_TTL_DAYS = String(ttlDays);

  if (maxSizeMb === undefined) delete process.env.WEBCACHE_MAX_SIZE_MB;
  else process.env.WEBCACHE_MAX_SIZE_MB = String(maxSizeMb);

  if (domainTtl === undefined) delete process.env.WEBCACHE_DOMAIN_TTL;
  else process.env.WEBCACHE_DOMAIN_TTL = typeof domainTtl === 'string' ? domainTtl : JSON.stringify(domainTtl);
}

// cache.js bakes CACHE_DIR/DB_PATH/TTL_MS at module load from os.homedir() + env.
// To run tests against an isolated SQLite file, we monkey-patch os.homedir before
// freshly requiring cache.js, then restore afterwards.
function freshCache(opts = {}) {
  const tmpRoot = path.join(os.tmpdir(), `webcache-test-${crypto.randomUUID()}`);
  fs.mkdirSync(tmpRoot, { recursive: true });

  const origHome = os.homedir;
  const envSnap = snapshotEnv();

  os.homedir = () => tmpRoot;
  applyEnv(opts);

  delete require.cache[CACHE_MODULE];
  const cache = require(CACHE_MODULE);

  return {
    cache,
    tmpRoot,
    cleanup() {
      os.homedir = origHome;
      restoreEnv(envSnap);
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
