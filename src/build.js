'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const async = require('async');
const convert = require('color-convert');
const beautify = require('js-beautify');
const dominantColor = require('dominant-color');
const collection = require('lodash/collection');

const colors = require('./colors.json');

async.map(colors, (color, callback) => {
	const imagePath = path.join(__dirname, 'colors', color.code + '.jpg');
	dominantColor(imagePath, (err, hex) => {
		if (err) {
			callback(err, null);
		}
		const parts = /^(\D*)(\d*)$/.exec(color.code);
		const isColorlessBlender = color.code === '0';
		const isBlackGreyOrColorlessBlender = ['', 'C', 'N', 'T', 'W'].includes(parts[1]);
		color.family = parts[1];
		color.saturation = isBlackGreyOrColorlessBlender ? '' : parts[2].slice(0, 1);
		color.brightness = isBlackGreyOrColorlessBlender ? parts[2] : parts[2].slice(1);
		color.hex = isColorlessBlender ? 'ffffff' : hex;
		color.rgb = convert.hex.rgb(hex);
		color.cmyk = convert.hex.cmyk(hex);
		callback(null, color);
	});
}, (err, results) => {
	if (err) {
		throw err;
	}
	const orderedResults = collection.orderBy(
		results,
		['family', 'saturation', 'brightness'],
		['asc', 'asc', 'asc']);
	const output = orderedResults.map(result => util.inspect(result));
	/* eslint camelcase: ["error", {properties: "never"}] */
	const content = beautify('module.exports=[' + output.join(', ') + '];', {
		indent_with_tabs: true
	});
	fs.writeFileSync(path.join('lib', 'index.js'), content + '\n');
});
