const twilio = require('twilio');
// Import and configure dotenv to read variables from the .env file.
require('dotenv').config();

// Initialize the Twilio client with your Account SID and Auth Token.
// These are securely read from the environment variables.
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends an invoice message with a PDF link via the Twilio WhatsApp API.
 *
 * @param {string} customerPhone The customer's phone number in E.164 format (e.g., "+919876543210").
 * @param {string} invoiceNumber The invoice number to include in the message body.
 * @param {string} pdfUrl The publicly accessible URL of the PDF file to be sent.
 * @returns {Promise<void>} A promise that resolves when the message is successfully sent.
 * @throws {Error} Throws an error if the Twilio API call fails.
 */
async function sendInvoiceWhatsApp(customerPhone, invoiceNumber, pdfUrl) {
  // Use a try...catch block to handle potential errors from the external API call.
  try {
    // Format the phone numbers correctly for the Twilio WhatsApp API.
    // The "from" number is your Twilio Sandbox or registered number from the .env file.
    // The "to" number is the customer's phone number.
    const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const toWhatsAppNumber = `whatsapp:${customerPhone}`;

    console.log(`Attempting to send WhatsApp message to ${toWhatsAppNumber} from ${fromWhatsAppNumber}`);

    // Create the message payload for the Twilio API.
    const messagePayload = {
      from: fromWhatsAppNumber,
      to: toWhatsAppNumber,
      body: `Hello! Here is your invoice #${invoiceNumber}. Thank you for your business!`,
      // Twilio expects the mediaUrl to be an array of strings.
      mediaUrl: [pdfUrl],
    };

    // Make the asynchronous API call to Twilio to send the message.
    await client.messages.create(messagePayload);

    // Log a success message to the server console for debugging and records.
    console.log(`WhatsApp message sent successfully to ${customerPhone}`);

  } catch (error) {
    // If an error occurs, log the detailed error message from Twilio.
    // This is crucial for debugging issues like invalid phone numbers or billing problems.
    console.error(`Failed to send WhatsApp message to ${customerPhone}:`, error);

    // Re-throw the error so that the calling function in server.js knows the operation failed
    // and can send a 500 Internal Server Error response to the frontend.
    throw new Error("Twilio WhatsApp sending failed.");
  }
}

// Export the function to make it available for use in other files (like server.js).
module.exports = { sendInvoiceWhatsApp };

// // In /backend/services/whatsappService.js
// const twilio = require('twilio');
// require('dotenv').config();

// // The client is initialized using your Account SID and Auth Token.
// // This is how your app authenticates with Twilio.
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// async function sendInvoiceWhatsApp(customerPhone, invoiceNumber, pdfUrl) {
//   try {
//     // We add "whatsapp:" as a prefix to the customer's phone number.
//     const toWhatsAppNumber = `whatsapp:${customerPhone}`;
//     // This comes from your .env file (the sandbox number).
//     const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

//     await client.messages.create({
//       from: fromWhatsAppNumber,
//       to: toWhatsAppNumber,
//       body: `Hello! Here is your invoice #${invoiceNumber}. Thank you for your business!`,
//       // The direct download link from Google Drive goes here.
//       mediaUrl: [pdfUrl], 
//     });
//     console.log(`WhatsApp message sent successfully to ${customerPhone}`);
//   } catch (error) {
//     console.error(`Failed to send WhatsApp message to ${customerPhone}:`, error);
//     throw new Error("Twilio WhatsApp sending failed.");
//   }
// }
// module.exports = { sendInvoiceWhatsApp };
