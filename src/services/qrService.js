const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

async function generateEmergencyQR(userId, qrToken, emergencyData) {
  const emergencyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/emergency/${qrToken}`;
  
  const qrDir = path.join(UPLOAD_PATH, 'images');
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const filename = `qr_${userId}_${Date.now()}.png`;
  const filePath = path.join(qrDir, filename);

  await QRCode.toFile(filePath, emergencyUrl, {
    color: { dark: '#1e40af', light: '#ffffff' },
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H',
  });

  // Also generate base64 for inline use
  const base64 = await QRCode.toDataURL(emergencyUrl, {
    color: { dark: '#1e40af', light: '#ffffff' },
    width: 400,
    errorCorrectionLevel: 'H',
  });

  return { filename, filePath: `/uploads/images/${filename}`, base64, emergencyUrl };
}

module.exports = { generateEmergencyQR };
