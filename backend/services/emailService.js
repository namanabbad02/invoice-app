const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email with the invoice PDF attached.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} invoiceNumber - The invoice number for the subject.
 * @param {Buffer} pdfBuffer - The PDF data as a buffer.
 */
async function sendInvoiceEmail(toEmail, invoiceNumber, pdfBuffer) {
  // const mailOptions = {
  //   from: `"Embellish Jewels By Nakul" <${process.env.EMAIL_USER}>`,
  //   to: toEmail,
  //   subject: `Invoice #${invoiceNumber} from Emebllish Jewels By Nakul`,
  //   text: 'Please find your attached invoice. Thank you for shopping with us!\nFor support or returns, contact us at embellish@gmail.com or WhatsApp +91-8618486616\n\nBest regards,\nTeam Embellish',
  //   attachments: [
  //     {
  //       filename: `invoice-${invoiceNumber}.pdf`,
  //       content: pdfBuffer,
  //       contentType: 'application/pdf',
  //     },
  //   ],
  // };
  const mailOptions = {
  from: `"Embellish Jewels By Nakul" <${process.env.EMAIL_USER}>`,
  to: toEmail,
  subject: `Invoice #${invoiceNumber} from Embellish Jewels By Nakul`,
  text: `Dear Customer,

Thank you for shopping with Embellish! Please find your invoice attached for your recent purchase.

If you have any questions, need support, or wish to initiate a return, feel free to reach out:
Email: embellish@gmail.com
WhatsApp: +91-8618486616

We appreciate your trust in us and look forward to serving you again.

Best regards,
Team Embellish`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <p>Dear Customer,</p>
      
      <p>Thank you for shopping with <strong>Embellish</strong>! Please find your invoice attached for your recent purchase.</p>

      <p>If you have any questions, need support, or wish to initiate a return, feel free to reach out:</p>
      <ul>
        <li>Email: <a href="mailto:embellish@gmail.com">embellish@gmail.com</a></li>
        <li>WhatsApp: <a href="https://wa.me/918618486616" target="_blank">+91-8618486616</a></li>
      </ul>

      <p>We appreciate your trust in us and look forward to serving you again.</p>

      <p style="margin-top:20px;">Best regards,<br><strong>Team Embellish</strong></p>
    </div>
  `,
  attachments: [
    {
      filename: `invoice-${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ],
};


  try {
    await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully to:', toEmail);
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw new Error('Failed to send invoice email.');
  }
}

module.exports = { sendInvoiceEmail };