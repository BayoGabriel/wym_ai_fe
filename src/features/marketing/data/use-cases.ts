export type UseCase = {
  title: string;
  problem?: string;
  value?: string;
  body?: string;
  product?: string;
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

export const PLANNED_CASES: UseCase[] = [
  {
    title: 'Understanding operations from your own data',
    product: 'WymInsight AI',
    body: 'The planned analytics product will let teams upload datasets and get profiling, trends, and report-ready output — so operational questions stop requiring a BI project.',
  },
  {
    title: 'Automating repeatable internal processes',
    product: 'WymFlow AI',
    body: 'The planned workflow product will turn intake forms, approvals, and reminders into defined processes with a full history — replacing email-and-spreadsheet coordination.',
  },
];
