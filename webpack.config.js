const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'cinematosis.js'
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ 
					from: "node_modules/pathseg/pathseg.js",
				},
			],
		}),
	],
	performance: {
		maxEntrypointSize: 1024000,
		maxAssetSize: 1024000,
	},
	mode: 'production',
	module: {
		rules: [
			{ test: /\.txt$/, use: 'raw-loader' },
			{
				test: /\.js$/,
				enforce: "pre",
				use: ["source-map-loader"],
			},
			{
				test: /\.js$/,
				exclude:  /(node_modules)/,
				use: {
					loader: "babel-loader",
					options: {
						plugins: [
							"@babel/plugin-proposal-class-properties"
						]
					}
				}
			}
		],
	},
	devtool: 'source-map',
	devServer: {
		stats: {
			hash: false,
			version: false,
			timings: false,
			assets: true,
			chunks: true,
			modules: true,
		},
		publicPath: '/build/',
		compress: true,
		port: 7007,
		hot: true,
	}
};