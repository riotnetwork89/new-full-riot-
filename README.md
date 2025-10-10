# Riot Network PPV Platform with Ticketmaster Module

A comprehensive pay-per-view streaming platform with integrated ticketing system, built with Next.js, Supabase, and PayPal integration.

## Features

### Core PPV Platform
- **Live Streaming**: Mux-powered video streaming with admin controls
- **Interactive Chat**: Real-time messaging with rate limiting and moderation
- **VOD Library**: "The Riot Vault" for recorded content access
- **User Authentication**: Supabase-powered login/registration
- **Admin Dashboard**: Comprehensive management interface

### Ticketmaster Module
- **Event Management**: Create and manage live events with multiple ticket tiers
- **PayPal Integration**: Secure payment processing with sandbox/live modes
- **PDF Ticket Generation**: Server-side PDF creation with embedded QR codes
- **Email Delivery**: Automated ticket delivery via email
- **Inventory Control**: Real-time availability tracking with oversell protection
- **Admin Tools**: Order management, refunds, and ticket scanning
- **Audit Logging**: Complete action tracking for compliance

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js API routes, Supabase Postgres
- **Authentication**: Supabase Auth
- **Payments**: PayPal REST SDK
- **Storage**: Supabase Storage
- **PDF Generation**: Puppeteer
- **QR Codes**: qrcode library
- **Email**: Nodemailer/EmailJS
- **Deployment**: Vercel + Supabase

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- PayPal Developer account
- Email service credentials

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd riot-network-ppv
npm install
```

2. **Environment Setup**
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Mux
NEXT_PUBLIC_MUX_PLAYBACK_ID=your_mux_playback_id

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. **Database Setup**
Execute the SQL schema in your Supabase dashboard:
```bash
# Copy the contents of database-schema.sql and run in Supabase SQL editor
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## PayPal Sandbox Setup

1. **Create PayPal Developer Account**
   - Go to [PayPal Developer](https://developer.paypal.com)
   - Create a new app in sandbox mode

2. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to `.env.local`

3. **Test Cards**
   - Use PayPal's test credit cards for sandbox testing
   - Email: sb-buyer@personal.example.com
   - Password: test1234

## Database Schema

### Core Tables
- `users` - User profiles and roles
- `orders` - PPV purchase orders
- `chat_messages` - Live chat data
- `vods` - Video on demand content

### Ticketmaster Tables
- `events` - Event information and settings
- `ticket_tiers` - Pricing and inventory tiers
- `ticket_orders` - Purchase orders
- `order_items` - Individual ticket purchases
- `tickets` - Generated tickets with QR codes
- `admin_audit_logs` - Action tracking
- `refunds` - Refund processing

## API Endpoints

### PayPal Integration
- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/capture-order` - Capture payment
- `POST /api/webhooks/paypal` - PayPal webhooks

### Ticket Management
- `GET /api/events` - List events
- `GET /api/events/[slug]` - Event details
- `POST /api/tickets/verify/[code]` - Ticket verification/scanning

### Admin APIs
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/[id]` - Update event
- `GET /api/admin/orders` - List orders
- `POST /api/admin/orders/[id]/refund` - Process refund

## Admin Access

Default admin email: `kevinparxmusic@gmail.com`

### Admin Features
- **Event Creation**: Full event management with ticket tiers
- **Order Management**: View, search, and manage all orders
- **Refund Processing**: Issue PayPal refunds
- **Ticket Scanner**: QR code validation interface
- **Analytics Dashboard**: Sales metrics and reporting

## Security Features

- **Server-side Validation**: All price calculations server-side
- **Inventory Locking**: Database transactions prevent overselling
- **Role-based Access**: Admin-only protected routes
- **Payment Verification**: PayPal amount matching
- **Audit Logging**: Complete action tracking

## Testing

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Event browsing and ticket selection
- [ ] PayPal sandbox payment flow
- [ ] PDF ticket generation
- [ ] Email delivery
- [ ] QR code scanning
- [ ] Admin event creation
- [ ] Order management
- [ ] Refund processing

### Test Data
```sql
-- Insert test event
INSERT INTO events (title, slug, venue, start_datetime, end_datetime, sale_start, sale_end, description) 
VALUES ('Test Concert', 'test-concert', 'Test Venue', '2024-12-31 20:00:00+00', '2024-12-31 23:00:00+00', NOW(), '2024-12-30 23:59:59+00', 'Test event description');

-- Insert test ticket tier
INSERT INTO ticket_tiers (event_id, name, price_cents, quantity_total, limits_per_order) 
VALUES (1, 'General Admission', 2500, 100, 10);
```

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Supabase Setup
1. Create new Supabase project
2. Run database schema
3. Configure storage bucket for PDF tickets
4. Set up authentication providers

## Troubleshooting

### Common Issues

**PayPal Sandbox Issues**
- Verify client credentials
- Check sandbox vs live mode settings
- Ensure webhook URLs are correct

**PDF Generation Fails**
- Check Puppeteer dependencies
- Verify Supabase storage permissions
- Ensure sufficient memory allocation

**Email Delivery Issues**
- Verify SMTP credentials
- Check spam folders
- Confirm email service limits

**Database Errors**
- Verify Supabase connection
- Check table permissions
- Ensure schema is up to date

## Support

For technical support or questions:
- Check the GitHub issues
- Review Supabase documentation
- Consult PayPal developer docs

## License

Private - Riot Network Internal Use Only
