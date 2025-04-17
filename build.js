const config = require('./config.json');
//esbuild
const esbuild = require('esbuild');
//live-server
const liveServer = require('live-server');
// Configure live-server options
const serverConfig = {
  port: 8080,
  host: "0.0.0.0",
  open: true,
  file: "index.html",
  wait: 100, // Reduced wait time for faster reloads
  logLevel: 2
};

//postcss
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssMixins = require('postcss-mixins');
const postcssSimpleVars = require('postcss-simple-vars');

//handlebars
const Handlebars = require('handlebars');
const chokidar = require('chokidar');

//node
const fs = require('fs/promises');
const { glob } = require("glob");
const path = require('path');

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');
const isServe = process.argv.includes('--serve');

let outDir;
if (isProduction) {
  outDir = 'dist';
  console.log('Production mode. outDir:', outDir);
} else if (isWatch || isServe) {
  outDir = 'dev';
  console.log('Production mode. outDir:', outDir);
} else {
  console.error('Error: No build mode specified');
  process.exit(1);
}
serverConfig.root = outDir;

/*
 * HTML AND HANDLEBARS
 */

let templateData;
if (isProduction) {
  templateData = config.templateData.prod;
} else {
  templateData = config.templateData.dev;
}


async function registerPartial(file) {
  if (path.extname(file) === '.hbs') {
    console.log('📂 Loading partial:', file);
    const partialName = path.basename(file, '.hbs');
    console.log('📂 Partial name:', partialName);
    const partialContent = await fs.readFile(file, 'utf8');
    Handlebars.registerPartial(partialName, partialContent);
    console.log('📂 Partial registered:', partialName);
  }
}
async function registerPartialsFromDir(partialsDir) {
  console.log('📂 Loading partials from:', partialsDir);
  const partialFiles = await fs.readdir(partialsDir);
  for (const file of partialFiles) {
    await registerPartial(path.join(partialsDir, file));
  }
  return true;
}
// Function to register partials
async function registerPartials() {
  await registerPartialsFromDir(path.join(__dirname, 'src/templates/layout'));
  await registerPartialsFromDir(path.join(__dirname, 'src/templates/pages'));
  await registerPartialsFromDir(path.join(__dirname, 'src/templates/modules'));
  await registerPartialsFromDir(path.join(__dirname, 'src/templates/other_partials'));
  console.log('📑 Registered Handlebars partials');
  return true;
}
async function processHbsFile(srcFile, destDir) {
  try {
    const filename = path.basename(srcFile, '.hbs');     console.log('📂 Processing:', filename);
    const templatePath = path.join(__dirname, srcFile);
    const template = await fs.readFile(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(template);
    console.log(templateData);
    let html = compiledTemplate(templateData);     console.log('Compiled template...');
    const destFile = path.join(__dirname, destDir, `${filename}.html`);

    await fs.mkdir(path.dirname(destFile), { recursive: true });
    await fs.writeFile(destFile, html);    console.log(`📄 Generated final file: ${destFile}`);
  } catch (err) {
    console.error(`Error processing ${srcFile}:`, err);
    throw err;
  }
}
// Function to compile and write HTML
async function generateHtml() {
  await registerPartials();
  if(isProduction) {
    await processHbsFile('src/templates/production.hbs', outDir);
  } else {
    await processHbsFile('src/templates/index.hbs', outDir);
  }
}

/*
 * CSS, POSTCSS
 */
// PostCSS processor setup

const postcssProcessor = postcss([
  postcssImport(),
  postcssSimpleVars(),
  postcssMixins(),
  postcssNested(),
  autoprefixer()
]);

/*
 * ESBUILD
 * zpracovava JS a CSS do jednoho souboru (index.js, index.css)
 */

/** @type {import('esbuild').BuildOptions} 
 * 
 * entrPoints apply only to npm run serve (overridden for build)
*/
const buildOptions = {
  entryPoints: [
    'src/index.js',
    'src/scripts/**/*.js',
    'src/styles/**/*.css'
  ],
  bundle: true,
  format: 'cjs',
  outdir: outDir,
  minify: false,//const isProduction
  sourcemap: !isProduction,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  logLevel: 'info',

  loader: {
    '.js': 'js',
    '.css': 'css'
  },
  plugins: [{
    name: 'postcss',
    setup(build) {
      // Handle CSS files
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const fs = require('fs/promises');
        const css = await fs.readFile(args.path, 'utf8');

        try {
          // Process with PostCSS
          const result = await postcssProcessor.process(css, {
            from: args.path,
            map: {
              inline: false,
              annotation: true
            }
          });

          return {
            contents: result.css,
            loader: 'css'
          };
        } catch (error) {
          return {
            errors: [{
              text: error.message,
              location: error.location && {
                line: error.line,
                column: error.column
              }
            }]
          };
        }
      });
      build.onEnd(() => {
        console.log('Build finished');
      });
    }
  }]
};
/*
 * utils
 */

async function purgeDir(dir) {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      await fs.mkdir(dir); // Recreate the empty directory
      resolve(true);
    } catch (err) {
      console.error('Error clearing directory:', err);
      resolve(false);
    }
  });
}


/*
 * SERVE
 */
async function serve() {
  // Generate HTML before starting server
  await generateHtml();
  {//watch hbs files
    watcherHbs = chokidar.watch(await glob('src/templates/**/*.hbs'), {
      persistent: true,
      ignoreInitial: true
    });
    watcherHbs
      .on('all', async (event, path) => {
        console.log(`File ${path} has been ${event}`);
        await generateHtml(); // Only regenerate HTML when templates change
      })
      .on('error', error => {
        console.error('Watcher error:', error);
      });
  }

  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  liveServer.start(serverConfig);
}

async function build() {
  // Single build
  await purgeDir(outDir);
  delete buildOptions.outdir;
  for(let entryFile of config.productionEntryPoints) {
    buildOptions.entryPoints = ['./src/'+entryFile];
    buildOptions.outfile = "./dist/"+entryFile;
    await esbuild.build(buildOptions);
  } 
  await generateHtml();
  /*
   * npm run images
   */
  const { exec } = require('child_process');
  exec('npm run images', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
}

/*
* final execution 
*/
{
  if (isServe || isWatch) {
    serve().catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
  } else if (isProduction) {
    build().catch((err) => {
      console.error('Error:', err);
      process.exit(1);

    });
  }
}