import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Employees / Participants (20)
const employees = [
  { id: 'emp-1', name: 'Alex Rivera', role: 'Head of Product', email: 'alex.rivera@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', department: 'Product' },
  { id: 'emp-2', name: 'Elena Rostova', role: 'VP of Engineering', email: 'elena.rostova@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', department: 'Engineering' },
  { id: 'emp-3', name: 'Marcus Vance', role: 'Senior Account Executive', email: 'marcus.vance@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', department: 'Sales' },
  { id: 'emp-4', name: 'Chloe Chen', role: 'Staff Data Scientist', email: 'chloe.chen@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', department: 'Data & AI' },
  { id: 'emp-5', name: 'David Kim', role: 'Principal Infrastructure Lead', email: 'david.kim@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', department: 'Infrastructure' },
  { id: 'emp-6', name: 'Siddharth Patel', role: 'Customer Success Director', email: 'siddharth.p@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', department: 'Customer Success' },
  { id: 'emp-7', name: 'Maya Lin', role: 'Senior UI/UX Designer', email: 'maya.lin@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', department: 'Design' },
  { id: 'emp-8', name: 'Lucas Meyer', role: 'Lead DevOps Engineer', email: 'lucas.m@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', department: 'DevOps' },
  { id: 'emp-9', name: 'Aisha Al-Mansoor', role: 'Security & Compliance Lead', email: 'aisha.m@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', department: 'Security' },
  { id: 'emp-10', name: 'Julian Thorne', role: 'Senior Frontend Architect', email: 'julian.t@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', department: 'Frontend' },
  { id: 'emp-11', name: 'Rachel Green', role: 'QA Automation Lead', email: 'rachel.g@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150', department: 'QA' },
  { id: 'emp-12', name: 'Thomas Wright', role: 'Product Marketing Manager', email: 'thomas.w@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', department: 'Marketing' },
  { id: 'emp-13', name: 'Sofia Rodriguez', role: 'Support Operations Lead', email: 'sofia.r@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed292a15?w=150', department: 'Support' },
  { id: 'emp-14', name: 'Kevin Zhang', role: 'Backend Systems Engineer', email: 'kevin.z@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', department: 'Engineering' },
  { id: 'emp-15', name: 'Nora Lindqvist', role: 'Technical Account Manager', email: 'nora.l@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150', department: 'Customer Success' },
  { id: 'emp-16', name: 'Brian O\'Connor', role: 'Solutions Architect', email: 'brian.oc@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150', department: 'Sales' },
  { id: 'emp-17', name: 'Fatima Zahra', role: 'Product Operations Analyst', email: 'fatima.z@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', department: 'Product' },
  { id: 'emp-18', name: 'Samuel Gomez', role: 'Fullstack Engineer', email: 'samuel.g@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', department: 'Engineering' },
  { id: 'emp-19', name: 'Leila Farouk', role: 'Growth Marketing Lead', email: 'leila.f@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', department: 'Marketing' },
  { id: 'emp-20', name: 'Daniel Brooks', role: 'Chief Revenue Officer', email: 'daniel.b@nexusflow.io', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', department: 'Executive' },
];

// 2. Clients (12)
const clients = [
  {
    id: 'client-acme-corp',
    name: 'Acme Corp',
    shortName: 'Acme',
    industry: 'Enterprise Manufacturing & Logistics',
    tier: 'Enterprise Platinum',
    status: 'Active',
    mrr: 48500,
    healthScore: 74,
    healthTrend: 'declining',
    contractRenewalDate: '2027-02-15',
    primaryContact: {
      name: 'Sarah Jenkins',
      title: 'VP Operations & Supply Tech',
      email: 's.jenkins@acmeww.com',
      phone: '+1 (415) 890-3321'
    },
    accountExecutiveId: 'emp-3',
    accountExecutiveName: 'Marcus Vance',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['Strategic', 'Q4 Expansion', 'At-Risk Monitoring'],
    summary: 'Key enterprise account since 2024. Migrating global fulfillment centers onto NexusFlow platform. Recent friction around SSO sync and Query Builder timeouts during peak month-end close.'
  },
  {
    id: 'client-acme-labs',
    name: 'Acme Labs Inc',
    shortName: 'Acme Labs',
    industry: 'Biotech & Clinical Analytics',
    tier: 'Growth Tier',
    status: 'Active',
    mrr: 16200,
    healthScore: 94,
    healthTrend: 'improving',
    contractRenewalDate: '2026-11-30',
    primaryContact: {
      name: 'Dr. Raymond Scott',
      title: 'Head of Clinical Bio-Informatics',
      email: 'rscott@acmelabs.bio',
      phone: '+1 (617) 441-9080'
    },
    accountExecutiveId: 'emp-16',
    accountExecutiveName: 'Brian O\'Connor',
    customerSuccessId: 'emp-15',
    customerSuccessName: 'Nora Lindqvist',
    tags: ['Biotech', 'Fast Growth', 'HIPAA Addon'],
    summary: 'High satisfaction account utilizing automated clinical trial ingestion pipeline. Exploring expansion to 200 researcher seats.'
  },
  {
    id: 'client-strata-cloud',
    name: 'Strata Cloud Systems',
    shortName: 'Strata',
    industry: 'Cloud Infrastructure SaaS',
    tier: 'Enterprise Platinum',
    status: 'Active',
    mrr: 62000,
    healthScore: 88,
    healthTrend: 'stable',
    contractRenewalDate: '2027-06-01',
    primaryContact: {
      name: 'Marcus Sterling',
      title: 'Chief Technology Officer',
      email: 'sterling@stratacloud.io',
      phone: '+1 (206) 555-0199'
    },
    accountExecutiveId: 'emp-3',
    accountExecutiveName: 'Marcus Vance',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['Tech Giant', 'API Heavy', 'Multi-tenant'],
    summary: 'High volume partner consuming over 4M API events daily. Integrating NexusFlow webhooks directly into Kubernetes automation.'
  },
  {
    id: 'client-apex-fintech',
    name: 'Apex Global Financial',
    shortName: 'Apex',
    industry: 'Financial Services & Payments',
    tier: 'Enterprise Custom',
    status: 'Active',
    mrr: 89000,
    healthScore: 68,
    healthTrend: 'declining',
    contractRenewalDate: '2026-12-15',
    primaryContact: {
      name: 'Victoria Vance-Reid',
      title: 'Head of Data Compliance',
      email: 'v.vancereid@apexfin.com',
      phone: '+1 (212) 800-4320'
    },
    accountExecutiveId: 'emp-20',
    accountExecutiveName: 'Daniel Brooks',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['Financial Services', 'Audit Requirement', 'Escalated'],
    summary: 'Tier 1 financial institution. Recent audit identified latency spikes in automated reporting. Executive review scheduled for end of month.'
  },
  {
    id: 'client-lumina-health',
    name: 'Lumina Health Network',
    shortName: 'Lumina',
    industry: 'Healthcare & Telemedicine',
    tier: 'Enterprise Platinum',
    status: 'Active',
    mrr: 41000,
    healthScore: 91,
    healthTrend: 'improving',
    contractRenewalDate: '2027-04-10',
    primaryContact: {
      name: 'Dr. Evelyn Morales',
      title: 'Chief Digital Medical Officer',
      email: 'emorales@luminahealth.org',
      phone: '+1 (312) 777-9002'
    },
    accountExecutiveId: 'emp-3',
    accountExecutiveName: 'Marcus Vance',
    customerSuccessId: 'emp-15',
    customerSuccessName: 'Nora Lindqvist',
    tags: ['Healthcare', 'HIPAA', 'High Satisfaction'],
    summary: 'Connecting 42 hospital networks into central triage workflows. Seamless deployment with zero SLA infractions over past 6 months.'
  },
  {
    id: 'client-omni-retail',
    name: 'Omni Retail Group',
    shortName: 'Omni',
    industry: 'E-commerce & Retail Omnichannel',
    tier: 'Scale Tier',
    status: 'Active',
    mrr: 29500,
    healthScore: 62,
    healthTrend: 'declining',
    contractRenewalDate: '2026-10-31',
    primaryContact: {
      name: 'Kenneth Barnes',
      title: 'VP Omnichannel Engineering',
      email: 'kbarnes@omniretail.com',
      phone: '+1 (404) 332-1144'
    },
    accountExecutiveId: 'emp-16',
    accountExecutiveName: 'Brian O\'Connor',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['Retail', 'Black Friday Prep', 'Overdue Contract'],
    summary: 'Pending renewal in 3 weeks. Blocked on resolution of inventory feed latency and high-volume batch sync reliability.'
  },
  {
    id: 'client-zenith-media',
    name: 'Zenith Interactive Media',
    shortName: 'Zenith',
    industry: 'Digital Streaming & Ad Tech',
    tier: 'Scale Tier',
    status: 'Active',
    mrr: 23000,
    healthScore: 82,
    healthTrend: 'stable',
    contractRenewalDate: '2027-01-20',
    primaryContact: {
      name: 'Chloe Laurent',
      title: 'VP Product Analytics',
      email: 'claurent@zenithmedia.net',
      phone: '+1 (310) 902-8810'
    },
    accountExecutiveId: 'emp-16',
    accountExecutiveName: 'Brian O\'Connor',
    customerSuccessId: 'emp-15',
    customerSuccessName: 'Nora Lindqvist',
    tags: ['Media', 'AdTech', 'Adoption Growing'],
    summary: 'Rapid adoption of Real-time Dashboard widgets. 350 monthly active internal consumers.'
  },
  {
    id: 'client-hyperion-energy',
    name: 'Hyperion Renewable Dynamics',
    shortName: 'Hyperion',
    industry: 'CleanTech & Renewable Energy Grid',
    tier: 'Enterprise',
    status: 'Active',
    mrr: 54000,
    healthScore: 96,
    healthTrend: 'improving',
    contractRenewalDate: '2027-08-30',
    primaryContact: {
      name: 'Erik Vestergaard',
      title: 'Grid Automation Lead',
      email: 'vestergaard@hyperiondynamics.eu',
      phone: '+45 20 44 98 12'
    },
    accountExecutiveId: 'emp-3',
    accountExecutiveName: 'Marcus Vance',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['CleanTech', 'IoT Ingestion', 'European Cluster'],
    summary: 'Connecting 12,000 wind and solar turbine telemetry endpoints into NexusFlow streaming pipelines.'
  },
  {
    id: 'client-pulsar-robotics',
    name: 'Pulsar Industrial Robotics',
    shortName: 'Pulsar',
    industry: 'Industrial Automation & Robotics',
    tier: 'Growth Tier',
    status: 'Active',
    mrr: 19800,
    healthScore: 79,
    healthTrend: 'stable',
    contractRenewalDate: '2027-03-15',
    primaryContact: {
      name: 'Tatsuya Mori',
      title: 'Chief Engineer Factory Systems',
      email: 'mori@pulsar-robotics.jp',
      phone: '+81 3 5550 4912'
    },
    accountExecutiveId: 'emp-16',
    accountExecutiveName: 'Brian O\'Connor',
    customerSuccessId: 'emp-15',
    customerSuccessName: 'Nora Lindqvist',
    tags: ['Robotics', 'Japan', 'Hardware Integration'],
    summary: 'Deploying edge compute sensors integrated with NexusFlow event ingestion.'
  },
  {
    id: 'client-aerofleet-intl',
    name: 'AeroFleet International',
    shortName: 'AeroFleet',
    industry: 'Commercial Aviation Logistics',
    tier: 'Enterprise Platinum',
    status: 'Active',
    mrr: 72000,
    healthScore: 84,
    healthTrend: 'stable',
    contractRenewalDate: '2027-05-18',
    primaryContact: {
      name: 'Captain Robert Dubois',
      title: 'Head of Fleet Operations',
      email: 'rdubois@aerofleet.aero',
      phone: '+1 (773) 490-8801'
    },
    accountExecutiveId: 'emp-20',
    accountExecutiveName: 'Daniel Brooks',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['Aviation', 'Mission Critical', '24/7 SLA'],
    summary: 'Worldwide airline ground scheduling and baggage routing operations. 99.99% uptime compliance.'
  },
  {
    id: 'client-novus-edu',
    name: 'Novus Higher Education Group',
    shortName: 'Novus Edu',
    industry: 'EdTech & University Systems',
    tier: 'Growth Tier',
    status: 'Active',
    mrr: 14500,
    healthScore: 87,
    healthTrend: 'stable',
    contractRenewalDate: '2027-02-28',
    primaryContact: {
      name: 'Dr. Pamela Wright',
      title: 'Dean of Information Architecture',
      email: 'pwright@novus.edu',
      phone: '+1 (617) 590-3321'
    },
    accountExecutiveId: 'emp-16',
    accountExecutiveName: 'Brian O\'Connor',
    customerSuccessId: 'emp-15',
    customerSuccessName: 'Nora Lindqvist',
    tags: ['EdTech', 'Public Sector', 'Student Records'],
    summary: 'Consolidating academic transcripts and identity services for 48,000 enrolled students.'
  },
  {
    id: 'client-vanguard-cyber',
    name: 'Vanguard Cyber Defense',
    shortName: 'Vanguard',
    industry: 'Cybersecurity Threat Intelligence',
    tier: 'Enterprise Platinum',
    status: 'Active',
    mrr: 65000,
    healthScore: 92,
    healthTrend: 'improving',
    contractRenewalDate: '2027-09-12',
    primaryContact: {
      name: 'Gareth Evans',
      title: 'Director of Threat Operations',
      email: 'gevans@vanguarddefense.uk',
      phone: '+44 20 7946 0912'
    },
    accountExecutiveId: 'emp-3',
    accountExecutiveName: 'Marcus Vance',
    customerSuccessId: 'emp-6',
    customerSuccessName: 'Siddharth Patel',
    tags: ['Cybersecurity', 'UK Gov Approved', 'SIEM Integration'],
    summary: 'Analyzing automated incident telemetry. Key reference customer for our real-time streaming capability.'
  }
];

// 3. Projects (8)
const projects = [
  {
    id: 'proj-nexus-3',
    name: 'NexusFlow 3.0 Platform Launch',
    code: 'NX3-LAUNCH',
    clientId: null,
    clientName: 'Internal Core Product',
    status: 'In Progress',
    priority: 'Critical',
    progress: 78,
    ownerId: 'emp-1',
    ownerName: 'Alex Rivera',
    leadEngineerId: 'emp-2',
    leadEngineerName: 'Elena Rostova',
    startDate: '2026-08-01',
    targetDate: '2026-10-25',
    budget: '$340,000',
    description: 'Major generational launch featuring Autonomous Workflows, Next-Gen Query Engine v2, and Redesigned Adaptive UI. Critical milestone for enterprise renewals.'
  },
  {
    id: 'proj-acme-onboard',
    name: 'Acme Corp Global Distribution Integration',
    code: 'ACME-INT-24',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    status: 'At Risk',
    priority: 'Critical',
    progress: 62,
    ownerId: 'emp-3',
    ownerName: 'Marcus Vance',
    leadEngineerId: 'emp-5',
    leadEngineerName: 'David Kim',
    startDate: '2026-07-15',
    targetDate: '2026-10-18', // OVERDUE / IMPENDING
    budget: '$180,000',
    description: 'Onboarding 14 Acme North American logistics hubs onto NexusFlow. Currently blocked by SSO Active Directory group mapping and query timeouts on multi-warehouse aggregations.'
  },
  {
    id: 'proj-apex-soc2',
    name: 'Apex Financial Dedicated VPC & SOC2 Compliance',
    code: 'APX-COMPL-02',
    clientId: 'client-apex-fintech',
    clientName: 'Apex Global Financial',
    status: 'Delayed',
    priority: 'High',
    progress: 45,
    ownerId: 'emp-9',
    ownerName: 'Aisha Al-Mansoor',
    leadEngineerId: 'emp-8',
    leadEngineerName: 'Lucas Meyer',
    startDate: '2026-06-01',
    targetDate: '2026-10-05', // OVERDUE!
    budget: '$120,000',
    description: 'Isolated single-tenant tenancy cluster buildout for Apex compliance requirements. 2 audit tasks currently overdue.'
  },
  {
    id: 'proj-mobile-sdk',
    name: 'Mobile Analytics & Real-Time SDK v2',
    code: 'MOB-SDK-2',
    clientId: null,
    clientName: 'Internal Core Product',
    status: 'In Progress',
    priority: 'Medium',
    progress: 85,
    ownerId: 'emp-10',
    ownerName: 'Julian Thorne',
    leadEngineerId: 'emp-14',
    leadEngineerName: 'Kevin Zhang',
    startDate: '2026-08-15',
    targetDate: '2026-11-10',
    budget: '$95,000',
    description: 'Native iOS & Android telemetry SDK supporting offline buffering and batch uploads.'
  },
  {
    id: 'proj-omni-feed',
    name: 'Omni Retail Live Catalog Feed Pipeline',
    code: 'OMNI-CAT-09',
    clientId: 'client-omni-retail',
    clientName: 'Omni Retail Group',
    status: 'Delayed',
    priority: 'High',
    progress: 50,
    ownerId: 'emp-16',
    ownerName: 'Brian O\'Connor',
    leadEngineerId: 'emp-18',
    leadEngineerName: 'Samuel Gomez',
    startDate: '2026-09-01',
    targetDate: '2026-10-08', // OVERDUE!
    budget: '$75,000',
    description: 'Automated 15-minute delta synchronizer for 2.4 million SKU items ahead of Black Friday peak.'
  },
  {
    id: 'proj-hyperion-iot',
    name: 'Hyperion Wind Turbine Telemetry Gateway',
    code: 'HYP-IOT-4',
    clientId: 'client-hyperion-energy',
    clientName: 'Hyperion Renewable Dynamics',
    status: 'Completed',
    priority: 'High',
    progress: 100,
    ownerId: 'emp-3',
    ownerName: 'Marcus Vance',
    leadEngineerId: 'emp-5',
    leadEngineerName: 'David Kim',
    startDate: '2026-05-10',
    targetDate: '2026-09-28',
    budget: '$160,000',
    description: 'Real-time telemetry ingestion cluster deployed across EU-Central regions. Fully verified and in production.'
  },
  {
    id: 'proj-ai-summarizer',
    name: 'Autonomous AI Insights & Executive Summarizer',
    code: 'AI-SUMM-1',
    clientId: null,
    clientName: 'Internal AI Lab',
    status: 'In Progress',
    priority: 'Critical',
    progress: 70,
    ownerId: 'emp-4',
    ownerName: 'Chloe Chen',
    leadEngineerId: 'emp-14',
    leadEngineerName: 'Kevin Zhang',
    startDate: '2026-07-20',
    targetDate: '2026-10-30',
    budget: '$210,000',
    description: 'LLM-powered autonomous root cause detector and executive briefing generator.'
  },
  {
    id: 'proj-strata-api-gw',
    name: 'Strata Cloud High-Throughput Webhook Bridge',
    code: 'STR-WB-8',
    clientId: 'client-strata-cloud',
    clientName: 'Strata Cloud Systems',
    status: 'In Progress',
    priority: 'Medium',
    progress: 90,
    ownerId: 'emp-6',
    ownerName: 'Siddharth Patel',
    leadEngineerId: 'emp-8',
    leadEngineerName: 'Lucas Meyer',
    startDate: '2026-08-01',
    targetDate: '2026-10-22',
    budget: '$60,000',
    description: 'Low-latency distributed webhook dispatcher supporting up to 50,000 requests per second.'
  }
];

// 4. Tasks (60 tasks) - with realistic overdue, blocked, in-progress, completed
const taskTemplates = [
  // Overdue Acme tasks
  { id: 'task-1', projectId: 'proj-acme-onboard', title: 'Resolve Okta SAML SSO attribute mapping discrepancy', priority: 'Critical', status: 'Overdue', assigneeId: 'emp-5', assigneeName: 'David Kim', dueDate: '2026-10-04', blockedBy: null, clientName: 'Acme Corp', hoursEstimated: 16, tags: ['Security', 'SSO', 'Acme-Blocker'] },
  { id: 'task-2', projectId: 'proj-acme-onboard', title: 'Optimize warehouse aggregation query timeout on multi-region dataset', priority: 'Critical', status: 'Overdue', assigneeId: 'emp-2', assigneeName: 'Elena Rostova', dueDate: '2026-10-06', blockedBy: 'INC-1042', clientName: 'Acme Corp', hoursEstimated: 24, tags: ['Backend', 'SQL', 'Acme-Blocker'] },
  { id: 'task-3', projectId: 'proj-acme-onboard', title: 'Deliver Chicago Hub UAT test signoff document to Sarah Jenkins', priority: 'High', status: 'Overdue', assigneeId: 'emp-3', assigneeName: 'Marcus Vance', dueDate: '2026-10-07', blockedBy: 'task-1', clientName: 'Acme Corp', hoursEstimated: 8, tags: ['Sales', 'Compliance', 'Acme'] },
  { id: 'task-4', projectId: 'proj-acme-onboard', title: 'Configure audit log streaming to Acme AWS S3 bucket', priority: 'Medium', status: 'Overdue', assigneeId: 'emp-8', assigneeName: 'Lucas Meyer', dueDate: '2026-10-08', blockedBy: null, clientName: 'Acme Corp', hoursEstimated: 12, tags: ['DevOps', 'Acme'] },
  { id: 'task-5', projectId: 'proj-acme-onboard', title: 'Prepare executive readout deck for Acme Q4 Quarterly Review', priority: 'High', status: 'In Progress', assigneeId: 'emp-1', assigneeName: 'Alex Rivera', dueDate: '2026-10-11', blockedBy: null, clientName: 'Acme Corp', hoursEstimated: 10, tags: ['Executive', 'Review', 'Acme'] },

  // Apex SOC2 Overdue
  { id: 'task-6', projectId: 'proj-apex-soc2', title: 'Finalize SOC2 Type II cryptographic key rotation policy report', priority: 'Critical', status: 'Overdue', assigneeId: 'emp-9', assigneeName: 'Aisha Al-Mansoor', dueDate: '2026-10-02', blockedBy: null, clientName: 'Apex Global Financial', hoursEstimated: 20, tags: ['Security', 'Audit', 'Apex'] },
  { id: 'task-7', projectId: 'proj-apex-soc2', title: 'Implement VPC peering transit gateway for Apex US-East latency reduction', priority: 'High', status: 'Overdue', assigneeId: 'emp-5', assigneeName: 'David Kim', dueDate: '2026-10-05', blockedBy: null, clientName: 'Apex Global Financial', hoursEstimated: 32, tags: ['Infra', 'Network', 'Apex'] },
  { id: 'task-8', projectId: 'proj-apex-soc2', title: 'Sign off dedicated tenancy penetration test remediations', priority: 'Critical', status: 'Blocked', assigneeId: 'emp-9', assigneeName: 'Aisha Al-Mansoor', dueDate: '2026-10-09', blockedBy: 'task-7', clientName: 'Apex Global Financial', hoursEstimated: 14, tags: ['Security', 'Pentest'] },

  // Omni Retail Overdue
  { id: 'task-9', projectId: 'proj-omni-feed', title: 'Fix Kafka consumer group partition lag during delta sync', priority: 'High', status: 'Overdue', assigneeId: 'emp-18', assigneeName: 'Samuel Gomez', dueDate: '2026-10-06', blockedBy: null, clientName: 'Omni Retail Group', hoursEstimated: 18, tags: ['Data', 'Kafka', 'Omni'] },
  { id: 'task-10', projectId: 'proj-omni-feed', title: 'Verify catalog price discount currency formatting for EU storefronts', priority: 'Medium', status: 'Overdue', assigneeId: 'emp-11', assigneeName: 'Rachel Green', dueDate: '2026-10-08', blockedBy: null, clientName: 'Omni Retail Group', hoursEstimated: 8, tags: ['QA', 'Omni'] },

  // Nexus 3.0 Launch Tasks
  { id: 'task-11', projectId: 'proj-nexus-3', title: 'Resolve Query Engine v2 memory leak causing query timeouts', priority: 'Critical', status: 'In Progress', assigneeId: 'emp-2', assigneeName: 'Elena Rostova', dueDate: '2026-10-12', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 28, tags: ['Core', 'Performance', 'P0'] },
  { id: 'task-12', projectId: 'proj-nexus-3', title: 'Roll back or hotfix Release v2.8.4 query planning optimizer regression', priority: 'Critical', status: 'In Progress', assigneeId: 'emp-14', assigneeName: 'Kevin Zhang', dueDate: '2026-10-11', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 16, tags: ['Hotfix', 'Release-v2.8.4'] },
  { id: 'task-13', projectId: 'proj-nexus-3', title: 'Execute customer impact assessment for usage drop across Query Builder', priority: 'High', status: 'In Progress', assigneeId: 'emp-4', assigneeName: 'Chloe Chen', dueDate: '2026-10-12', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 12, tags: ['Analytics', 'RootCause'] },
  { id: 'task-14', projectId: 'proj-nexus-3', title: 'Finalize Nexus 3.0 launch keynote and customer briefing slides', priority: 'High', status: 'In Progress', assigneeId: 'emp-12', assigneeName: 'Thomas Wright', dueDate: '2026-10-14', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 16, tags: ['Marketing', 'Launch'] },
  { id: 'task-15', projectId: 'proj-nexus-3', title: 'Schedule Nexus 3.0 Executive Readiness & Go/No-Go Meeting', priority: 'Critical', status: 'In Progress', assigneeId: 'emp-1', assigneeName: 'Alex Rivera', dueDate: '2026-10-11', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 4, tags: ['Executive', 'Launch'] },
  { id: 'task-16', projectId: 'proj-nexus-3', title: 'Run multi-region failover drill for Kubernetes production clusters', priority: 'High', status: 'Overdue', assigneeId: 'emp-8', assigneeName: 'Lucas Meyer', dueDate: '2026-10-07', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 20, tags: ['Infra', 'Reliability'] },
  { id: 'task-17', projectId: 'proj-nexus-3', title: 'Review API breaking change deprecation warnings with Tier 1 clients', priority: 'Medium', status: 'Overdue', assigneeId: 'emp-6', assigneeName: 'Siddharth Patel', dueDate: '2026-10-09', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 14, tags: ['CustomerSuccess'] },
  { id: 'task-18', projectId: 'proj-nexus-3', title: 'Conduct end-to-end accessibility WCAG 2.1 AA audit on Adaptive UI', priority: 'Medium', status: 'In Progress', assigneeId: 'emp-7', assigneeName: 'Maya Lin', dueDate: '2026-10-15', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 16, tags: ['A11y', 'Design'] },
  { id: 'task-19', projectId: 'proj-nexus-3', title: 'Draft customer migration guide for Query Builder v2 syntax', priority: 'High', status: 'In Progress', assigneeId: 'emp-17', assigneeName: 'Fatima Zahra', dueDate: '2026-10-13', blockedBy: 'task-12', clientName: 'Internal Core Product', hoursEstimated: 12, tags: ['Docs', 'Support'] },
  { id: 'task-20', projectId: 'proj-nexus-3', title: 'Verify billing calculation accuracy for autonomous agent token usage', priority: 'Critical', status: 'In Progress', assigneeId: 'emp-20', assigneeName: 'Daniel Brooks', dueDate: '2026-10-14', blockedBy: null, clientName: 'Internal Core Product', hoursEstimated: 10, tags: ['Finance', 'Billing'] },
];

// Generate additional tasks up to 60 with balanced statuses and realistic dates
const additionalTasks = [];
const assignees = employees;
const statuses = ['Completed', 'In Progress', 'Completed', 'In Progress', 'Blocked', 'Completed', 'Overdue'];
const priorities = ['Medium', 'Low', 'High', 'Medium', 'Critical', 'Low', 'High'];

for (let i = 21; i <= 60; i++) {
  const proj = projects[i % projects.length];
  const assignee = assignees[i % assignees.length];
  const stat = statuses[i % statuses.length];
  const prio = priorities[i % priorities.length];
  const isOverdue = stat === 'Overdue';
  const dueDay = isOverdue ? (1 + (i % 8)) : (12 + (i % 18));
  const dueMonth = isOverdue ? '10' : '10';
  const dueDate = `2026-${dueMonth}-${dueDay.toString().padStart(2, '0')}`;

  additionalTasks.push({
    id: `task-${i}`,
    projectId: proj.id,
    title: `${proj.code}: ${prio} requirement item #${i} - ${['Performance validation', 'Integration test suite', 'Documentation sync', 'Telemetry dashboard review', 'Client stakeholder check-in', 'Security token validation'][i % 6]}`,
    priority: prio,
    status: stat,
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    dueDate,
    blockedBy: stat === 'Blocked' ? `task-${(i % 15) + 1}` : null,
    clientName: proj.clientName,
    hoursEstimated: 4 + (i % 24),
    tags: [proj.name.split(' ')[0], prio]
  });
}

const allTasks = [...taskTemplates, ...additionalTasks];

// 5. Communications (50)
const communications = [
  {
    id: 'comm-1',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    type: 'Email',
    direction: 'Inbound',
    sender: 'Sarah Jenkins <s.jenkins@acmeww.com>',
    recipient: 'Marcus Vance <marcus.vance@nexusflow.io>',
    cc: ['Alex Rivera <alex.rivera@nexusflow.io>', 'David Kim <david.kim@nexusflow.io>'],
    date: '2026-10-09T14:22:00Z',
    subject: 'Urgent: Agenda items for tomorrow\'s meeting & Query Builder freeze',
    preview: 'Hi Marcus & Alex, Looking forward to our quarterly sync tomorrow at 10 AM. We need to allocate at least 20 minutes to the query timeout issue our Chicago team hit yesterday...',
    sentiment: 'Concerned',
    tags: ['Quarterly Sync', 'Query Timeout', 'Agenda']
  },
  {
    id: 'comm-2',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    type: 'Slack / Message',
    direction: 'Outbound',
    sender: 'Marcus Vance <marcus.vance@nexusflow.io>',
    recipient: 'Sarah Jenkins <s.jenkins@acmeww.com>',
    date: '2026-10-09T15:05:00Z',
    subject: 'Re: Agenda items & Query Builder freeze',
    preview: 'Sarah - understood completely. Alex Rivera (Head of Product) and Elena Rostova (VP Eng) are on top of the root cause from release v2.8.4. We will present the exact fix timeline in tomorrow\'s meeting.',
    sentiment: 'Reassuring',
    tags: ['Meeting Prep', 'Executive']
  },
  {
    id: 'comm-3',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    type: 'Email',
    direction: 'Inbound',
    sender: 'Sarah Jenkins <s.jenkins@acmeww.com>',
    recipient: 'Alex Rivera <alex.rivera@nexusflow.io>',
    date: '2026-10-08T09:14:00Z',
    subject: 'Quarterly Operations Review - Executive pre-read request',
    preview: 'Alex, could you share the updated roadmap for NexusFlow 3.0 ahead of our call? Our COO wants to understand how the autonomous routing feature impacts our Q4 expansion.',
    sentiment: 'Positive',
    tags: ['Roadmap', 'Nexus 3.0']
  },
  {
    id: 'comm-4',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    type: 'Meeting Notes',
    direction: 'Internal',
    sender: 'Marcus Vance <marcus.vance@nexusflow.io>',
    recipient: 'Alex Rivera, Siddharth Patel',
    date: '2026-09-24T16:00:00Z',
    subject: 'Previous Executive Sync Notes - Acme Corp (Sept 24)',
    preview: 'Recap: Acme committed to expanding from 5 to 14 distribution centers ($18k MRR upsell). Hard requirements: SAML attribute sync must be certified by Oct 15, and 99.9% query latency under 800ms.',
    sentiment: 'Positive',
    tags: ['Previous Notes', 'Contract Milestone']
  },
  {
    id: 'comm-5',
    clientId: 'client-acme-labs',
    clientName: 'Acme Labs Inc',
    type: 'Email',
    direction: 'Inbound',
    sender: 'Dr. Raymond Scott <rscott@acmelabs.bio>',
    recipient: 'Brian O\'Connor <brian.oc@nexusflow.io>',
    date: '2026-10-08T11:45:00Z',
    subject: 'Acme Labs seat expansion proposal review',
    preview: 'Brian, our oncology research team loves the automated ingestion pipeline. We would like to add 80 researcher licenses before November.',
    sentiment: 'Delighted',
    tags: ['Expansion', 'Acme Labs']
  },
  {
    id: 'comm-6',
    clientId: 'client-apex-fintech',
    clientName: 'Apex Global Financial',
    type: 'Email',
    direction: 'Inbound',
    sender: 'Victoria Vance-Reid <v.vancereid@apexfin.com>',
    recipient: 'Aisha Al-Mansoor <aisha.m@nexusflow.io>',
    date: '2026-10-07T16:30:00Z',
    subject: 'Formal notice: SOC2 Key rotation audit findings',
    preview: 'Dear NexusFlow Compliance Team, we have not received the signed attestation report for task APX-COMPL-02 that was due on Oct 2nd. Please provide immediate status.',
    sentiment: 'Escalated',
    tags: ['Compliance', 'Overdue']
  },
  {
    id: 'comm-7',
    clientId: 'client-strata-cloud',
    clientName: 'Strata Cloud Systems',
    type: 'Slack / Message',
    direction: 'Inbound',
    sender: 'Marcus Sterling <sterling@stratacloud.io>',
    recipient: 'David Kim <david.kim@nexusflow.io>',
    date: '2026-10-09T18:10:00Z',
    subject: 'Query latency spike during our staging load test',
    preview: 'Hey David, noticed a 3x p99 latency jump on the query endpoint after your recent v2.8.4 deployment. Are you tracking this internally?',
    sentiment: 'Concerned',
    tags: ['Latency', 'v2.8.4']
  }
];

// Add more communications up to 50
for (let i = 8; i <= 50; i++) {
  const client = clients[i % clients.length];
  const emp = employees[i % employees.length];
  const types = ['Email', 'Slack / Message', 'Call Summary', 'Support Ticket Comment'];
  const sent = ['Positive', 'Neutral', 'Concerned', 'Delighted'][i % 4];
  const day = (1 + (i % 9)).toString().padStart(2, '0');
  communications.push({
    id: `comm-${i}`,
    clientId: client.id,
    clientName: client.name,
    type: types[i % types.length],
    direction: i % 2 === 0 ? 'Inbound' : 'Outbound',
    sender: `${client.primaryContact.name} <${client.primaryContact.email}>`,
    recipient: `${emp.name} <${emp.email}>`,
    date: `2026-10-${day}T${10 + (i % 8)}:${(i * 7) % 60}:00Z`,
    subject: `Discussion regarding ${client.name} ${['milestone progress', 'API throughput', 'quarterly targets', 'feature adoption', 'feedback on recent release'][i % 5]}`,
    preview: `Following up on our recent sync with ${client.name}. Key points discussed include upcoming deliverables, operational health, and workflow enhancements.`,
    sentiment: sent,
    tags: [client.shortName, types[i % types.length]]
  });
}

// 6. Meetings (20)
const meetings = [
  {
    id: 'meet-1',
    title: 'Acme Corp - Q4 Quarterly Business Review & Nexus 3.0 Roadmap',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    startTime: '2026-10-11T10:00:00Z', // TOMORROW at 10 AM
    endTime: '2026-10-11T11:00:00Z',
    status: 'Scheduled',
    location: 'Google Meet / NexusFlow Conference Room A',
    hostId: 'emp-3',
    hostName: 'Marcus Vance',
    participants: [
      { name: 'Sarah Jenkins', email: 's.jenkins@acmeww.com', role: 'VP Operations (Acme)', status: 'Accepted' },
      { name: 'Marcus Vance', email: 'marcus.vance@nexusflow.io', role: 'Senior AE (NexusFlow)', status: 'Accepted' },
      { name: 'Alex Rivera', email: 'alex.rivera@nexusflow.io', role: 'Head of Product (NexusFlow)', status: 'Accepted' },
      { name: 'Elena Rostova', email: 'elena.rostova@nexusflow.io', role: 'VP Engineering (NexusFlow)', status: 'Accepted' },
      { name: 'David Kim', email: 'david.kim@nexusflow.io', role: 'Principal Infra Lead (NexusFlow)', status: 'Tentative' }
    ],
    agenda: [
      { time: '10:00 - 10:10', item: 'Executive Welcome & Partnership Milestones (Marcus Vance)' },
      { time: '10:10 - 10:25', item: 'Root cause analysis & resolution of Query Builder latency (Elena Rostova)' },
      { time: '10:25 - 10:45', item: 'NexusFlow 3.0 Feature Preview: Autonomous Routing & Expansion Roadmap (Alex Rivera)' },
      { time: '10:45 - 11:00', item: 'Commercial terms for 14 logistics distribution centers expansion (Marcus Vance)' }
    ],
    previousMeetingSummary: 'In the Sept 24 review, Acme committed to expanding to 14 distribution centers provided SAML SSO and query reliability are stable under load. Sarah Jenkins expressed high enthusiasm for automated inventory triage.',
    relatedProject: 'Acme Corp Global Distribution Integration',
    openIssuesCount: 2,
    briefingSummary: 'Key client renewal meeting. High urgency to reassure Sarah Jenkins regarding the recent query engine timeout and outline the exact roadmap for Nexus 3.0 roll-out.'
  },
  {
    id: 'meet-2',
    title: 'NexusFlow 3.0 Launch Readiness & Go/No-Go Decision',
    clientId: null,
    clientName: 'Internal Core Leadership',
    startTime: '2026-10-11T14:00:00Z', // TOMORROW at 2 PM
    endTime: '2026-10-11T15:00:00Z',
    status: 'Scheduled',
    location: 'NexusFlow Boardroom & Virtual Live Stream',
    hostId: 'emp-1',
    hostName: 'Alex Rivera',
    participants: [
      { name: 'Alex Rivera', email: 'alex.rivera@nexusflow.io', role: 'Head of Product', status: 'Accepted' },
      { name: 'Elena Rostova', email: 'elena.rostova@nexusflow.io', role: 'VP Engineering', status: 'Accepted' },
      { name: 'Daniel Brooks', email: 'daniel.b@nexusflow.io', role: 'Chief Revenue Officer', status: 'Accepted' },
      { name: 'Aisha Al-Mansoor', email: 'aisha.m@nexusflow.io', role: 'Security & Compliance Lead', status: 'Accepted' },
      { name: 'Chloe Chen', email: 'chloe.chen@nexusflow.io', role: 'Staff Data Scientist', status: 'Accepted' },
      { name: 'Thomas Wright', email: 'thomas.w@nexusflow.io', role: 'Product Marketing Manager', status: 'Accepted' }
    ],
    agenda: [
      { time: '14:00 - 14:15', item: 'Telemetry & Usage Drop Post-Mortem on Query Engine v2 (Elena & Chloe)' },
      { time: '14:15 - 14:35', item: 'Hotfix Deployment v2.8.5 verification and rollback criteria (Elena)' },
      { time: '14:35 - 14:50', item: 'Customer communications, launch timeline revision, and Tier 1 SLA protections (Alex & Daniel)' },
      { time: '14:50 - 15:00', item: 'Final Go / No-Go vote for public launch date (Alex Rivera)' }
    ],
    previousMeetingSummary: 'Last week leadership agreed that v2.8.4 would serve as the release candidate; however, telemetry shows an unexpected query engine degradation requiring hotfix verification.',
    relatedProject: 'NexusFlow 3.0 Platform Launch',
    openIssuesCount: 4,
    briefingSummary: 'Crucial executive checkpoint before announcing general availability of NexusFlow 3.0.'
  },
  {
    id: 'meet-3',
    title: 'Acme Labs Inc - Clinical Trial Data Pipeline Sync',
    clientId: 'client-acme-labs',
    clientName: 'Acme Labs Inc',
    startTime: '2026-10-12T11:00:00Z',
    endTime: '2026-10-12T11:45:00Z',
    status: 'Scheduled',
    location: 'Zoom Conference ID 892-110-332',
    hostId: 'emp-16',
    hostName: 'Brian O\'Connor',
    participants: [
      { name: 'Dr. Raymond Scott', email: 'rscott@acmelabs.bio', role: 'Client Lead', status: 'Accepted' },
      { name: 'Brian O\'Connor', email: 'brian.oc@nexusflow.io', role: 'Solutions Architect', status: 'Accepted' }
    ],
    agenda: [
      { time: '11:00 - 11:20', item: 'Oncology pipeline data validation results' },
      { time: '11:20 - 11:45', item: 'Contract amendment for 80 additional researcher seats' }
    ],
    previousMeetingSummary: 'Initial trial completed with 100% data fidelity.',
    relatedProject: null,
    openIssuesCount: 0,
    briefingSummary: 'High probability upsell expansion meeting.'
  }
];

// Add 17 more meetings
for (let i = 4; i <= 20; i++) {
  const client = clients[i % clients.length];
  const emp = employees[i % employees.length];
  const isPast = i > 10;
  const day = isPast ? (20 + (i % 8)) : (12 + (i % 10));
  const month = isPast ? '09' : '10';
  meetings.push({
    id: `meet-${i}`,
    title: `${client.name} - ${['Technical Architecture Review', 'Executive Checkpoint', 'Bi-weekly Working Session', 'Product Demonstration', 'Success & Adoption Review'][i % 5]}`,
    clientId: client.id,
    clientName: client.name,
    startTime: `2026-${month}-${day.toString().padStart(2, '0')}T${13 + (i % 4)}:00:00Z`,
    endTime: `2026-${month}-${day.toString().padStart(2, '0')}T${14 + (i % 4)}:00:00Z`,
    status: isPast ? 'Completed' : 'Scheduled',
    location: 'Virtual Conference Room',
    hostId: emp.id,
    hostName: emp.name,
    participants: [
      { name: client.primaryContact.name, email: client.primaryContact.email, role: 'Client Stakeholder', status: 'Accepted' },
      { name: emp.name, email: emp.email, role: 'NexusFlow Lead', status: 'Accepted' }
    ],
    agenda: [
      { time: '13:00 - 13:20', item: 'Review of open action items' },
      { time: '13:20 - 13:50', item: 'Technical roadmap updates' }
    ],
    previousMeetingSummary: 'Reviewed ongoing system stability and future release timelines.',
    relatedProject: null,
    openIssuesCount: i % 3,
    briefingSummary: `Routine operational synchronization with ${client.name}.`
  });
}

// 7. Product Usage Data (90 Days)
// Generating 90 continuous days. Noticeable drop on days 84-90 (the current week)
const usageMetrics = [];
const baseDate = new Date('2026-07-13T00:00:00Z');

for (let d = 0; d < 90; d++) {
  const currentDate = new Date(baseDate);
  currentDate.setDate(baseDate.getDate() + d);
  const dateStr = currentDate.toISOString().split('T')[0];

  const dayOfWeek = currentDate.getDay(); // 0 is Sun, 6 is Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekendFactor = isWeekend ? 0.65 : 1.0;

  // Day 84 is approx Oct 4, 2026 when release v2.8.4 dropped
  let isDropWeek = d >= 84;
  let dau = 15200 + Math.sin(d / 4) * 800 + (Math.random() * 400 - 200);

  if (isDropWeek) {
    // Sharp drop of ~32%
    const dropFactor = 0.68 - ((d - 84) * 0.02);
    dau = dau * dropFactor;
  }
  dau = Math.round(dau * weekendFactor);

  const sessions = Math.round(dau * (2.8 + Math.random() * 0.4));
  const avgDurationMinutes = isDropWeek ? +(11.4 - Math.random() * 1.5).toFixed(1) : +(18.6 + Math.random() * 1.2).toFixed(1);
  const errorRatePercent = isDropWeek ? +(3.8 + (d - 84) * 0.6 + Math.random() * 0.3).toFixed(2) : +(0.18 + Math.random() * 0.08).toFixed(2);

  // Features
  const queryBuilderUsers = isDropWeek ? Math.round(dau * 0.22) : Math.round(dau * 0.64);
  const workflowUsers = Math.round(dau * 0.58);
  const dashboardUsers = Math.round(dau * 0.82);
  const aiSummarizerUsers = isDropWeek ? Math.round(dau * 0.25) : Math.round(dau * 0.45);
  const apiEventsMillion = +( (dau * 0.08) * (isDropWeek ? 0.7 : 1.0) ).toFixed(2);

  usageMetrics.push({
    date: dateStr,
    dayIndex: d + 1,
    dailyActiveUsers: dau,
    totalSessions: sessions,
    avgSessionDurationMinutes: avgDurationMinutes,
    errorRatePercent,
    apiEventsMillion,
    featureBreakdown: {
      queryBuilder: queryBuilderUsers,
      workflows: workflowUsers,
      dashboards: dashboardUsers,
      aiSummarizer: aiSummarizerUsers,
      dataConnectors: Math.round(dau * 0.48),
      alertsNotifications: Math.round(dau * 0.35)
    }
  });
}

// 8. Feature Adoption (6+ features)
const featureAdoption = [
  {
    id: 'feat-query-builder',
    name: 'Advanced Query Builder',
    key: 'queryBuilder',
    category: 'Analytics & SQL',
    adoptionRatePercent: 32.4, // DROPPED from 67.8%!
    previousAdoptionRatePercent: 67.8,
    weeklyGrowthPercent: -52.2, // CRITICAL DROP
    satisfactionScore: 54, // Dropped
    monthlyActiveUsers: 8400,
    status: 'Degraded',
    alertMessage: 'Sharp 52% weekly decline following Release v2.8.4 query planning optimizer regression.'
  },
  {
    id: 'feat-ai-summarizer',
    name: 'AI Summary & Executive Briefings',
    key: 'aiSummarizer',
    category: 'AI & Intelligence',
    adoptionRatePercent: 41.2,
    previousAdoptionRatePercent: 44.5,
    weeklyGrowthPercent: -7.4,
    satisfactionScore: 78,
    monthlyActiveUsers: 11200,
    status: 'Impacted',
    alertMessage: 'Dependent on Query Builder outputs; intermittent failures reported by enterprise users.'
  },
  {
    id: 'feat-live-dashboards',
    name: 'Real-Time Interactive Dashboards',
    key: 'dashboards',
    category: 'Visualization',
    adoptionRatePercent: 82.5,
    previousAdoptionRatePercent: 81.0,
    weeklyGrowthPercent: +1.8,
    satisfactionScore: 92,
    monthlyActiveUsers: 22400,
    status: 'Healthy',
    alertMessage: null
  },
  {
    id: 'feat-workflow-automation',
    name: 'Autonomous Trigger Workflows',
    key: 'workflows',
    category: 'Automation',
    adoptionRatePercent: 58.0,
    previousAdoptionRatePercent: 54.2,
    weeklyGrowthPercent: +7.0,
    satisfactionScore: 89,
    monthlyActiveUsers: 15600,
    status: 'Healthy',
    alertMessage: null
  },
  {
    id: 'feat-connectors',
    name: 'Universal Cloud Data Connectors',
    key: 'dataConnectors',
    category: 'Data Pipeline',
    adoptionRatePercent: 49.3,
    previousAdoptionRatePercent: 48.1,
    weeklyGrowthPercent: +2.5,
    satisfactionScore: 86,
    monthlyActiveUsers: 13300,
    status: 'Healthy',
    alertMessage: null
  },
  {
    id: 'feat-alerts',
    name: 'Anomaly Detection & Real-time Alerts',
    key: 'alertsNotifications',
    category: 'Monitoring',
    adoptionRatePercent: 37.1,
    previousAdoptionRatePercent: 36.5,
    weeklyGrowthPercent: +1.6,
    satisfactionScore: 88,
    monthlyActiveUsers: 9900,
    status: 'Healthy',
    alertMessage: null
  }
];

// 9. Product Releases (15)
const releases = [
  {
    version: 'v2.8.4',
    title: 'Query Engine v2 Migration & Schema Optimizer',
    deployedAt: '2026-10-04T18:30:00Z', // 6 days ago!
    deployedBy: 'Elena Rostova (VP Engineering)',
    type: 'Major Subsystem Update',
    impactLevel: 'High Risk',
    status: 'Regression Identified',
    affectedFeatures: ['Advanced Query Builder', 'AI Summary & Executive Briefings'],
    changelog: [
      'Migrated SQL planner to cost-based optimizer v2',
      'Introduced speculative query cache for multi-tenant shards',
      'Refactored Okta SSO session claims validation',
      'Known issue: Complex aggregations exceeding 4 joins suffer memory threshold timeouts'
    ],
    rollbackStatus: 'Rollback candidate prepared (v2.8.5 hotfix pending QA validation)'
  },
  {
    version: 'v2.8.3',
    title: 'Webhook Batch Streaming & Retry Backoff',
    deployedAt: '2026-09-28T14:15:00Z',
    deployedBy: 'Kevin Zhang',
    type: 'Feature Update',
    impactLevel: 'Medium',
    status: 'Stable',
    affectedFeatures: ['Universal Cloud Data Connectors'],
    changelog: ['Exponential backoff up to 7 retry attempts', 'Dead letter queue inspection API']
  },
  {
    version: 'v2.8.2',
    title: 'Adaptive Dashboard Tile Drag-and-Drop Fixes',
    deployedAt: '2026-09-21T11:00:00Z',
    deployedBy: 'Julian Thorne',
    type: 'UI Patch',
    impactLevel: 'Low',
    status: 'Stable',
    affectedFeatures: ['Real-Time Interactive Dashboards'],
    changelog: ['Smooth layout reflow during window resize', 'Keyboard navigation accessibility improvements']
  },
  {
    version: 'v2.8.1',
    title: 'SOC2 Audit Log Streaming to S3/GCS',
    deployedAt: '2026-09-15T09:40:00Z',
    deployedBy: 'Aisha Al-Mansoor',
    type: 'Security Enhancement',
    impactLevel: 'Medium',
    status: 'Stable',
    affectedFeatures: ['Compliance & Security'],
    changelog: ['Encrypted JSON log stream delivery', 'SHA-256 integrity verification receipts']
  },
  {
    version: 'v2.8.0',
    title: 'Autonomous Trigger Engine GA',
    deployedAt: '2026-09-05T16:00:00Z',
    deployedBy: 'Alex Rivera',
    type: 'Major Minor Release',
    impactLevel: 'High',
    status: 'Stable',
    affectedFeatures: ['Autonomous Trigger Workflows'],
    changelog: ['Visual rule builder for event conditional branching', 'Webhook trigger destinations']
  }
];

// Add releases 6 to 15
for (let i = 6; i <= 15; i++) {
  const day = (10 + i).toString().padStart(2, '0');
  releases.push({
    version: `v2.7.${15 - i}`,
    title: `Infrastructure & Performance Optimization Iteration #${i}`,
    deployedAt: `2026-08-${day}T12:00:00Z`,
    deployedBy: employees[i % employees.length].name,
    type: 'Maintenance & Reliability',
    impactLevel: 'Low',
    status: 'Stable',
    affectedFeatures: ['Real-Time Interactive Dashboards'],
    changelog: [`Optimized index compaction on telemetry store`, `Memory cache tuning for cold starts`]
  });
}

// 10. Support Incidents (25)
const supportIncidents = [
  {
    id: 'inc-1042',
    ticketNumber: 'INC-1042',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    title: 'Query Builder times out on warehouse multi-facility inventory aggregation',
    priority: 'Critical',
    status: 'Investigating',
    createdAt: '2026-10-06T10:14:00Z',
    resolvedAt: null,
    featureImpacted: 'Advanced Query Builder',
    reporter: 'Sarah Jenkins',
    assigneeName: 'Elena Rostova',
    description: 'Acme operations team cannot load multi-hub supply chain report. Query fails after 30s timeout with Error 504 Gateway Timeout.'
  },
  {
    id: 'inc-1045',
    ticketNumber: 'INC-1045',
    clientId: 'client-strata-cloud',
    clientName: 'Strata Cloud Systems',
    title: 'P99 SQL query latency exceeds 12,000ms after v2.8.4 deployment',
    priority: 'Critical',
    status: 'Investigating',
    createdAt: '2026-10-06T14:30:00Z',
    resolvedAt: null,
    featureImpacted: 'Advanced Query Builder',
    reporter: 'Marcus Sterling',
    assigneeName: 'Kevin Zhang',
    description: 'Continuous alert triggering on client monitoring dash. Query planner generating unindexed full-table scans.'
  },
  {
    id: 'inc-1048',
    ticketNumber: 'INC-1048',
    clientId: 'client-apex-fintech',
    clientName: 'Apex Global Financial',
    title: 'Audit report generation fails with Out Of Memory (OOM) error',
    priority: 'Critical',
    status: 'Investigating',
    createdAt: '2026-10-07T08:15:00Z',
    resolvedAt: null,
    featureImpacted: 'Advanced Query Builder',
    reporter: 'Victoria Vance-Reid',
    assigneeName: 'Elena Rostova',
    description: 'Quarterly compliance query terminates unexpectedly. Blocked on regulatory filing submission.'
  },
  {
    id: 'inc-1050',
    ticketNumber: 'INC-1050',
    clientId: 'client-omni-retail',
    clientName: 'Omni Retail Group',
    title: 'Product catalog export hangs indefinitely at 94% progress',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-10-07T11:20:00Z',
    resolvedAt: null,
    featureImpacted: 'Advanced Query Builder',
    reporter: 'Kenneth Barnes',
    assigneeName: 'David Kim',
    description: 'Batch export of SKU metrics fails to flush buffer to client browser.'
  },
  {
    id: 'inc-1055',
    ticketNumber: 'INC-1055',
    clientId: 'client-acme-corp',
    clientName: 'Acme Corp',
    title: 'Okta SAML SSO attribute synchronization latency',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-10-05T09:00:00Z',
    resolvedAt: null,
    featureImpacted: 'Identity & Authentication',
    reporter: 'Sarah Jenkins',
    assigneeName: 'David Kim',
    description: 'New warehouse shift managers experiencing 25-minute delay before role permissions propagate.'
  },
  {
    id: 'inc-1058',
    ticketNumber: 'INC-1058',
    clientId: 'client-hyperion-energy',
    clientName: 'Hyperion Renewable Dynamics',
    title: 'Telemetry stream jitter on EU-Central edge node 4',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-10-02T13:00:00Z',
    resolvedAt: '2026-10-03T09:15:00Z',
    featureImpacted: 'Universal Cloud Data Connectors',
    reporter: 'Erik Vestergaard',
    assigneeName: 'Lucas Meyer',
    description: 'Minor packet drop resolved by re-routing BGP gateway.'
  }
];

// Add up to 25 support incidents
for (let i = 7; i <= 25; i++) {
  const client = clients[i % clients.length];
  const isRecent = i <= 15;
  const prio = i % 4 === 0 ? 'Critical' : i % 2 === 0 ? 'High' : 'Medium';
  const day = isRecent ? (4 + (i % 6)) : (10 + (i % 18));
  const month = isRecent ? '10' : '09';
  supportIncidents.push({
    id: `inc-10${60 + i}`,
    ticketNumber: `INC-10${60 + i}`,
    clientId: client.id,
    clientName: client.name,
    title: `${client.shortName}: ${['Scheduled report delivery delayed', 'Webhook signature mismatch on SSL renewal', 'Dashboard filter reset on tab switch', 'CSV export column header truncation', 'User permission role propagation delay'][i % 5]}`,
    priority: prio,
    status: isRecent ? 'In Progress' : 'Resolved',
    createdAt: `2026-${month}-${day.toString().padStart(2, '0')}T${10 + (i % 6)}:30:00Z`,
    resolvedAt: isRecent ? null : `2026-09-${(day + 1).toString().padStart(2, '0')}T18:00:00Z`,
    featureImpacted: i % 3 === 0 ? 'Advanced Query Builder' : 'Real-Time Interactive Dashboards',
    reporter: client.primaryContact.name,
    assigneeName: employees[i % employees.length].name,
    description: `Investigation ticket logged for ${client.name} relating to system interaction.`
  });
}

// 11. Availability Records (15) - For scheduling demo
const availability = [
  {
    employeeId: 'emp-1',
    employeeName: 'Alex Rivera',
    date: '2026-10-11', // Tomorrow
    timeSlots: [
      { time: '09:00 - 10:00', available: true },
      { time: '10:00 - 11:00', available: false, meeting: 'Acme Corp QBR' },
      { time: '11:00 - 12:00', available: true },
      { time: '13:00 - 14:00', available: true },
      { time: '14:00 - 15:00', available: false, meeting: 'Nexus 3.0 Launch Check' },
      { time: '15:00 - 16:00', available: true },
      { time: '16:00 - 17:00', available: true }
    ]
  },
  {
    employeeId: 'emp-2',
    employeeName: 'Elena Rostova',
    date: '2026-10-11',
    timeSlots: [
      { time: '09:00 - 10:00', available: false, meeting: 'Engineering Standup' },
      { time: '10:00 - 11:00', available: false, meeting: 'Acme Corp QBR' },
      { time: '11:00 - 12:00', available: true },
      { time: '13:00 - 14:00', available: true },
      { time: '14:00 - 15:00', available: false, meeting: 'Nexus 3.0 Launch Check' },
      { time: '15:00 - 16:00', available: true },
      { time: '16:00 - 17:00', available: true }
    ]
  },
  {
    employeeId: 'emp-3',
    employeeName: 'Marcus Vance',
    date: '2026-10-11',
    timeSlots: [
      { time: '09:00 - 10:00', available: true },
      { time: '10:00 - 11:00', available: false, meeting: 'Acme Corp QBR' },
      { time: '11:00 - 12:00', available: true },
      { time: '13:00 - 14:00', available: true },
      { time: '14:00 - 15:00', available: true },
      { time: '15:00 - 16:00', available: false, meeting: 'Pipeline Review' },
      { time: '16:00 - 17:00', available: true }
    ]
  },
  {
    employeeId: 'emp-4',
    employeeName: 'Chloe Chen',
    date: '2026-10-11',
    timeSlots: [
      { time: '09:00 - 10:00', available: true },
      { time: '10:00 - 11:00', available: true },
      { time: '11:00 - 12:00', available: false, meeting: 'Model Evaluation' },
      { time: '13:00 - 14:00', available: true },
      { time: '14:00 - 15:00', available: false, meeting: 'Nexus 3.0 Launch Check' },
      { time: '15:00 - 16:00', available: true },
      { time: '16:00 - 17:00', available: true }
    ]
  },
  {
    employeeId: 'emp-5',
    employeeName: 'David Kim',
    date: '2026-10-11',
    timeSlots: [
      { time: '09:00 - 10:00', available: true },
      { time: '10:00 - 11:00', available: true },
      { time: '11:00 - 12:00', available: true },
      { time: '13:00 - 14:00', available: false, meeting: 'Database Shard Maint' },
      { time: '14:00 - 15:00', available: true },
      { time: '15:00 - 16:00', available: true },
      { time: '16:00 - 17:00', available: true }
    ]
  }
];

// Add records 6 to 15
for (let i = 6; i <= 15; i++) {
  const emp = employees[i % employees.length];
  availability.push({
    employeeId: emp.id,
    employeeName: emp.name,
    date: '2026-10-11',
    timeSlots: [
      { time: '09:00 - 10:00', available: i % 2 !== 0 },
      { time: '10:00 - 11:00', available: true },
      { time: '11:00 - 12:00', available: i % 3 !== 0 },
      { time: '13:00 - 14:00', available: true },
      { time: '14:00 - 15:00', available: true },
      { time: '15:00 - 16:00', available: i % 2 === 0 },
      { time: '16:00 - 17:00', available: true }
    ]
  });
}

// 12. Recent Business Activities (20)
const activities = [
  { id: 'act-1', timestamp: '2026-10-10T19:40:00Z', type: 'incident_created', description: 'New critical incident INC-1055 created for Acme Corp (Okta SAML SSO delay)', actor: 'Sarah Jenkins', entityType: 'incident', entityId: 'inc-1055' },
  { id: 'act-2', timestamp: '2026-10-10T17:15:00Z', type: 'task_updated', description: 'Elena Rostova set status of task #task-11 to In Progress (Query Engine v2 memory leak)', actor: 'Elena Rostova', entityType: 'task', entityId: 'task-11' },
  { id: 'act-3', timestamp: '2026-10-10T15:20:00Z', type: 'meeting_scheduled', description: 'Marcus Vance confirmed Acme Corp Q4 Quarterly Review for tomorrow at 10:00 AM', actor: 'Marcus Vance', entityType: 'meeting', entityId: 'meet-1' },
  { id: 'act-4', timestamp: '2026-10-10T14:00:00Z', type: 'alert_triggered', description: 'Product Telemetry Alert: Daily Active Users dropped below 11,000 threshold', actor: 'System Monitor', entityType: 'analytics', entityId: 'alert-dau-drop' },
  { id: 'act-5', timestamp: '2026-10-10T11:30:00Z', type: 'task_blocked', description: 'Task #task-8 marked blocked by pending VPC peering transit gateway completion', actor: 'Aisha Al-Mansoor', entityType: 'task', entityId: 'task-8' },
  { id: 'act-6', timestamp: '2026-10-10T09:45:00Z', type: 'release_deployed', description: 'Hotfix branch v2.8.5-rc1 merged into staging by Kevin Zhang', actor: 'Kevin Zhang', entityType: 'release', entityId: 'v2.8.5-rc1' }
];

for (let i = 7; i <= 20; i++) {
  const day = (10 - Math.floor(i / 3)).toString().padStart(2, '0');
  activities.push({
    id: `act-${i}`,
    timestamp: `2026-10-${day}T${10 + (i % 10)}:00:00Z`,
    type: ['task_completed', 'comment_added', 'client_updated', 'milestone_reached'][i % 4],
    description: `Activity #${i}: Operational progress logged by ${employees[i % employees.length].name} regarding ${projects[i % projects.length].name}`,
    actor: employees[i % employees.length].name,
    entityType: 'project',
    entityId: projects[i % projects.length].id
  });
}

// 13. Actionable Recommendations (15)
const recommendations = [
  {
    id: 'rec-1',
    category: 'Client Escalation',
    title: 'Review Acme Corp Query Timeout before tomorrow\'s 10 AM sync',
    description: 'Sarah Jenkins raised INC-1042 yesterday. Review Elena\'s hotfix PR and prepare a 3-point remediation summary for the executive deck.',
    urgency: 'Immediate',
    suggestedAction: 'Open Meeting Prep Workspace',
    actionId: 'prep_acme_meeting'
  },
  {
    id: 'rec-2',
    category: 'Product Health',
    title: 'Validate v2.8.5 hotfix impact on Query Builder adoption',
    description: 'Daily active users declined 32% since v2.8.4. Telemetry shows query error rate peaked at 4.4%. Deploying hotfix is estimated to restore 4,800 DAU.',
    urgency: 'Immediate',
    suggestedAction: 'Inspect Usage Telemetry',
    actionId: 'investigate_usage_drop'
  },
  {
    id: 'rec-3',
    category: 'Project Delivery',
    title: 'Triage 4 Critical Overdue Tasks across Acme & Apex deliverables',
    description: 'Tasks #task-1 (SAML mapping) and #task-6 (SOC2 key rotation) are over 5 days past due and directly blocking contract milestones.',
    urgency: 'High',
    suggestedAction: 'View Overdue Task Board',
    actionId: 'view_overdue_tasks'
  },
  {
    id: 'rec-4',
    category: 'Meeting Scheduling',
    title: 'Schedule Go/No-Go Executive Alignment Meeting for Nexus 3.0',
    description: 'Launch target is Oct 25. Core leadership availability aligns tomorrow at 2:00 PM for the decision vote.',
    urgency: 'High',
    suggestedAction: 'Launch Scheduler',
    actionId: 'schedule_launch_meeting'
  },
  {
    id: 'rec-5',
    category: 'Customer Expansion',
    title: 'Send 80-seat expansion contract amendment to Acme Labs',
    description: 'Dr. Raymond Scott requested contract terms. Expected to add $3,200 MRR without engineering overhead.',
    urgency: 'Medium',
    suggestedAction: 'Review Client Profile',
    actionId: 'view_acme_labs'
  }
];

for (let i = 6; i <= 15; i++) {
  recommendations.push({
    id: `rec-${i}`,
    category: ['Infrastructure', 'Compliance', 'Team Capacity', 'Account Health'][i % 4],
    title: `Operational recommendation #${i}: Maintain cadence on ${projects[i % projects.length].name}`,
    description: `Automated health monitor suggests addressing upcoming dependencies in ${projects[i % projects.length].name} to preserve quarterly velocity.`,
    urgency: i % 3 === 0 ? 'High' : 'Low',
    suggestedAction: 'Inspect Project Detail',
    actionId: `view_project_${projects[i % projects.length].id}`
  });
}

// Write all datasets to JSON files
const datasets = {
  'clients.json': clients,
  'communications.json': communications,
  'meetings.json': meetings,
  'usage-metrics.json': usageMetrics,
  'feature-adoption.json': featureAdoption,
  'releases.json': releases,
  'support-incidents.json': supportIncidents,
  'projects.json': projects,
  'tasks.json': allTasks,
  'employees.json': employees,
  'availability.json': availability,
  'activities.json': activities,
  'recommendations.json': recommendations
};

for (const [filename, data] of Object.entries(datasets)) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Wrote ${filename} (${Array.isArray(data) ? data.length + ' records' : 'object'}) to ${filePath}`);
}

console.log('\nAll 13 interconnected datasets generated successfully in server/data/');
