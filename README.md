# Nurture Flow Smart Leads

A powerful lead management and document processing platform that integrates with GoHighLevel CRM to provide intelligent lead nurturing capabilities through document analysis and automated workflows.

## Features

### 🤝 GoHighLevel Integration
- Seamless OAuth2 authentication with automatic token refresh
- Real-time webhook event processing for lead updates
- Multi-location support for agency management
- Secure API integration with proper error handling

### 📄 Document Management
- Intelligent document upload and processing system
- Real-time status tracking with progress indicators
- Error handling with automatic retry capabilities
- Document analysis for lead nurturing insights

### 👥 Lead Management
- Comprehensive lead tracking and status management
- Real-time synchronization with GoHighLevel contacts
- Automated lead processing and qualification
- Custom lead scoring based on document analysis

### 📊 Dashboard
- Recent leads overview with status indicators
- Document processing queue management
- Approval workflow monitoring
- Activity tracking and analytics

### 🔒 Security
- Industry-standard OAuth2 implementation
- Secure token management and refresh mechanisms
- Protected API endpoints with proper validation
- Role-based access control for team management

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Backend**: Supabase with Edge Functions
- **Database**: PostgreSQL (via Supabase)
- **API Integration**: GoHighLevel API
- **UI Framework**: Tailwind CSS with shadcn/ui
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- GoHighLevel developer account
- Git

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GHL_CLIENT_ID=your_gohighlevel_client_id
GHL_CLIENT_SECRET=your_gohighlevel_client_secret
FRONTEND_URL=your_frontend_url
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nurture-flow-smart-leads
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Deploy Supabase functions:
```bash
supabase init
supabase functions deploy
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

### GoHighLevel Configuration

1. Create a developer account at [GoHighLevel Marketplace](https://marketplace.gohighlevel.com)
2. Set up your application:
   - Configure OAuth redirect URLs
   - Set up webhook endpoints
   - Define required scopes:
     - locations.readonly
     - conversations.readonly
     - conversations/message.write
     - contacts.write
     - opportunities.write
     - opportunities.readonly
3. Add your Client ID and Client Secret to environment variables

## Project Structure

```
src/
├── components/
│   ├── dashboard/      # Dashboard components
│   ├── knowledge/      # Document management
│   ├── settings/       # App configuration
│   └── ui/            # Reusable UI components
├── pages/             # Main application pages
├── lib/              # Shared utilities
└── types/            # TypeScript definitions

supabase/
└── functions/
    ├── ghl-auth/
    ├── ghl-callback/
    ├── ghl-webhook/
    └── ghl-refresh-token/
```

## Database Schema

### Core Tables

#### ghl_installations
- Stores GoHighLevel integration data
- Manages access tokens and refresh tokens
- Tracks installation status and metadata

#### knowledge_base
- Document storage and processing status
- Content analysis results
- Document metadata and relationships

#### leads
- Lead information and tracking
- Integration with GoHighLevel contacts
- Lead scoring and qualification data

#### webhook_events
- GoHighLevel event tracking
- Event processing status
- Audit trail for system events

## API Endpoints

### GoHighLevel Integration
- `/oauth/callback/gohighlevel`: OAuth callback handler
- `/webhook`: Webhook event processor
- `/refresh-token`: Token refresh endpoint

### Document Management
- `/documents`: Document CRUD operations
- `/documents/process`: Document processing
- `/documents/status`: Processing status

## Development

### Running Tests
```bash
npm run test
# or
yarn test
```

### Building for Production
```bash
npm run build
# or
yarn build
```

### Deployment
The application can be deployed to any platform that supports Node.js applications. We recommend:
- Vercel
- Netlify
- AWS Amplify

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support:
- Open an issue in the GitHub repository
- Contact the development team
- Check the [GoHighLevel documentation](https://help.gohighlevel.com/support/solutions/folders/48000668553)

## Acknowledgments

- [GoHighLevel](https://www.gohighlevel.com/) for their CRM platform
- [Supabase](https://supabase.io/) for backend infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

---

**Note**: Ensure proper security measures and testing before deploying to production.
