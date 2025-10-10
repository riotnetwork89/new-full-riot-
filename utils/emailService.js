const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendTicketEmail(orderData) {
  const { userEmail, orderUuid, tickets, eventTitle, totalAmount } = orderData;
  
  const attachments = tickets.map(ticket => ({
    filename: `ticket-${ticket.ticketCode}.pdf`,
    path: ticket.pdfUrl,
    contentType: 'application/pdf'
  }));
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Your Riot Network Tickets - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff0000; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
            RIOT NETWORK
          </h1>
          <p style="color: #ccc; margin: 10px 0;">Your tickets are ready!</p>
        </div>
        
        <div style="background: rgba(255, 0, 0, 0.1); border: 1px solid #ff0000; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #ff0000; margin-top: 0;">${eventTitle}</h2>
          <p><strong>Order ID:</strong> ${orderUuid}</p>
          <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
          <p><strong>Number of Tickets:</strong> ${tickets.length}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #ff0000;">Your Tickets:</h3>
          ${tickets.map(ticket => `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; margin: 10px 0; border-radius: 6px;">
              <p><strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
              <p><strong>Tier:</strong> ${ticket.tierName}</p>
              <p style="font-size: 12px; color: #ccc;">Present the QR code on your PDF ticket at the venue entrance.</p>
            </div>
          `).join('')}
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #ff0000; margin-top: 0;">Important Information:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Your PDF tickets are attached to this email</li>
            <li>Each ticket is valid for one-time entry only</li>
            <li>Present the QR code at the venue entrance</li>
            <li>Tickets are non-transferable and non-refundable</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #888; font-size: 12px;">
            Thank you for choosing Riot Network!<br>
            For support, contact us at support@riotnetwork.com
          </p>
        </div>
      </div>
    `,
    attachments
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendOrderConfirmation(orderData) {
  const { userEmail, orderUuid, eventTitle, totalAmount } = orderData;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Order Confirmation - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff0000; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
            RIOT NETWORK
          </h1>
          <p style="color: #ccc; margin: 10px 0;">Order Confirmation</p>
        </div>
        
        <div style="background: rgba(255, 0, 0, 0.1); border: 1px solid #ff0000; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #ff0000; margin-top: 0;">Thank you for your purchase!</h2>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Order ID:</strong> ${orderUuid}</p>
          <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 6px;">
          <p>Your tickets are being processed and will be emailed to you shortly.</p>
          <p>Please keep this confirmation for your records.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #888; font-size: 12px;">
            Riot Network - Premium Live Events
          </p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Confirmation email failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendTicketEmail, sendOrderConfirmation };
