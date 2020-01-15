'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const convert = require('color-convert');
const beautify = require('js-beautify');
const getDominantColor = require('colorthief').getColor;
const collection = require('lodash/collection');
const colors = require('./colors.json');

const promises = colors.map(async color => {
	const imagePath = path.join(__dirname, 'colors', `${color.code}.jpg`);
	try {
		const isColorlessBlender = color.code === '0';
		const dominantColorRGB = isColorlessBlender ? [255, 255, 255] : await getDominantColor(imagePath);
		const parts = /^(\D*)(\d*)$/.exec(color.code);
		const isBlackGreyOrColorlessBlender = ['', 'C', 'N', 'T', 'W'].includes(parts[1]);
		color.family = parts[1];
		color.saturation = isBlackGreyOrColorlessBlender ? '' : parts[2].slice(0, 1);
		color.brightness = isBlackGreyOrColorlessBlender ? parts[2] : parts[2].slice(1);
		color.rgb = dominantColorRGB;
		color.hex = convert.rgb.hex(dominantColorRGB);
		color.cmyk = convert.rgb.cmyk(dominantColorRGB);
		return new Promise(resolve => resolve(color));
	} catch (error) {
		return new Promise((resolve, reject) => reject(new Error(`Error "${error.message}" in color ${color.code}`)));
	}
});

Promise.all(promises)
	.then(results => {
		const orderedResults = collection.orderBy(
			results,
			['family', 'saturation', 'brightness'],
			['asc', 'asc', 'asc']);
		const output = orderedResults.map(result => util.inspect(result));
		/* eslint camelcase: ["error", {properties: "never"}] */
		const content = beautify(`module.exports=[${output.join(', ')}];`, {indent_with_tabs: true});
		fs.writeFileSync(path.join('lib', 'index.js'), `${content}\n`);
	})
	.catch(error => {
		throw error;
	});
