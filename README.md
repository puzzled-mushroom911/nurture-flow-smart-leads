# Nurture Flow Smart Leads

## 🚀 Quick Start - Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nurture-flow-smart-leads.git
   cd nurture-flow-smart-leads
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if you use yarn
   yarn install
   ```

3. **Set up environment variables**
   - Copy the `.env.example` file to `.env` (if it doesn't exist)
   - Update the necessary environment variables

4. **Start the development server**
   ```bash
   npm run dev
   # or if you use yarn
   yarn dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The app will automatically reload if you change any of the source files

## 🔧 Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Locally preview production build
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## 📋 Project Tasks

### High Priority

#### GoHighLevel Integration
- [ ] Test OAuth flow with real credentials
- [ ] Implement token refresh mechanism
- [ ] Set up webhook reception and processing
- [ ] Test integration end-to-end

#### Lead Synchronization Engine
- [ ] Create bidirectional sync between GoHighLevel contacts and local leads
- [ ] Implement scheduled sync jobs
- [ ] Build conflict resolution logic
- [ ] Add error handling and retry mechanisms

#### Message/Campaign Integration
- [ ] Connect approved messages to GoHighLevel campaigns
- [ ] Implement message sending capability
- [ ] Add campaign performance tracking
- [ ] Set up message templates system

### Medium Priority

#### Lead Scoring System
- [ ] Implement scoring algorithm based on document analysis
- [ ] Create rules engine for automated scoring
- [ ] Build score visualization dashboard
- [ ] Add manual score adjustment capability

#### Document Processing
- [ ] Complete document upload system
- [ ] Implement intelligent document analysis
- [ ] Connect document insights to lead profiles
- [ ] Add batch processing capabilities

#### User Management & Permissions
- [ ] Set up role-based access control
- [ ] Create team management interface
- [ ] Configure proper data isolation
- [ ] Implement audit logging

### Lower Priority

#### Reporting & Analytics
- [ ] Create performance dashboards
- [ ] Implement export functionality
- [ ] Set up scheduled report generation
- [ ] Add custom report builder

#### UI/UX Improvements
- [ ] Ensure consistent styling
- [ ] Optimize mobile responsiveness
- [ ] Add loading states
- [ ] Improve error handling
- [ ] Implement progressive web app features

#### Advanced Settings
- [ ] Create integration behavior options
- [ ] Implement notification preferences
- [ ] Add system maintenance tools
- [ ] Create backup and restore functionality

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

## Roadmap

Our development roadmap outlines the planned features and improvements:

### Short-term (1-3 months)
- Enhanced AI-powered lead scoring system
- Automated follow-up sequence builder
- Advanced analytics dashboard with custom reporting
- Mobile responsive design improvements

### Mid-term (3-6 months)
- Multi-language Model support
- Post Trained LLM Utilization
- Advanced document OCR and analysis

### Long-term (6+ months)
- AI-powered sales conversation insights
- Predictive lead behavior analytics
- Real-time collaboration features
- Enterprise-grade security enhancements

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

#### users
- User information and settings
- Subscription status and tier
- Integration credentials

#### user_integrations
- User-specific integration configurations
- Integration type and provider
- Credentials and last sync timestamp

#### user_knowledge_base
- User-specific knowledge base
- Document name, type, content, metadata, and timestamps

#### user_knowledge_embeddings
- User-specific knowledge base embeddings
- Document ID, chunk index, content chunk, embedding, and metadata

#### user_contacts
- User-specific contacts
- User ID, GoHighLevel contact ID, contact data, and timestamps

#### user_contact_embeddings
- User-specific contact embeddings
- User ID, contact ID, embedding, and last updated timestamp

#### user_usage_metrics
- User-specific usage metrics
- Metric type, value, and timestamp

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

## Example Lead Processing Service Structure

