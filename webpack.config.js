const path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'cinematosis.js'
	},
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
			assets: false,
			chunks: false,
			modules: false,
		},
		publicPath: '/build/',
		compress: true,
		port: 7007,
		hot: true,
	},
};