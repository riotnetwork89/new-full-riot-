const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { supabase } = require('./supabase');

async function generateTicketPDF(ticketData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    const qrCodeDataURL = await QRCode.toDataURL(ticketData.qrcode_data);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%);
            color: white;
            width: 600px;
            height: 400px;
          }
          .ticket {
            background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05));
            border: 2px solid #ff0000;
            border-radius: 16px;
            padding: 30px;
            height: 340px;
            position: relative;
            backdrop-filter: blur(10px);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            background: linear-gradient(45deg, #ff0000, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          .event-title {
            font-size: 20px;
            color: #ff0000;
            margin-bottom: 15px;
            text-transform: uppercase;
          }
          .details {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .info {
            flex: 1;
          }
          .info-row {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .label {
            color: #ff0000;
            font-weight: bold;
            text-transform: uppercase;
          }
          .qr-section {
            text-align: center;
            margin-left: 20px;
          }
          .qr-code {
            width: 120px;
            height: 120px;
            border: 2px solid #ff0000;
            border-radius: 8px;
            padding: 10px;
            background: white;
          }
          .ticket-code {
            font-size: 12px;
            margin-top: 10px;
            color: #ccc;
            word-break: break-all;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 30px;
            right: 30px;
            text-align: center;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #333;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="title">RIOT NETWORK</div>
            <div class="event-title">${ticketData.eventTitle}</div>
          </div>
          
          <div class="details">
            <div class="info">
              <div class="info-row">
                <span class="label">Venue:</span> ${ticketData.venue}
              </div>
              <div class="info-row">
                <span class="label">Date:</span> ${new Date(ticketData.startDateTime).toLocaleDateString()}
              </div>
              <div class="info-row">
                <span class="label">Time:</span> ${new Date(ticketData.startDateTime).toLocaleTimeString()}
              </div>
              <div class="info-row">
                <span class="label">Tier:</span> ${ticketData.tierName}
              </div>
              <div class="info-row">
                <span class="label">Price:</span> $${(ticketData.price / 100).toFixed(2)}
              </div>
              <div class="info-row">
                <span class="label">Order:</span> ${ticketData.orderUuid}
              </div>
            </div>
            
            <div class="qr-section">
              <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
              <div class="ticket-code">${ticketData.ticketCode}</div>
            </div>
          </div>
          
          <div class="footer">
            This ticket is valid for one-time entry only. Present QR code at venue entrance.
          </div>
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    await page.setViewport({ width: 600, height: 400 });
    
    const pdfBuffer = await page.pdf({
      width: '600px',
      height: '400px',
      printBackground: true
    });
    
    const fileName = `tickets/${ticketData.ticketUuid}.pdf`;
    const { data, error } = await supabase.storage
      .from('tickets')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('tickets')
      .getPublicUrl(fileName);
    
    return publicUrl;
    
  } finally {
    await browser.close();
  }
}

module.exports = { generateTicketPDF };
