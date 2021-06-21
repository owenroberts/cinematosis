/*
	load svg terrain
*/

import { World, Composite, Common, Svg, Query, Bodies } from 'matter-js';
Common.setDecomp(require('poly-decomp'));

export default function Terrain(w, h, callback) {


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

                var vertexSets = paths.map(function(path) { return Svg.pathToVertices(path, 30); });

                let body = Bodies.fromVertices(960, 600, vertexSets, {
                    isStatic: true,
                    render: {
                        fillStyle: '#060a19',
                        strokeStyle: '#060a19',
                        lineWidth: 1
                    }
                }, true);
                console.log(body);
                callback(body);

            });
	} else {
		Common.warn('Fetch is not available. Could not load SVG.');
	}


}