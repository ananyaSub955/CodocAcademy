// const express = require('express');
// const bodyParser = require('body-parser');
// const speakeasy = require('speakeasy');
// const QRCode = require('qrcode');

// const app = express();
// app.use(bodyParser.json());

// app.get('/generate', (req, res) => {
//   const secret = speakeasy.generateSecret({ length: 20 });
//   QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
//     if (err) return res.status(500).send('Error generating QR code');

//     res.json({
//       secret: secret.base32,
//       qr: dataUrl
//     });
//   });
// });

// app.post('/verify', (req, res) => {
//   const { token, secret } = req.body;
//   const verified = speakeasy.totp.verify({
//     secret,
//     encoding: 'base32',
//     token,
//     window: 1
//   });

//   res.json({ verified });
// });

// app.listen(3000, () => {
//   console.log('2FA server up on http://localhost:3000');
// });
