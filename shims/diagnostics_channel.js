// shims/diagnostics_channel.js
module.exports = {
    channel: () => ({ publish: () => {} }),
    hasSubscribers: () => false,
    subscribe: () => {},
    unsubscribe: () => {},
  };