process.title = 'homebridge-dashboard';

setInterval(() => {
  if (!process.connected) {
    process.exit(1);
  }
}, 10000);

process.on('disconnect', () => {
  process.exit();
});

import('../server/startup');
