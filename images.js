const fs = require('fs-extra');
const path = require('path');

// Copy images from src to dev and dist
const copyImages = async () => {
  try {
    // Ensure target directories exist
    await fs.remove('dev/images');
    await fs.remove('dist/images');
    await fs.ensureDir('dev/images');
    await fs.ensureDir('dist/images');

    // Copy images from src to dev and dist
    await fs.copy('src/images', 'dev/images');
    await fs.copy('src/images', 'dist/images');

    console.log('Images copied successfully');
  } catch (err) {
    console.error('Error copying images:', err);
  }
};

copyImages();