```typescript
interface LeadAssessment {
  qualityScore: number;
  recommendedFollowUpDate: Date;
  categories: string[];
  customTags: string[];
  opportunityStatus: string;
}

class LeadIntelligenceService {
  async assessLead(leadData: any): Promise<LeadAssessment> {
    // LLM call to analyze lead data
    // Return structured assessment
  }
  
  async generatePersonalizedMessage(lead: any, context: string): Promise<string> {
    // Prompt engineering for customized outreach
  }
}
```

## Example Workflow Controller

```typescript
class WorkflowController {
  async createFollowUpAction(leadId: string, messageTemplate: string): Promise<string> {
    // Generate message with LLM
    // Queue for human approval
    // Submit to GHL on approval
  }
  
  async getApprovalQueue(userId: string): Promise<PendingAction[]> {
    // Return actions awaiting human approval
  }
}
```

## Example Search Service

```typescript
class SemanticSearchService {
  async findLeadsByQuery(query: string): Promise<Lead[]> {
    // Convert query to embedding
    // Perform similarity search
    // Return matching leads
  }
}
```

class LLMService {
  async sendPrompt(prompt: string, context: any = {}): Promise<string> {
    // Format prompt with MCP standards
    // Call appropriate LLM
    // Process and validate response
    return response;
  }
}

async function processNewLead(contactId: string) {
  // 1. Extract contact data from GHL
  const contactData = await ghlService.getContactData(contactId, currentToken);
  
  // 2. Transform data for LLM processing
  const processableData = transformContactData(contactData);
  
  // 3. Run LLM analysis
  const analysis = await llmService.assessLead(processableData);
  
  // 4. Store results in Supabase
  await database.storeLeadAnalysis(contactId, analysis);
  
  // 5. Update GHL with new tags/categorization (optional)
  if (settings.autoUpdateGHL) {
    await ghlService.updateContact(contactId, {
      tags: analysis.recommendedTags
    });
  }
}

class ContactSyncService {
  private db: SupabaseClient;
  private embedder: EmbeddingService;
  
  constructor(db: SupabaseClient, embedder: EmbeddingService) {
    this.db = db;
    this.embedder = embedder;
  }
  
  async syncContact(ghlContactId: string, accessToken: string): Promise<string> {
    // 1. Fetch complete contact data from GHL
    const contactData = await this.fetchContactFromGHL(ghlContactId, accessToken);
    
    // 2. Store/update in relational database
    const contactUuid = await this.storeContactData(contactData);
    
    // 3. Generate embeddings and store in vector database
    await this.generateAndStoreEmbeddings(contactUuid, contactData);
    
    return contactUuid;
  }
  
  private async fetchContactFromGHL(contactId: string, token: string): Promise<any> {
    // Fetch complete contact data with all fields, tags, opportunities, etc.
    // Return full JSON response
  }
  
  private async storeContactData(contactData: any): Promise<string> {
    // Insert/update contact in primary table
    const { data, error } = await this.db
      .from('contacts')
      .upsert({
        ghl_contact_id: contactData.id,
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        raw_data: contactData
      }, { 
        onConflict: 'ghl_contact_id',
        returning: 'id'
      });
    
    const contactUuid = data[0].id;
    
    // Process and store custom fields
    await this.storeCustomFields(contactUuid, contactData.customFields);
    
    // Process and store tags
    await this.storeTags(contactUuid, contactData.tags);
    
    // Process communications, opportunities, etc.
    
    return contactUuid;
  }
  
  private async generateAndStoreEmbeddings(contactUuid: string, contactData: any): Promise<void> {
    // Create a text representation of the contact for embedding
    const contactText = this.createEmbeddingText(contactData);
    
    // Generate embedding using your chosen model (OpenAI, etc.)
    const embedding = await this.embedder.generateEmbedding(contactText);
    
    // Store the embedding
    await this.db
      .from('contact_embeddings')
      .upsert({
        contact_id: contactUuid,
        embedding: embedding,
        embedding_model: this.embedder.getModelName()
      }, {
        onConflict: 'contact_id',
        returning: 'id'
      });
  }
  
