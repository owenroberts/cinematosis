/*
	load svg terrain
*/

import { World, Composite, Common, Svg, Query, Bodies } from 'matter-js';
Common.setDecomp(require('poly-decomp'));

export default function Terrain(callback) {

	if (typeof fetch !== 'undefined') {
		var select = function(root, selector) {
			return Array.prototype.slice.call(root.querySelectorAll(selector));
		};

		var loadSvg = function(url) {
			return fetch(url)
				.then(function(response) { return response.text(); })
				.then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
		};

		loadSvg('./static/svgs/terrain.svg')
			.then(function(root) {
				var paths = select(root, 'path');
				let vertexSets = paths.map(function(path) { return Svg.pathToVertices(path, 30); });
				callback(vertexSets);
			});
	} else {
		Common.warn('Fetch is not available. Could not load SVG.');
	}

}