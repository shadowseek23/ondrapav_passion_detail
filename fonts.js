const fs = require('fs-extra');
const path = require('path');

// Copy fonts from src to dev and dist
const copyFonts = async () => {
  try {
    // Ensure target directories exist
    await fs.remove('dev/webfonts');
    await fs.remove('dist/webfonts');
    await fs.ensureDir('dev/webfonts');
    await fs.ensureDir('dist/webfonts');

    // Copy fonts from src to dev and dist
    await fs.copy('src/webfonts', 'dev/webfonts');
    await fs.copy('src/webfonts', 'dist/webfonts');

    console.log('fonts copied successfully');
  } catch (err) {
    console.error('Error copying fonts:', err);
  }
};

copyFonts();
