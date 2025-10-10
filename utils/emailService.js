const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_SERVICE_API_KEY
  }
});

export const sendTicketEmail = async ({ userEmail, order, tickets }) => {
  try {
    const attachments = tickets.map(ticket => ({
      filename: `ticket-${ticket.ticket_code}.pdf`,
      path: ticket.pdf_url,
      contentType: 'application/pdf'
    }));

    const eventInfo = order.order_items?.[0]?.ticket_tier?.event || {};

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: userEmail,
      subject: `Your Riot Network Tickets - Order ${order.order_uuid}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%); color: white; padding: 2rem; text-align: center;">
            <h1 style="color: #ff0000; margin: 0;">RIOT NETWORK</h1>
            <h2 style="margin: 0.5rem 0;">Your Tickets Are Ready!</h2>
          </div>
          
          <div style="padding: 2rem; background: #f9f9f9;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.order_uuid}</p>
            <p><strong>Total:</strong> $${(order.total_cents / 100).toFixed(2)}</p>
            
            <h3>Event Information</h3>
            ${order.order_items.map(item => `
              <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px;">
                <h4>${item.ticket_tier?.event?.title || 'Event'}</h4>
                <p><strong>Venue:</strong> ${item.ticket_tier?.event?.venue || 'TBA'}</p>
                <p><strong>Date:</strong> ${item.ticket_tier?.event?.start_datetime ? new Date(item.ticket_tier.event.start_datetime).toLocaleDateString() : 'TBA'}</p>
                <p><strong>Tickets:</strong> ${item.qty} × ${item.ticket_tier?.name || 'General Admission'}</p>
              </div>
            `).join('')}
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
              <h4 style="color: #856404; margin: 0 0 0.5rem 0;">Important:</h4>
              <p style="color: #856404; margin: 0;">Please bring your tickets (PDF attachments) to the event. Each ticket contains a unique QR code for entry.</p>
            </div>
          </div>
          
          <div style="background: #000; color: white; padding: 1rem; text-align: center;">
            <p style="margin: 0;">Questions? Contact us at support@riotnetwork.com</p>
          </div>
        </div>
      `,
      attachments
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

export const sendOrderConfirmation = async ({ userEmail, order }) => {
  try {
    const eventInfo = order.order_items?.[0]?.ticket_tier?.event || {};

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: userEmail,
      subject: `Order Confirmation - Riot Network Tickets`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%); color: white; padding: 2rem; text-align: center;">
            <h1 style="color: #ff0000; margin: 0;">RIOT NETWORK</h1>
            <h2 style="margin: 0.5rem 0;">Order Confirmed!</h2>
          </div>
          
          <div style="padding: 2rem; background: #f9f9f9;">
            <h3>Thank you for your purchase!</h3>
            <p>Your order has been confirmed and your tickets will be delivered shortly.</p>
            
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.order_uuid}</p>
            <p><strong>Total:</strong> $${(order.total_cents / 100).toFixed(2)}</p>
            <p><strong>Status:</strong> Confirmed</p>
            
            <h3>Event Information</h3>
            <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px;">
              <h4>${eventInfo.title || 'Event'}</h4>
              <p><strong>Venue:</strong> ${eventInfo.venue || 'TBA'}</p>
              <p><strong>Date:</strong> ${eventInfo.start_datetime ? new Date(eventInfo.start_datetime).toLocaleDateString() : 'TBA'}</p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
              <h4 style="color: #0c5460; margin: 0 0 0.5rem 0;">Next Steps:</h4>
              <p style="color: #0c5460; margin: 0;">Your tickets are being generated and will be emailed to you within the next few minutes. Please check your email for the PDF tickets with QR codes.</p>
            </div>
          </div>
          
          <div style="background: #000; color: white; padding: 1rem; text-align: center;">
            <p style="margin: 0;">Questions? Contact us at support@riotnetwork.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};
