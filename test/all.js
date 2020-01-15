import test from 'ava';
import colors from '..';

test('colors', t => {
	t.is(colors.length, 358);
	colors.forEach(item => {
		t.regex(item.code, /^\w*\d+$/);
		t.regex(item.name, /^\S.+\S$/);
		t.regex(item.family, /^\D*$/);
		t.regex(item.saturation, /^\d*$/);
		t.regex(item.brightness, /^\d{0,3}$/);
		t.regex(item.cmyk.toString(), /\d{1,3},\d{1,3},\d{1,3},\d{1,3}/);
		t.regex(item.rgb.toString(), /\d{1,3},\d{1,3},\d{1,3}/);
		t.regex(item.hex, /[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}/);
	});
});
