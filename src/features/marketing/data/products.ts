export type Product = {
  code: 'WYMASSIST' | 'WYMINSIGHT' | 'WYMFLOW';
  slug: string;
  name: string;
  role: string;
  status: 'available' | 'planned';
  tagline: string;
  summary: string;
  pageIntro: string;
  capabilities: { title: string; body: string }[];
  roadmap?: string[];
};

export const PRODUCTS: Product[] = [
  {
    code: 'WYMASSIST',
    slug: 'wymassist',
    name: 'WymAssist AI',
    role: 'Customer support & communication',
    status: 'available',
    tagline: 'Answers your visitors can trust, because they come from your own documents.',
    summary:
      'An organizational AI assistant that answers questions on your website using your approved knowledge, captures leads, and hands conversations to your staff when a person should take over.',
    pageIntro:
      'WymAssist sits on your website and answers visitor questions with the same information your team would use — your policies, guides, and reference documents. It captures the enquiries worth following up, and when a conversation needs a person, it hands over with the full history intact.',
    capabilities: [
      {
        title: 'Grounded answers',
        body: 'Responses are generated from your approved knowledge documents. The assistant works from what your organization has actually decided, not from the open internet.',
      },
      {
        title: 'Website conversations',
        body: 'Visitors chat without an account. Each conversation is stored with its full history, so context is never lost between visits or between the AI and your staff.',
      },
      {
        title: 'Lead capture',
        body: 'When visitors share contact details, a lead is created with the conversation attached. Your team follows up knowing exactly what was asked.',
      },
      {
        title: 'Human handoff',
        body: 'A visitor can ask for a person at any point. Staff claim the conversation, reply inside it, and resolve it — the visitor never repeats themselves.',
      },
      {
        title: 'Control and audit',
        body: 'You choose which documents are approved, which sites may embed the chat, and who on your team can see and act on conversations. Every important action is audited.',
      },
    ],
  },
  {
    code: 'WYMINSIGHT',
    slug: 'wyminsight',
    name: 'WymInsight AI',
    role: 'Business intelligence & analytics',
    status: 'planned',
    tagline: 'Analytics built on the data your organization already produces.',
    summary:
      'A planned product for turning organizational data into reports and answers: dataset uploads, AI-assisted analysis, and dashboards on the same platform.',
    pageIntro:
      'WymInsight is the analytics direction of the WymNet platform. It is not yet generally available — the design centers on letting organizations upload datasets and get profiling, trends, and report-ready output without a separate BI stack.',
    capabilities: [
      {
        title: 'Dataset ingestion',
        body: 'Planned support for uploading Excel and CSV data with validation, metadata, and versioning.',
      },
      {
        title: 'AI-assisted analysis',
        body: 'Planned profiling, trend and pattern detection, and forecasting over your own datasets.',
      },
      {
        title: 'Reporting',
        body: 'Planned dashboards, executive summaries, and downloadable reports built on the same organization, permission, and audit foundation as WymAssist.',
      },
    ],
    roadmap: [
      'Dataset upload and validation',
      'Data profiling and KPI generation',
      'Trend, pattern, and opportunity detection',
      'Dashboard and report APIs',
    ],
  },
  {
    code: 'WYMFLOW',
    slug: 'wymflow',
    name: 'WymFlow AI',
    role: 'Business process automation',
    status: 'planned',
    tagline: 'Forms, approvals, and workflows that run inside your organization.',
    summary:
      'A planned product for structured intake and repeatable processes: configurable forms, approval steps, task assignment, and workflow tracking.',
    pageIntro:
      'WymFlow is the automation direction of the WymNet platform. It is not yet generally available — the design centers on replacing ad-hoc email-and-spreadsheet processes with defined workflows that carry their own history.',
    capabilities: [
      {
        title: 'Configurable forms',
        body: 'Planned form definitions with validated submissions, owned by your organization.',
      },
      {
        title: 'Approval workflows',
        body: 'Planned workflow states, approval steps, and task assignment with a full status history.',
      },
      {
        title: 'Automation',
        body: 'Planned reminders, notifications, and trigger-based actions so routine process steps happen without manual chasing.',
      },
    ],
    roadmap: [
      'Form definitions and submissions',
      'Workflow states and approval steps',
      'Task assignment and tracking',
      'Reminders, notifications, and triggers',
    ],
  },
];
