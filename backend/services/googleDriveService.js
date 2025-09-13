// In /backend/services/googleDriveService.js

/**
 * Converts a standard Google Drive sharing link into a direct download link.
 * Handles both manual share links (e.g., .../d/FILE_ID/view) and API webViewLinks.
 * @param {string} shareLink The link from Google Drive.
 * @returns {string|null} The direct download link or null if the link is invalid.
 */
function convertToDirectLink(shareLink) {
  // --- THE DEFINITIVE FIX ---
  // This new regex specifically looks for a sequence of 25 or more letters, numbers, hyphens, or underscores
  // that comes after "/d/". This is the unique pattern of a Google Drive file ID.
  // It is much more reliable than trying to guess what character comes after the ID.
  const match = shareLink.match(/\/d\/([a-zA-Z0-9_-]{25,})/);

  if (match && match[1]) {
    const fileId = match[1];
    console.log(`Successfully extracted File ID: ${fileId}`); // Added for debugging
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  console.error(`Failed to extract File ID from link: ${shareLink}`); // Added for debugging
  // Return null if no valid file ID pattern is found.
  return null;
}

// The module.exports remains the same
module.exports = { convertToDirectLink };