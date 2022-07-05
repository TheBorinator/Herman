const { totp } = require('node-otp');
require('dotenv').config({ path: './../.env' });

function OTP() {
	const OTP = totp({
		secret: process.env.OTP_SECRET,
	});
	return OTP;
}

module.exports = OTP;