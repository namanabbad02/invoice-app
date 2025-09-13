// In /backend/services/googleDriveApiService.js
const { google } = require('googleapis');
const stream = require('stream');
require('dotenv').config();

// --- NEW: Configure with OAuth 2.0 ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

// Set the refresh token. The library will handle exchanging it for an access token automatically.
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

// Create a Google Drive API client using the OAuth2 client
const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Uploads a PDF buffer to a specific Google Drive folder and makes it public.
 * @param {Buffer} pdfBuffer The PDF data.
 * @param {string} fileName The desired name for the file in Google Drive.
 * @returns {Promise<object>} An object containing the fileId and webViewLink.
 */
async function uploadAndSharePdf(pdfBuffer, fileName) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(pdfBuffer);

  try {
    // 1. Upload the file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Specify the folder
      },
      media: {
        mimeType: 'application/pdf',
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink;

    if (!fileId) {
      throw new Error("File upload failed, no ID returned.");
    }

    // 2. Make the file publicly readable
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log(`Successfully uploaded and shared file: ${fileName} (ID: ${fileId})`);
    return { fileId, webViewLink };

  } catch (error) {
    console.error("Google Drive API Error:", error.message);
    throw new Error("Failed to upload and share file with Google Drive.");
  }
}

module.exports = { uploadAndSharePdf };