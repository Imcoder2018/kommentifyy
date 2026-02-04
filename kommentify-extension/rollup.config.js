import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { chromeExtension } from 'rollup-plugin-chrome-extension';
import copy from 'rollup-plugin-copy';

const isProduction = !process.env.ROLLUP_WATCH;

export default {
  // Point to your manifest.json! 
  // The plugin will parse this to find all your other files.
  input: 'src/manifest.json', 
  
  output: {
    dir: 'dist',
    format: 'esm', // Chrome MV3 supports modules
  },
  
  plugins: [
    // 1. Parse the extension manifest
    chromeExtension(),

    // 2. Copy additional HTML/JS files not in manifest
    copy({
      targets: [
        { src: 'src/login.html', dest: 'dist' },
        { src: 'src/login.js', dest: 'dist' },
        { src: 'src/register.html', dest: 'dist' },
        { src: 'src/register.js', dest: 'dist' },
        { src: 'src/shared/config.js', dest: 'dist/shared' },
        { src: 'src/shared/services/*', dest: 'dist/shared/services' },
        { src: 'src/assets/icons/icon-inactive.png', dest: 'dist/assets/icons' },
        { src: 'src/components/html/*', dest: 'dist/components/html' },
        { src: 'src/assets/css/*', dest: 'dist/assets/css' },
        { src: 'src/assets/images/*', dest: 'dist/assets/images' },
        { src: 'src/assets/spinner.gif', dest: 'dist/assets' }
      ]
    }),
    
    // 2b. Copy library files AFTER build to overwrite any processed versions
    copy({
      targets: [
        { src: 'src/assets/lib/*', dest: 'dist/assets/lib' }
      ],
      hook: 'writeBundle', // Copy after Rollup finishes processing
      copyOnce: false
    }),

    // 3. Resolve external modules (npm packages)
    resolve(),
    commonjs(),

    // 4. Auto-reload the extension during development (DISABLED - causes import errors)
    // !isProduction && simpleReloader(),

    // 5. Minify/Obfuscate ONLY in production
    isProduction && terser({
        maxWorkers: 4, // Speed up build
        mangle: true, // Scramble variable names
        compress: {
            drop_console: true, // Remove console.log
            drop_debugger: true, // Remove debugger statements
        },
        format: {
            comments: false, // Remove comments
        }
    }),
  ],
};
