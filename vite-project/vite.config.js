import { defineConfig } from 'vite';
import path from 'path';
import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html';
import viteImagemin from 'vite-plugin-imagemin';
import imagePresets from 'vite-plugin-image-presets';

export default defineConfig({
	root: 'src',
	server: {
		port: 3000,
	},

	plugins: [
		viteConvertPugInHtml(),
		imagePresets({
			default: {
				formats: {
					webp: { quality: 80 },
					original: {},
				},
				sizes: [1, 2],
			},
		}),

		viteImagemin({
			gifsicle: { optimizationLevel: 7 },
			optipng: { optimizationLevel: 7 },
			mozjpeg: { quality: 80 },
			pngquant: { quality: [0.7, 0.9] },
			svgo: {
				plugins: [
					{ name: 'removeViewBox' },
					{ name: 'removeEmptyAttrs', active: false },
				],
			},
			webp: { quality: 80 },
		}),
	],

	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
          @import "@/scss/_variables.scss";
		  @import "@/scss/_functions.scss";
          @import "@/scss/_mixins.scss";
        `,
			},
		},
	},

	build: {
		outDir: './dist',
		assetsDir: 'assets',
	},
});