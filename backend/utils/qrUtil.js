// backend/utils/qrUtil.js
const QRCode = require('qrcode');

/**
 * Generate a base64 QR code from a given URL
 * @param {string} url - The URL to encode in the QR code
 * @returns {Promise<string>} - Base64 image data
 */
async function generateQrBase64(url) {
  try {
    return await QRCode.toDataURL(url); // returns base64 PNG
  } catch (err) {
    console.error('QR generation failed:', err);
    return '';
  }
}

module.exports = { generateQrBase64 };
