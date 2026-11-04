export type UseCase = {
  title: string;
  problem?: string;
  value?: string;
  body?: string;
  product?: string;
};

export type UseCaseGroup = {
  product: string;
  slug: string;
  tagline: string;
  cases: UseCase[];
};

export const ASSIST_CASES: UseCase[] = [
  {
    title: 'Answering policy and product questions',
    problem:
      'Customers ask the same questions your documents already settle — refunds, terms, specifications, eligibility — and staff time goes to repeating answers.',
    value:
      'WymAssist answers from your approved knowledge in seconds, around the clock, and the answer carries the source it came from.',
  },
  {
    title: 'Handling website enquiries without a contact form',
    problem:
      'A static contact form collects a message and drops it into an inbox with no context and no immediate response for the visitor.',
    value:
      'Visitors get an answer first. If they need more, the enquiry becomes a lead with the full conversation attached — your team follows up already briefed.',
  },
  {
    title: 'Capturing and managing potential customers',
    problem:
      'Interested visitors leave your site without identifying themselves, or their details arrive scattered across inboxes and spreadsheets.',
    value:
      'Leads are created inside the platform, deduplicated against the same session, and managed by your team with status and notes.',
  },
  {
    title: 'Escalating to staff without losing the thread',
    problem:
      'When a bot fails a visitor, the usual fix is “send us an email” — the conversation dies and the visitor starts over with a person.',
    value:
      'A visitor can request a human inside the conversation. Staff claim it, reply in the same thread, and resolve it. The AI pauses while a person is in charge.',
  },
];

export const INSIGHT_CASES: UseCase[] = [
  {
    title: 'Understanding performance without a BI project',
    problem:
      'Your numbers live in spreadsheet exports nobody analyzes — because proper analysis means licences, integrations, and specialists.',
    value:
      'Upload a CSV or Excel file and get column profiling, KPIs, trends, and forecasts — the analysis your spreadsheet was waiting for.',
  },
  {
    title: 'Preparing management reports faster',
    problem:
      'Summaries for leadership get written by hand, under deadline, from memory — instead of from the data itself.',
    value:
      'Every report opens with an AI-written executive summary grounded in the actual analysis — readable by a manager, exportable to CSV.',
  },
  {
    title: 'Catching trends before the quarter closes',
    problem:
      'Declining product lines and growing programs often become obvious only in hindsight — after it’s too late to act cheaply.',
    value:
      'Trend detection assigns a direction and growth rate to measures tracked over time, with a three-period forecast surfaced automatically.',
  },
  {
    title: 'Reporting on programs to funders and boards',
    problem:
      'NGO activity data sits in registers and logs that nobody can read at a glance — and reports get assembled manually each cycle.',
    value:
      'Beneficiary counts, distribution logs, and activity records become profiled data with a written narrative your stakeholders can read directly.',
  },
];

export const FLOW_CASES: UseCase[] = [
  {
    title: 'Approving invoices without email chains',
    problem:
      'Invoices get forwarded for sign-off, stall in inboxes, and nobody can say who’s holding them or what was decided.',
    value:
      'Submissions route through defined approval steps as tasks — decided, commented, and recorded on a permanent timeline.',
  },
  {
    title: 'Onboarding employees the same way every time',
    problem:
      'Each new hire’s paperwork follows a slightly different path, documents chase people, and steps get skipped.',
    value:
      'A defined workflow collects submissions and sign-offs in order — every hire completes the same steps, with the record to prove it.',
  },
  {
    title: 'Handling internal requests with real statuses',
    problem:
      'Leave requests, IT needs, and facility issues arrive in chats and hallway conversations — with no shared view of what’s pending.',
    value:
      'Staff submit through a structured form; each request becomes a tracked instance with a status, an owner, and a history.',
  },
  {
    title: 'Collecting documents without chasing',
    problem:
      'Required files arrive piecemeal over personal channels, and nobody knows what’s complete until someone checks by hand.',
    value:
      'Documents attach to the submission and travel with the process — reviewers approve or send it back, and the timeline shows what happened.',
  },
];

export const USE_CASE_GROUPS: UseCaseGroup[] = [
  {
    product: 'WymAssist AI',
    slug: 'wymassist',
    tagline: 'Customer support & communication',
    cases: ASSIST_CASES,
  },
  {
    product: 'WymInsight AI',
    slug: 'wyminsight',
    tagline: 'Business intelligence & analytics',
    cases: INSIGHT_CASES,
  },
  {
    product: 'WymFlow AI',
    slug: 'wymflow',
    tagline: 'Business process automation',
    cases: FLOW_CASES,
  },
];
