const path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'cinematosis.js'
	},
	mode: 'production',
	module: {
		rules: [
			{ test: /\.txt$/, use: 'raw-loader' },
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
	devtool: 'eval-cheap-source-map',
};