  private createEmbeddingText(contactData: any): string {
    // Combine relevant fields into a comprehensive text representation
    // This determines what will be semantically searchable
    return `
      Name: ${contactData.firstName} ${contactData.lastName}
      Email: ${contactData.email}
      Phone: ${contactData.phone}
      Custom Fields: ${this.formatCustomFields(contactData.customFields)}
      Tags: ${contactData.tags?.join(', ')}
      Notes: ${this.extractNotes(contactData)}
      Opportunities: ${this.formatOpportunities(contactData.opportunities)}
      Communication History: ${this.summarizeCommunications(contactData.communications)}
    `;
  }
}

interface IntegrationConfig {
  type: string;
  provider: string;
  credentials: any;
  settings: any;
}

class IntegrationManager {
  async addIntegration(userId: string, config: IntegrationConfig): Promise<void> {
    // Validate and store integration credentials
    await this.validateCredentials(config);
    await this.storeIntegrationConfig(userId, config);
    await this.initializeIntegration(userId, config);
  }

  private async initializeIntegration(userId: string, config: IntegrationConfig) {
    switch(config.type) {
      case 'calendar':
        await this.setupCalendarSync(userId, config);
        break;
      case 'crm':
        await this.setupCRMSync(userId, config);
        break;
      case 'marketing':
        await this.setupMarketingPlatform(userId, config);
        break;
    }
  }
}

class UserKnowledgeManager {
  constructor(
    private userId: string,
    private db: SupabaseClient,
    private embedder: EmbeddingService
  ) {}

  async uploadDocument(file: File, metadata: any): Promise<string> {
    // 1. Store document
    const docId = await this.storeDocument(file, metadata);
    
    // 2. Process and chunk document
    const chunks = await this.processDocument(file);
    
    // 3. Generate and store embeddings
    await this.storeEmbeddings(docId, chunks);
    
    return docId;
  }

  async searchKnowledgeBase(query: string): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.embedder.generateEmbedding(query);
    
    // Search user's knowledge base only
    return await this.db.rpc('search_user_knowledge', {
      user_id: this.userId,
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 10
    });
  }
}

// Middleware to ensure data isolation
const ensureUserAccess = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const resourceId = req.params.resourceId;

  const hasAccess = await checkUserResourceAccess(userId, resourceId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Database policies in Supabase
const setupRowLevelSecurity = async () => {
  await db.rpc('setup_rls_policies', {
    tables: [
      'user_knowledge_base',
      'user_contacts',
      'user_knowledge_embeddings',
      'user_contact_embeddings'
    ]
  });
};

interface IntegrationDashboardProps {
  userId: string;
}

const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({ userId }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  
  // Integration management UI
  return (
    <div>
      <IntegrationsList integrations={integrations} />
      <AddIntegrationForm onAdd={handleAddIntegration} />
      <IntegrationSettings />
      <SyncStatus />
    </div>
  );
};

## 🔄 Recent Changes

### GoHighLevel Template Integration
- Cloned GHL Marketplace App Template (April 9, 2024)
- Template repository: https://github.com/GoHighLevel/ghl-marketplace-app-template.git
- Integration status: In progress
- Key changes needed:
  - Update authorization flow to match GHL standards
  - Implement proper installation management
  - Add webhook handling
  - Integrate SSO capabilities
  - Update environment variables structure

### Implementation Plan
1. Authorization Flow Updates
   - Implement standard GHL OAuth flow
   - Add proper token refresh mechanism
   - Update redirect URL handling

2. API Integration
   - Restructure GHL service for company/location-level calls
   - Implement proper error handling
   - Add rate limiting and retry logic

3. Installation Management
   - Update database schema for multi-location support
   - Implement installation retrieval logic
   - Add token validation and refresh

4. Webhook System
   - Create dedicated webhook handler
   - Implement signature validation
   - Add event processing logic

5. SSO Integration
   - Add SSO key to environment
   - Implement token decryption
   - Create user session management
