// Force Google/Cloudflare DNS so Firebase Hosting API resolves on flaky networks.
const dns = require("dns");
const { Resolver } = require("dns");

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

function resolveHost(hostname, family, cb) {
  const on4 = (err, addresses) => {
    if (!err && addresses && addresses.length) return cb(null, addresses[0], 4);
    resolver.resolve6(hostname, (err6, addresses6) => {
      if (err6 || !addresses6 || !addresses6.length) return cb(err || err6);
      cb(null, addresses6[0], 6);
    });
  };
  if (family === 6) {
    resolver.resolve6(hostname, (err, addresses) => {
      if (err || !addresses || !addresses.length) return on4(err, null);
      cb(null, addresses[0], 6);
    });
  } else {
    resolver.resolve4(hostname, on4);
  }
}

dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const opts = options || {};
  const family = opts.family || 0;
  resolveHost(hostname, family, (err, address, fam) => {
    if (err) return callback(err);
    if (opts.all) {
      return callback(null, [{ address, family: fam }]);
    }
    callback(null, address, fam);
  });
};

dns.promises.lookup = (hostname, options = {}) =>
  new Promise((resolve, reject) => {
    dns.lookup(hostname, options, (err, address, family) => {
      if (err) reject(err);
      else if (options.all) resolve(address);
      else resolve({ address, family });
    });
  });
