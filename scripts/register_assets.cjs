const path = require('path');

['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.gif'].forEach(ext => {
  require.extensions[ext] = (module, filename) => {
    module.exports = path.basename(filename);
  };
});
