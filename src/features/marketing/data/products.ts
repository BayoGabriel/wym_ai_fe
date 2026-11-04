export type ProductSectionItem = { title: string; body: string };

export type ProductDetail = {
  seoTitle: string;
  seoDescription: string;
  problem: {
    title: string;
    lede: string;
    points: ProductSectionItem[];
  };
  solution: {
    title: string;
    paragraphs: string[];
  };
  howItWorks: {
    title: string;
    lede?: string;
    steps: ProductSectionItem[];
  };
  useCases: {
    title: string;
    lede?: string;
    items: { industry: string; body: string }[];
  };
  benefits: {
    title: string;
    lede?: string;
    items: ProductSectionItem[];
  };
  specs: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
  cta: { title: string; body: string };
};

export type Product = {
  code: 'WYMASSIST' | 'WYMINSIGHT' | 'WYMFLOW';
  slug: string;
  name: string;
  role: string;
  status: 'available' | 'planned';
  tagline: string;
  summary: string;
  pageIntro: string;
  capabilities: ProductSectionItem[];
  detail: ProductDetail;
  roadmap?: string[];
};

export const PRODUCTS: Product[] = [
  {
    code: 'WYMASSIST',
    slug: 'wymassist',
    name: 'WymAssist AI',
    role: 'Customer support & communication',
    status: 'available',
    tagline: 'Every customer question answered in seconds — with answers your business actually approves of.',
    summary:
      'An AI customer support assistant that answers enquiries on your website and messaging channels from your approved knowledge, captures leads and appointment requests, and hands conversations to your staff when a person is needed.',
    pageIntro:
      'WymAssist AI lives on your website — and on WhatsApp, Messenger, Instagram, Telegram, or email when you connect them. It answers routine questions instantly from the documents and entries your team has approved, captures interested visitors as structured leads, takes appointment requests, and passes conversations to a person with the full history attached.',
    capabilities: [
      {
        title: 'Answers only from your approved knowledge',
        body: 'Upload policies, guides, price lists, and FAQs as text or PDF. WymAssist indexes them and answers strictly from what you have published — and says so plainly when a question falls outside it.',
      },
      {
        title: 'A branded widget on any website',
        body: 'One script tag embeds a chat window styled with your colors, logo, and greeting. Visitor sessions survive page reloads, and you control exactly which sites may run it.',
      },
      {
        title: 'Lead capture with real context',
        body: 'Define the intake fields that matter to your business — course of interest, service needed, company size. When a visitor shares details, a lead is created with the full conversation attached.',
      },
      {
        title: 'Appointment requests, handled in-chat',
        body: 'Visitors request appointments without leaving the conversation. Requests land in a staff-managed queue where they are confirmed, rescheduled, or closed.',
      },
      {
        title: 'Seamless human handoff',
        body: 'A visitor can ask for a person at any point. Staff claim the conversation, reply inside it, and resolve it — the assistant steps back automatically while a human is in charge.',
      },
      {
        title: 'Every conversation, one dashboard',
        body: 'Website chats plus WhatsApp, Messenger, Instagram, Telegram, and email enquiries flow into a single inbox — with histories, statuses, staff notes, and enquiry reports exported to CSV.',
      },
    ],
    detail: {
      seoTitle: 'WymAssist AI — AI Customer Support for Your Website',
      seoDescription:
        'WymAssist AI answers customer enquiries on your website and messaging channels using your approved knowledge — capturing leads, handling appointment requests, and escalating to your team when a person is needed.',
      problem: {
        title: 'Routine enquiries are quietly costing you customers',
        lede: 'Most organizations still answer every visitor question by hand — or worse, don’t answer at all.',
        points: [
          {
            title: 'Repetitive questions eat staff time',
            body: 'Pricing, opening hours, policies, availability — the same questions arrive every day, and someone has to stop real work to retype the same answers.',
          },
          {
            title: 'Enquiries arrive when nobody is working',
            body: 'Visitors ask questions in the evening, on weekends, and across time zones. By the time anyone replies, the moment — and often the customer — is gone.',
          },
          {
            title: 'Slow replies send people elsewhere',
            body: 'A visitor who can’t get a quick answer doesn’t wait. They find a competitor who responds faster.',
          },
          {
            title: 'Interested visitors leave no trace',
            body: 'People browse, get a partial answer, and leave — no name, no contact details, no way for your team to follow up.',
          },
          {
            title: 'Nothing is tracked',
            body: 'Enquiries scattered across inboxes and personal phones can’t be assigned, measured, or improved.',
          },
        ],
      },
      solution: {
        title: 'Support that answers instantly — and knows when to call a person',
        paragraphs: [
          'WymAssist AI sits inside a branded chat widget on your website — and on the messaging channels your customers already use, once you connect them. When a visitor asks a question, it answers immediately using only the content your team has approved: your policies, prices, product details, and frequently asked questions.',
          'When a conversation needs judgment, the visitor can request a person — or WymAssist offers one. The entire thread moves to your team’s handoff queue, where staff reply in the same conversation. Nothing is lost, nobody repeats themselves, and every enquiry ends somewhere useful.',
        ],
      },
      howItWorks: {
        title: 'From your documents to a working assistant in four steps',
        steps: [
          {
            title: 'Load your business information',
            body: 'Upload the documents and entries your team already trusts — policies, catalogues, FAQs, service descriptions — as text or PDF. Only approved content is ever used to answer.',
          },
          {
            title: 'Configure the assistant',
            body: 'Set the greeting, branding, and lead intake fields. Choose which websites may embed the widget and how the assistant should offer human help.',
          },
          {
            title: 'Put it where your customers are',
            body: 'Paste one script tag into your website. Connect channels like WhatsApp, Messenger, Instagram, Telegram, or email when you’re ready.',
          },
          {
            title: 'Manage everything from the dashboard',
            body: 'Your team watches conversations, works the handoff queue, follows up leads, confirms appointments, and reviews enquiry reports — all in one place.',
          },
        ],
      },
      useCases: {
        title: 'Where WymAssist earns its keep',
        lede: 'The same product adapts to very different front desks.',
        items: [
          {
            industry: 'Retail & e-commerce',
            body: 'Answer product, stock, delivery, and returns questions instantly — and capture interested shoppers as leads before they leave for a competitor.',
          },
          {
            industry: 'Education',
            body: 'Handle admissions enquiries, course details, fees, and application deadlines. Prospective students become structured leads your team can follow up properly.',
          },
          {
            industry: 'Healthcare administration',
            body: 'Answer questions about services, locations, and opening hours, and take appointment requests — without tying up front-desk staff.',
          },
          {
            industry: 'NGOs & development organizations',
            body: 'Give beneficiaries, donors, and volunteers consistent answers about programs, eligibility, and how to get involved — even with a small team.',
          },
          {
            industry: 'Professional services',
            body: 'Let prospective clients ask about services, fees, and availability — then capture their details or appointment request without phone tag.',
          },
          {
            industry: 'Growing SMBs',
            body: 'Provide the responsiveness customers expect from larger companies — without hiring a dedicated support desk.',
          },
        ],
      },
      benefits: {
        title: 'What changes when enquiries answer themselves',
        items: [
          {
            title: 'Routine workload drops',
            body: 'Staff stop retyping the same answers and spend their time on conversations that actually need judgment.',
          },
          {
            title: 'Customers get instant, consistent answers',
            body: 'Every visitor hears the same approved information — at 2pm or 2am, weekday or weekend.',
          },
          {
            title: 'Fewer leads slip away',
            body: 'Interested visitors identify themselves inside the conversation, with the full context attached for your team.',
          },
          {
            title: 'Enquiries become measurable',
            body: 'Conversation volume, lead statuses, handoffs, and appointment requests are tracked and exportable — you can finally see what customers ask.',
          },
          {
            title: 'Coverage without headcount',
            body: 'The assistant answers around the clock; your team handles the conversations that matter most.',
          },
        ],
      },
      specs: [
        {
          label: 'Channels',
          value: 'Embeddable website widget, plus WhatsApp, Messenger, Instagram, Telegram & email when connected',
        },
        {
          label: 'Knowledge',
          value: 'Text entries and PDF documents, processed into searchable chunks',
        },
        {
          label: 'Escalation',
          value: 'Human handoff queue with staff replies, assignment, and resolution',
        },
        {
          label: 'Data ownership',
          value: 'Per-organization isolation, audit events, usage records',
        },
      ],
      faqs: [
        {
          q: 'Does WymAssist invent answers when it doesn’t know something?',
          a: 'No. It answers only from documents and entries your team has approved. When a question falls outside your knowledge base, it says so and can route the visitor to a human instead of guessing.',
        },
        {
          q: 'Do our customers need an account to chat?',
          a: 'No. Visitors start a session with one click — no sign-up, no download. Sessions persist across page reloads, so they can pick up where they left off.',
        },
        {
          q: 'Which channels does it work on?',
          a: 'The embeddable widget works on any website you approve. WymAssist also receives enquiries through WhatsApp, Messenger, Instagram, Telegram, and inbound email once those channels are connected to your organization.',
        },
        {
          q: 'What happens when a visitor needs a real person?',
          a: 'They ask for one — or WymAssist offers. The conversation enters your team’s handoff queue with the full thread intact; a staff member replies in place and marks it resolved.',
        },
        {
          q: 'Can we control which websites use our widget?',
          a: 'Yes. You define the allowed origins in your settings, and the widget only serves sessions from sites you have approved.',
        },
        {
          q: 'Is our customer data isolated from other organizations?',
          a: 'Completely. Conversations, leads, knowledge, and settings live inside your own organization boundary, with role-based access for your staff.',
        },
      ],
      cta: {
        title: 'Every unanswered enquiry is a decision your customer made without you.',
        body: 'Put WymAssist on your website and give every visitor a fast, accurate answer — or a path straight to your team.',
      },
    },
    roadmap: ['Live calendar availability sync'],
  },
  {
    code: 'WYMINSIGHT',
    slug: 'wyminsight',
    name: 'WymInsight AI',
    role: 'Business intelligence & analytics',
    status: 'available',
    tagline: 'The answers are already in your spreadsheets. WymInsight reads them for you.',
    summary:
      'Upload CSV or Excel data and get automatic column profiling, KPIs, trend detection, forecasts, and a plain-language executive summary — without a separate BI stack.',
    pageIntro:
      'WymInsight AI turns the business data you already collect into analysis you can act on. Upload a CSV or Excel file and get column-by-column profiling, key performance indicators, trend detection with forecasts, and a plain-language summary written for decision-makers — no BI stack and no data team required.',
    capabilities: [
      {
        title: 'Upload data as it exists',
        body: 'CSV and Excel (.xlsx) files up to 8 MB — export from your POS, CRM, or records system and upload as-is. Columns are parsed and typed automatically.',
      },
      {
        title: 'Automatic column profiling',
        body: 'Every field is classified — number, date, boolean, or text — with distinct counts, ranges, averages, and the values that dominate each column.',
      },
      {
        title: 'Trends and forecasts',
        body: 'When your data includes dates, numeric measures are aggregated by period, assigned a direction and growth rate, and projected forward three periods — shown as charts inside the report.',
      },
      {
        title: 'Executive summaries in plain language',
        body: 'Each report opens with an AI-written summary that tells a manager what the data shows — key movements and direction — without forcing them to read tables.',
      },
      {
        title: 'Reports you can share',
        body: 'Reports live in your dashboard with KPI cards, trend charts, and column profiles — and download to CSV for distribution or archiving.',
      },
      {
        title: 'Your data stays inside your boundary',
        body: 'Datasets and reports are isolated per organization and governed by the same role-based permissions as everything else on the platform.',
      },
    ],
    detail: {
      seoTitle: 'WymInsight AI — Business Intelligence & Data Analytics',
      seoDescription:
        'Turn your spreadsheets into decisions. WymInsight AI analyzes CSV and Excel uploads — column profiling, KPIs, trend detection, forecasts, and plain-language executive summaries.',
      problem: {
        title: 'Your data knows things you don’t',
        lede: 'Most organizations sit on months of sales figures, program numbers, and operational records — and make decisions on instinct anyway.',
        points: [
          {
            title: 'Spreadsheets don’t explain themselves',
            body: 'Rows and columns accumulate, but turning them into a story about performance takes hours of manual work nobody has time for.',
          },
          {
            title: 'Real analysis needs specialists',
            body: 'Traditional BI tools mean licences, integrations, and someone who knows how to use them — out of reach for many teams.',
          },
          {
            title: 'Trends surface too late',
            body: 'A declining product line or a growing program often becomes obvious only in hindsight — after the quarter closes.',
          },
          {
            title: 'Reports take days to assemble',
            body: 'Management summaries get written by hand, from memory, under deadline — instead of generated from the numbers.',
          },
        ],
      },
      solution: {
        title: 'From spreadsheet to decision in one upload',
        paragraphs: [
          'WymInsight accepts CSV and Excel exports straight from the tools you already use — sales records, program logs, operational trackers. It profiles every column automatically: what’s numeric, what’s a date, what’s categorical, which values dominate, and where data is missing.',
          'Then it goes further. Measures tracked over time get a trend direction, a growth rate, and a forecast for the next three periods. An AI-written executive summary explains what the data shows in plain language — and every report downloads to CSV for sharing.',
        ],
      },
      howItWorks: {
        title: 'Four steps from raw data to a readable report',
        steps: [
          {
            title: 'Upload a dataset',
            body: 'Export a CSV or Excel file from wherever your data lives — sales, programs, operations — and upload it with a name.',
          },
          {
            title: 'WymInsight analyzes it automatically',
            body: 'Columns are profiled, KPIs computed, and date-based trends detected with a three-period forecast.',
          },
          {
            title: 'Read the report',
            body: 'A plain-language executive summary, KPI cards, trend charts, and a full column breakdown — all in your dashboard.',
          },
          {
            title: 'Share and decide',
            body: 'Download the report as CSV, present the summary to leadership, and base the next decision on evidence.',
          },
        ],
      },
      useCases: {
        title: 'What organizations analyze with WymInsight',
        lede: 'Any spreadsheet with a story in it.',
        items: [
          {
            industry: 'Sales & revenue analysis',
            body: 'Upload monthly sales exports and see which measures are growing, which are flat, and where the next periods are heading.',
          },
          {
            industry: 'NGO program reporting',
            body: 'Turn beneficiary counts, distribution logs, and activity records into trends and summaries your board and funders can read.',
          },
          {
            industry: 'Healthcare operations',
            body: 'Analyze appointment volumes, service utilization, and administrative workload from the spreadsheets your team already keeps.',
          },
          {
            industry: 'Retail performance',
            body: 'Track category and product movement over time — spot the lines that are slowing before the next stock order goes out.',
          },
          {
            industry: 'Management & board reporting',
            body: 'Generate a readable, numbers-backed summary for leadership without an analyst preparing it by hand.',
          },
          {
            industry: 'Operational review',
            body: 'Profile any operational dataset — request volumes, turnaround times, incident counts — and see what actually changed.',
          },
        ],
      },
      benefits: {
        title: 'What changes when your data starts talking',
        items: [
          {
            title: 'Decisions backed by evidence',
            body: 'Leadership discussions start from actual numbers — not impressions and memory.',
          },
          {
            title: 'Analysis without a BI project',
            body: 'No warehouse, no licences, no integrations. Upload a file and read the result.',
          },
          {
            title: 'Problems spotted earlier',
            body: 'Trend detection surfaces declining and accelerating measures while there is still time to act.',
          },
          {
            title: 'Reporting effort collapses',
            body: 'Profiling, KPIs, and a written summary are generated for every upload — not assembled by hand.',
          },
          {
            title: 'Accessible to non-technical staff',
            body: 'If you can export a spreadsheet, you can use WymInsight. The output is written for managers, not analysts.',
          },
        ],
      },
      specs: [
        { label: 'Inputs', value: 'CSV and Excel (.xlsx) uploads up to 8 MB' },
        {
          label: 'Analysis',
          value: 'Column profiling, KPIs, monthly trends, growth %, 3-period forecasts',
        },
        {
          label: 'Output',
          value: 'In-dashboard reports with AI summaries, trend charts + CSV downloads',
        },
        { label: 'Data ownership', value: 'Datasets and reports are isolated per organization' },
      ],
      faqs: [
        {
          q: 'What kinds of files can I upload?',
          a: 'CSV and Excel (.xlsx) files up to 8 MB. Most systems — POS, CRM, accounting, survey tools — export one of those formats already.',
        },
        {
          q: 'Do I need data skills to use it?',
          a: 'No. Upload the file and read the report. Column profiles, KPIs, and the executive summary are written for business readers, not analysts.',
        },
        {
          q: 'How does forecasting work?',
          a: 'When your data contains dates, numeric measures are aggregated by period and projected three periods ahead using linear trend analysis. It’s a directional indicator based on your own history — useful for planning, not a guarantee.',
        },
        {
          q: 'Can it analyze data across multiple files?',
          a: 'Each dataset is currently analyzed on its own. Cross-dataset joins and consolidated dashboards are on the roadmap.',
        },
        {
          q: 'Who can see our uploaded data?',
          a: 'Only your organization. Datasets and reports are isolated per organization, and access is governed by your staff roles and permissions.',
        },
      ],
      cta: {
        title: 'Your next decision should come with evidence.',
        body: 'Upload your first dataset and read what your business has been trying to tell you.',
      },
    },
    roadmap: ['Scheduled re-analysis', 'Cross-dataset joins and dashboards'],
  },
  {
    code: 'WYMFLOW',
    slug: 'wymflow',
    name: 'WymFlow AI',
    role: 'Business process automation',
    status: 'available',
    tagline: 'Approvals, requests, and paperwork — moving instead of waiting.',
    summary:
      'Define repeatable processes once — leave requests, purchase approvals, onboarding — and let structured submissions, ordered approvals, tasks, reminders, and a full activity record run themselves.',
    pageIntro:
      'WymFlow AI replaces the email threads, chat messages, and spreadsheets your processes currently live in. Define a workflow once — its form fields and approval steps — and every submission becomes a tracked instance with assigned tasks, attached documents, reminders, and a complete activity record.',
    capabilities: [
      {
        title: 'Workflows you design yourself',
        body: 'Each process gets its own name, description, submission fields (text, number, date, choice), and an ordered list of approval steps — configured in the dashboard, no code required.',
      },
      {
        title: 'Structured submissions',
        body: 'Requests arrive through a proper form with required fields and attached documents — not scattered messages someone has to interpret.',
      },
      {
        title: 'Step-by-step approvals',
        body: 'Each submission generates approval tasks in sequence. Approvers claim, approve, or reject with a comment — the instance advances or closes on its own.',
      },
      {
        title: 'Reminders and notifications',
        body: 'Approval events notify the right people automatically, and a scheduled reminder sweep flags pending tasks that have waited too long.',
      },
      {
        title: 'A complete activity timeline',
        body: 'Every submission, decision, comment, and status change is recorded on the instance — an audit trail for each process, not just each user.',
      },
      {
        title: 'Visibility across the board',
        body: 'See every running and completed instance by status, and every staff member sees the tasks waiting on them.',
      },
    ],
    detail: {
      seoTitle: 'WymFlow AI — Business Process Automation & Approval Workflows',
      seoDescription:
        'Replace email-and-spreadsheet coordination with structured workflows. WymFlow AI runs digital forms, ordered approvals, task tracking, reminders, and a complete audit trail.',
      problem: {
        title: 'Manual processes leak time and accountability',
        lede: 'Most internal processes still run on whoever remembers to follow up.',
        points: [
          {
            title: 'Requests hide in inboxes',
            body: 'Leave requests in chat messages, purchase approvals buried in email threads, documents arriving over personal phones — nothing is where anyone expects it.',
          },
          {
            title: 'Nobody knows the status',
            body: 'A request sits waiting on someone’s desk — but which desk? Without a shared view, “where is it?” becomes its own job.',
          },
          {
            title: 'Follow-up is manual',
            body: 'Someone has to remember to remind the approver, chase the document, and tell the requester — every single time.',
          },
          {
            title: 'There is no record',
            body: 'Decisions made in hallway conversations and deleted threads can’t be audited later.',
          },
        ],
      },
      solution: {
        title: 'Define the process once — then let it run',
        paragraphs: [
          'In WymFlow, each repeatable process gets a definition: a name, the form fields a submission must include — text, numbers, dates, choices — and an ordered list of approval steps. Staff submit through the form, attach supporting documents, and the process takes it from there.',
          'Every submission creates a tracked instance that generates a task for each approval step in order. Approvers claim their task and approve or reject; the workflow advances or closes accordingly — recording every decision, comment, and status change on a permanent activity timeline.',
        ],
      },
      howItWorks: {
        title: 'How a process runs in WymFlow',
        steps: [
          {
            title: 'Define the process',
            body: 'Name it, design the submission form, and lay out the approval steps — for example: supervisor sign-off, then finance review.',
          },
          {
            title: 'Staff submit through the form',
            body: 'Requests come in structured, with required fields answered and documents attached — ready to evaluate, not decipher.',
          },
          {
            title: 'Approvals route themselves',
            body: 'Each step generates a task for the right approver. They act, and the instance advances, completes, or closes — no chasing required.',
          },
          {
            title: 'Everything stays on record',
            body: 'Status, ownership, decisions, and timing are visible on the instance timeline and in each staff member’s task list.',
          },
        ],
      },
      useCases: {
        title: 'Processes WymFlow organizes',
        lede: 'Any repeatable request that currently lives in someone’s inbox.',
        items: [
          {
            industry: 'Invoice & expense approval',
            body: 'Route invoices through defined approvers with amounts, dates, and attached documents — instead of forwarding emails and hoping.',
          },
          {
            industry: 'Employee onboarding',
            body: 'Collect documents and sign-offs through an ordered process — every new hire completes the same steps, with nothing skipped.',
          },
          {
            industry: 'Leave & internal requests',
            body: 'Staff submit through a standard form; approvals follow the chain you define; everyone sees the status.',
          },
          {
            industry: 'Procurement sign-off',
            body: 'Purchases move through budget-holder review in order, with amounts and justification captured up front.',
          },
          {
            industry: 'Document collection & verification',
            body: 'Submissions arrive with required files attached; reviewers approve or send them back — the record shows exactly what happened.',
          },
          {
            industry: 'Cross-team coordination',
            body: 'Any repeatable multi-person process — content sign-off, facility requests, data corrections — becomes a defined, trackable workflow.',
          },
        ],
      },
      benefits: {
        title: 'What changes when processes run themselves',
        items: [
          {
            title: 'Requests stop disappearing',
            body: 'Every submission is a tracked instance with a status and an owner — not a message in someone’s inbox.',
          },
          {
            title: 'Approvals move faster',
            body: 'Tasks are generated automatically, routed in order, and reminded when they stall.',
          },
          {
            title: 'Accountability is built in',
            body: 'Decisions carry names, timestamps, and comments — the audit trail writes itself.',
          },
          {
            title: 'Less chasing, less admin',
            body: 'Staff stop spending hours on follow-ups that a process should handle for them.',
          },
          {
            title: 'Consistency you can rely on',
            body: 'Every request goes through the same defined steps — no shortcuts, no forgotten stages.',
          },
        ],
      },
      specs: [
        {
          label: 'Definitions',
          value: 'Custom form fields + ordered approval steps per workflow',
        },
        {
          label: 'Runtime',
          value: 'Instances, per-step tasks, attached documents, activity timeline',
        },
        {
          label: 'Notifications',
          value: 'Approval events + reminder sweep for stale pending tasks',
        },
        {
          label: 'Data ownership',
          value: 'Definitions and instances are isolated per organization',
        },
      ],
      faqs: [
        {
          q: 'Is WymFlow a task-management tool?',
          a: 'No. Task boards track individual to-dos. WymFlow runs defined, repeatable processes: structured intake, ordered approvals, and a permanent record of what happened. The process is the product.',
        },
        {
          q: 'Do we need developers to set up a workflow?',
          a: 'No. Process definitions — the form fields and approval steps — are built in the dashboard by whoever owns the process.',
        },
        {
          q: 'What happens if an approver rejects a request?',
          a: 'The rejection is recorded with the approver’s comment, the instance closes, and the decision stays on the permanent activity timeline.',
        },
        {
          q: 'How do reminders work?',
          a: 'A scheduled reminder pass notifies staff about pending tasks that have waited past a threshold — configured at the platform level as part of your deployment.',
        },
        {
          q: 'Can submissions include files?',
          a: 'Yes. Supporting documents attach to the submission and travel with the instance through every step.',
        },
      ],
      cta: {
        title: 'How many requests are waiting in someone’s inbox right now?',
        body: 'Define your first workflow and give every request a status, an owner, and a record.',
      },
    },
    roadmap: ['Trigger-based automations', 'External integrations (email, webhooks)'],
  },
];
