// In /backend/utils/linkConverter.js
function convertGoogleDriveLink(shareLink) {
  const regex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = shareLink.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  // Return null if the link is not a valid Google Drive file link
  return null;
}

module.exports = { convertGoogleDriveLink };