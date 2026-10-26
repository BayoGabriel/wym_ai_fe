# WymNet AI — Frontend Architecture and AI Engineering Rules

**Project:** WymNet AI Solutions & Automation  
**Initial product:** WymAssist AI  
**Frontend stack:** Vite + React + TypeScript  
**Application type:** Marketing website, authenticated multi-tenant SaaS dashboard, and embeddable public chat widget  
**Backend:** Existing WymNet AI API  
**Status:** Foundational architecture — extend deliberately as product requirements become clear.

---

## 1. Purpose

This document is the source of truth for how AI coding agents and human developers must design, implement, test, and maintain the WymNet AI frontend.

The frontend is the customer-facing layer of WymNet AI Solutions & Automation. It must support the public company website, customer onboarding, authenticated organization dashboards, AI assistant configuration, knowledge management, visitor conversations, and future AI products.

The architecture must prioritize:

- Clear boundaries between presentation, state management, domain logic, and API access.
- Feature-based organization rather than a single enormous component directory.
- Small, reusable, independently testable React components.
- Strict TypeScript and explicit API contracts.
- Secure multi-tenant behavior and permission-aware navigation.
- Consistent design language across the marketing website and SaaS dashboard.
- A lightweight, independently distributable WymAssist website chat widget.
- Responsive, accessible, performant interfaces.
- Reusable platform capabilities without premature abstraction.
- Compatibility with the existing backend architecture and implemented API contracts.

### Core architectural principle

**The frontend is a client of the existing WymNet AI backend, not a second implementation of its business logic.**

The backend remains authoritative for authentication, tenant isolation, permissions, product entitlements, AI orchestration, knowledge retrieval, conversation persistence, usage tracking, and workflow transitions.

The frontend must never invent backend capabilities or pretend that an operation succeeded before the API confirms it.

## 2. Product scope and frontend applications

The frontend serves three distinct experiences. They may share code and design tokens, but their responsibilities and security boundaries must remain explicit.

### 2.1 Marketing website

The marketing website is publicly accessible and explains what WymNet AI offers.

Expected areas include:

- Home and company overview.
- WymAssist product overview.
- AI solutions and automation capabilities.
- Product features and use cases.
- Pricing, only when actual pricing requirements are established.
- Contact or enquiry entry points, when supported.
- Sign-in and account registration entry points.
- Legal pages, privacy policy, and terms where required.

Rules:

- Marketing pages must not require authentication.
- Public marketing content must not depend on organization-specific dashboard data.
- Do not invent customer testimonials, customer logos, performance statistics, pricing, or product capabilities.
- Keep marketing content separate from dashboard business logic.
- Reuse common visual primitives without forcing marketing sections into dashboard-specific components.
- Prefer accessible semantic HTML and responsive layouts.
- Keep page content and repeated content structures separate from presentation where doing so improves maintainability.

### 2.2 Authenticated customer dashboard

The dashboard is the main workspace for organizations using WymNet AI.

For the initial WymAssist MVP, the dashboard should be designed around capabilities that actually exist in the backend, such as:

- Authentication and session management.
- Organization and account context.
- Dashboard overview.
- Assistant configuration and settings.
- Knowledge base management, including supported document uploads and processing.
- Conversations and message history.
- Usage information, where supported by implemented API endpoints.
- Organization users and permissions, where exposed by the backend.
- Product access and organization entitlements.
- Account and organization settings.

Do not create a fully functional-looking screen for a feature that has no backend contract. If a future feature needs a placeholder, label it honestly and keep it distinct from implemented functionality.

The dashboard must support multiple organizations without allowing data, cached responses, selections, or UI state to leak between tenants.

### 2.3 Embeddable WymAssist chat widget

The widget allows visitors on a customer's website to interact with that organization's WymAssist assistant.

It is a separate public-facing interface, not a reduced version of the customer dashboard.

Responsibilities include:

- Opening and closing the chat interface.
- Creating or resuming a public chat session using the implemented public API.
- Sending visitor messages.
- Displaying user and assistant messages.
- Loading, sending, empty, and error states.
- Displaying permitted source references where the API provides them.
- Handling expired sessions and closed conversations.
- Preserving a visitor session according to the backend's session contract.
- Supporting mobile and desktop layouts.
- Providing accessible controls and keyboard interaction.

Security rules:

- Never embed staff access tokens, refresh tokens, private API keys, Gemini credentials, or customer dashboard credentials in the widget.
- Use only the public session credential and operations explicitly supported by the public API.
- Do not assume that a public organization slug or widget identifier is a secret.
- Do not bypass server-side origin, session, or tenant validation.
- Do not expose internal prompts, audit events, usage records, staff-only notes, or raw knowledge documents.
- Do not invent endpoints or session-refresh behavior that the backend does not support.

The widget must be architecturally isolated enough to build and distribute without bundling the full authenticated dashboard.

### 2.4 Future products

WymNet may expand to include WymInsight AI and WymFlow AI.

The architecture should allow future product-specific areas to be added under `features/` without forcing WymAssist-specific business logic into a generic product framework.

Do not implement WymInsight or WymFlow screens, navigation, API services, or domain models until their requirements and backend contracts are established.

Shared infrastructure may be reused when a real common requirement exists.

---

## 3. Non-negotiable AI coding rules

Every AI coding agent working in this repository must follow these rules.

### 3.1 Component size

1. No React component may exceed **100 lines of source code**.
2. Target 30–70 lines for ordinary components.
3. Count component implementation, JSX, local declarations, and component-specific handlers. Imports and blank lines do not justify artificial splitting.
4. When a component approaches 80 lines, look for a meaningful extraction before adding more behavior.
5. Split by responsibility, not arbitrarily. Suitable boundaries include a page section, toolbar, message list, message bubble, settings section, dialog, form section, or summary panel.
6. If a file contains multiple React components, each component must remain under 100 lines. Prefer one primary component per file.
7. Put reusable hooks, schemas, types, constants, API calls, and formatters in separate files when this improves clarity.
8. A custom hook is not a reason to move a large component's entire implementation into a second, equally difficult-to-maintain file. Preserve meaningful separation of responsibilities.
9. Non-component files may exceed 100 lines when justified, but should remain focused. Explain legitimate exceptions in the implementation report.
10. Never modify generated code manually to satisfy the component limit.

### 3.2 Separate UI from state and business logic

- Presentational components render props and emit callbacks.
- Page-level orchestration belongs in page-specific hooks or route-level composition.
- Reusable feature behavior belongs in feature hooks.
- Server state belongs in the query/cache layer.
- API calls belong in feature services, not JSX.
- Form state belongs in the form layer.
- URL state belongs in route search parameters when it should be shareable or bookmarkable.
- Ephemeral visual state may remain local to a component when appropriate.
- Shared client state must remain minimal.
- Avoid network requests, authorization decisions, complex business workflows, and large JSX structures in one component.
- Do not put React hooks inside presentational components merely to avoid defining an appropriate feature hook. Strictly visual local state is acceptable.
- Do not create global state for data already managed by a query cache.

### 3.3 TypeScript

- Use strict TypeScript.
- Do not use `any` to silence errors.
- Use `unknown` at untrusted boundaries and narrow it through validation.
- Avoid unsafe type assertions and non-null assertions.
- Define API request and response types explicitly.
- Keep API types separate from form types and UI view models when their responsibilities differ.
- Use discriminated unions for mutually exclusive states.
- Represent loading, error, success, and empty states explicitly where appropriate.
- Prefer literal unions over enums when simpler.
- Do not create a giant shared types file that couples unrelated features.
- Avoid duplicating backend types by hand across unrelated modules.
- If the backend provides an OpenAPI specification or another reliable contract, use it as the reference. Do not assume a specification exists without checking.

### 3.4 Implementation discipline

- Inspect the repository before changing it.
- Read this architecture document and relevant existing feature code before implementing a task.
- Reuse established patterns when they are appropriate.
- Implement only understood and requested behavior.
- Never invent API endpoints, request fields, response fields, permissions, workflows, or business rules.
- If an API contract is missing, identify the gap and ask for clarification when it affects correctness or security.
- Do not use fabricated production data or fake success responses.
- Do not add unused dependencies, dead code, abandoned components, commented-out implementations, or unnecessary abstractions.
- Do not swallow errors silently.
- Never log access tokens, public session credentials, private keys, or sensitive customer data.
- Do not claim work is complete until relevant checks have actually run.

---

## 4. Technology boundaries

Use this as the default technology policy. The existing repository's installed dependencies and established conventions take precedence unless a change is justified.

| Concern       | Preferred approach                                                           | Rule                                                                     |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Build tooling | Vite                                                                         | Keep configuration minimal and documented.                               |
| UI            | React + TypeScript                                                           | Functional components and strict typing.                                 |
| Routing       | Existing router, or one deliberately selected router                         | Never mix routing libraries.                                             |
| Server state  | TanStack Query, if installed or approved                                     | Centralize query keys, caching, mutations, and invalidation.             |
| Forms         | React Hook Form + Zod, if established                                        | Keep form validation separate from API/domain contracts.                 |
| Tables        | TanStack Table when needed                                                   | Keep column definitions and table logic outside large render components. |
| Client state  | React state and context initially                                            | Add Zustand only when a demonstrated requirement justifies it.           |
| HTTP          | Shared typed API client                                                      | Centralize base URL, errors, cancellation, and request behavior.         |
| Styling       | Existing styling system                                                      | Avoid competing styling systems.                                         |
| Icons         | Existing icon package                                                        | Do not mix icon libraries casually.                                      |
| Tests         | Existing test runner; Vitest and Testing Library are preferred if compatible | Test behavior and accessibility, not implementation details.             |
| Browser tests | Existing E2E framework, or one selected when justified                       | Cover critical user flows.                                               |
| Widget build  | Vite build configuration                                                     | Produce a widget-specific bundle only when the widget is implemented.    |

Rules:

- Inspect `package.json`, lockfiles, and existing source code before installing anything.
- Do not upgrade dependencies as part of unrelated feature work.
- Do not introduce a second form library, router, state manager, or styling framework without a concrete reason.
- Do not install every recommended library pre-emptively.
- Pin and maintain compatible versions according to the repository's package-management conventions.

---

## 5. Architectural layers and dependency direction

The dependency direction should point inward toward domain and feature concepts.

1. **Application bootstrap:** Vite entry point, React root, providers, global error boundary, and application initialization.
2. **Routing and layouts:** route definitions, public and authenticated layouts, route guards, and page composition.
3. **Feature pages and components:** WymAssist dashboard, knowledge management, conversations, settings, and other product-specific interfaces.
4. **Feature hooks:** page orchestration, queries, mutations, derived view models, and user actions.
5. **Feature services:** endpoint-specific operations, query definitions, and domain transformations.
6. **Shared platform:** API client, design system, authentication utilities, formatting, common components, and configuration.
7. **Backend:** authoritative authentication, authorization, validation, tenant isolation, AI orchestration, and persistence.

Rules:

- Services must not import React page components.
- Shared utilities must not depend on feature page implementations.
- One feature must not reach into another feature's internal files.
- Cross-feature communication should use a feature's public exports, shared domain contracts, or explicit application-level composition.
- Do not build a generic framework when a small, direct implementation is sufficient.
- Keep public marketing, authenticated dashboard, and widget entry points separate even when they share infrastructure.

---

## 6. Recommended project structure

Adapt this structure to the actual repository. Do not move all existing files simply to match the diagram; refactor deliberately as features are implemented.

```text
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── router/
│   │   ├── router.tsx
│   │   ├── route-guards.ts
│   │   └── route-meta.ts
│   ├── layouts/
│   │   ├── MarketingLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   └── errors/
│       ├── AppErrorBoundary.tsx
│       └── RouteErrorPage.tsx
│
├── routes/
│   ├── marketing/
│   ├── auth/
│   └── dashboard/
│
├── features/
│   ├── marketing/
│   │   ├── components/
│   │   ├── content/
│   │   ├── pages/
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── organizations/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── queries/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── assistant/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── knowledge/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── conversations/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── queries/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── usage/
│   ├── team/
│   ├── organization-settings/
│   └── products/
│
├── widget/
│   ├── entry.tsx
│   ├── WidgetApp.tsx
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   └── types/
│
├── shared/
│   ├── api/
│   │   ├── api-client.ts
│   │   ├── api-error.ts
│   │   └── api-types.ts
│   ├── auth/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   │   ├── tokens.css
│   │   └── globals.css
│   ├── types/
│   └── utils/
│
├── assets/
└── test/
    ├── setup.ts
    ├── fixtures/
    └── helpers/

public/
```

### Structure rules

- A feature owns its components, hooks, schemas, types, services, query keys, and tests where practical.
- `shared/` contains genuinely generic platform code.
- `routes/` remains thin and delegates feature behavior to the relevant feature.
- `widget/` is a separate entry point and must not import dashboard layouts, staff authentication, or dashboard-only state.
- The marketing website must not import authenticated dashboard services unnecessarily.
- Only create folders when they serve a real implementation need.
- Feature `index.ts` files expose deliberate public APIs rather than re-exporting everything.
- Avoid circular dependencies and broad barrel exports.
- Keep tests beside source files or in a consistent feature test directory.
- Preserve the existing repository's structure if it already meets these goals. Do not perform a large reorganization without a specific reason.

---

## 7. State management policy

Classify state before implementing it.

| State category       | Where it belongs                       | Examples                                                       |
| -------------------- | -------------------------------------- | -------------------------------------------------------------- |
| Server state         | Query/cache layer                      | Knowledge items, conversations, assistant settings, usage data |
| URL state            | Router search parameters               | Search, filters, pagination, selected dashboard tab            |
| Form state           | Form library and schemas               | Assistant settings, sign-in, knowledge metadata                |
| Local UI state       | Component or page hook                 | Open dialog, expanded panel, draft text                        |
| Shared client state  | Small global store only when justified | Temporary cross-feature workflow state                         |
| Session and identity | Authentication/session layer           | Current user, organization context, session status             |
| Derived state        | Computed from source state             | Filtered counts, disabled actions, status labels               |
| Widget session state | Widget-specific session layer          | Public session credential and active chat state                |

Rules:

- Do not duplicate query-cache data in a global store.
- Do not duplicate URL state in global state.
- Compute inexpensive derived values rather than storing them independently.
- Avoid `useEffect` for derived state or routine query fetching.
- Include all response-affecting parameters in query keys, including organization context when relevant.
- Invalidate or update affected queries after successful mutations.
- Prevent stale organization data from appearing after an organization switch.
- Do not automatically retry non-idempotent writes without a safe retry strategy.
- Do not show success feedback before the server confirms success.

### Widget-specific state

The widget must manage visitor-session state separately from staff authentication.

- Never place a visitor session credential in the staff authentication store.
- Never send a widget session credential to staff endpoints.
- Do not invent a session-resume strategy beyond the backend contract.
- If browser persistence is needed, minimize the credential's exposure and follow the agreed security design.
- Clear local session state when the session is invalid, revoked, or expired.
- Avoid storing message histories in persistent browser storage unless there is a documented need.
- Keep widget UI state isolated from dashboard state.

---

## 8. API and data-access rules

All network access must pass through the shared API client or an explicitly isolated client for a distinct security boundary.

### 8.1 Shared API client

The shared client must centralize:

- API base URL from validated Vite environment configuration.
- Request and response handling.
- Standard error normalization.
- Request cancellation.
- Content-type handling.
- Authentication behavior where appropriate.
- Safe handling of `401`, `403`, `404`, `409`, `429`, and server errors.

Do not create a separate ad hoc `fetch` wrapper inside each feature.

Feature services define endpoint-specific operations and map API responses to view models when necessary.

### 8.2 API contract discipline

- Inspect the actual backend routes, request schemas, response schemas, and error conventions before implementation.
- Do not assume an endpoint exists because it appears in a roadmap.
- Do not assume dashboard summary, usage analytics, customer records, or lead-management APIs exist until verified.
- Do not fabricate responses when an endpoint is missing.
- Keep request types, response types, and form types distinct when their shapes differ.
- Validate untrusted responses at runtime when justified by the risk and reliability of the contract.
- Keep backend error details out of end-user messages when they contain internal information.
- Show actionable, user-friendly messages while preserving useful safe diagnostics for development.

### 8.3 API clients by security boundary

Use the shared client where possible, but maintain distinct authentication behavior for:

1. Public marketing requests, if any.
2. Authenticated customer dashboard requests.
3. Public WymAssist widget requests.

The widget client must attach only the visitor credential required by the public API. It must not inherit staff authorization headers or refresh-token behavior.

Never embed server-side secrets in Vite environment variables. Any `VITE_*` value is considered public and may be exposed in the generated JavaScript bundle.

---

## 9. Authentication, organizations, and permissions

The backend is the source of truth for identity and authorization.

### 9.1 Authentication

- Inspect the existing backend's access-token, refresh-token, and session behavior before implementing frontend authentication.
- Do not invent a new authentication scheme.
- Model authentication as asynchronous states: initializing, authenticated, unauthenticated, and expired/error where appropriate.
- Follow the backend's token storage and renewal requirements.
- Do not place sensitive tokens in `localStorage` by default. Evaluate the actual backend contract and browser security trade-offs before choosing storage.
- Handle session expiry without infinite redirect loops.
- Ensure logout clears relevant client state and follows the backend logout contract.
- Do not expose tokens in URLs, console output, analytics, or error messages.

### 9.2 Multi-tenant organization context

- Resolve the current user's accessible organization context through the established API and session contract.
- Include organization context in relevant query keys.
- Clear or invalidate tenant-scoped cached data when the active organization changes.
- Reset selections and forms that are no longer valid after a tenant switch.
- Never trust a client-supplied organization ID as proof of access.
- Do not hard-code organization names, logos, product access, or permissions.

### 9.3 Permission-aware UI

- Use centralized permission helpers where the backend exposes permission capabilities.
- Do not scatter raw role-name comparisons throughout JSX.
- Hide or disable actions when the current user lacks the required capability.
- Default to denying access when authorization cannot be established.
- Treat frontend permission checks as a usability measure, never as a security boundary.
- The backend must still enforce all protected operations.
- Do not invent role names or permission strings.

### 9.4 Product entitlements

WymNet AI may expose multiple products under one organization.

- Display product availability based on actual entitlement and configuration responses.
- Do not assume every organization has access to every product.
- Do not confuse product entitlement with a user's permission to perform an action.
- Do not create nonfunctional navigation items for unimplemented products.
- Keep product-specific UI modular so future products can be introduced independently.

---

## 10. WymAssist dashboard feature rules

### 10.1 Assistant configuration

Assistant settings screens must reflect the fields and validation rules supported by the backend.

- Keep form schemas separate from API response types.
- Populate forms from confirmed API data.
- Track unsaved changes explicitly where appropriate.
- Handle validation errors returned by the server.
- Do not display a saved state until the update succeeds.
- Avoid overwriting unsaved changes during refetches.
- Reflect public-chat and allowed-origin settings only when the relevant backend configuration is available.

### 10.2 Knowledge management

Knowledge management may include text entries, supported document uploads, processing status, and retrieval-related metadata.

- Inspect the implemented knowledge API and upload contract.
- Show only file types and limits actually supported by the backend.
- Display processing states using actual server status values.
- Handle upload progress, failure, retry, and duplicate submission appropriately.
- Do not claim a document is searchable until the backend confirms its processing state.
- Do not fabricate document counts, embeddings, sources, or processing results.
- Keep file selection and upload orchestration out of large presentational components.
- Never expose internal filesystem paths, raw credentials, or server exception details.

### 10.3 Conversations

Conversation screens must use the established backend lifecycle and response shapes.

- Respect the actual conversation statuses and permitted transitions.
- Distinguish loading history, empty history, message submission, and provider failure.
- Prevent accidental duplicate submissions.
- Use server-confirmed message IDs and timestamps.
- Handle pagination and bounded history when supported.
- Display source references only when returned by the API and permitted for staff display.
- Do not assume every assistant response has sources or usage metadata.
- Do not invent assignment, escalation, lead, or human-handoff functionality before the backend supports it.

### 10.4 Usage and analytics

- Display usage information only from implemented API responses.
- Distinguish raw token counts from monetary costs.
- Do not infer actual provider spend from tokens unless a documented pricing calculation is implemented and maintained.
- Clearly label time ranges, units, and missing data.
- Use charts only when they answer a useful business question.
- Do not invent usage records to fill dashboard gaps.

---

## 11. Marketing website and dashboard design system

The marketing website and authenticated dashboard should feel like one product family without sharing every layout or interaction.

### Shared design principles

- Centralize colors, typography, spacing, borders, radii, focus styles, and layering tokens.
- Use the repository's existing styling strategy.
- Reuse buttons, inputs, icons, alerts, dialogs, and typography primitives where appropriate.
- Use semantic HTML before adding ARIA.
- Keep interactive controls accessible by keyboard.
- Provide visible focus states and meaningful accessible names.
- Do not communicate state through color alone.
- Support responsive behavior across desktop, tablet, and mobile.
- Keep high-density dashboard data readable.
- Avoid unnecessary animation and decorative complexity.
- Avoid one-off hard-coded styles when a design token or established variant exists.

### Layout separation

Use distinct layout components for:

- Public marketing pages.
- Sign-in and other authentication pages.
- Authenticated dashboard pages.
- The standalone chat widget.

Do not wrap public marketing pages in the authenticated dashboard layout.

Do not load the full dashboard application merely to render the public widget.

Do not force the widget to inherit dashboard typography, global styles, navigation, or layout assumptions.

### Shared component examples

Potential shared primitives include:

- `Button`
- `Input`
- `FormField`
- `Dialog`
- `Tooltip`
- `Toast`
- `PageHeader`
- `StatusBadge`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `ConfirmDialog`

Create or extend components when a concrete need exists. Do not build a large design system before the product needs it.

---

## 12. Routing and navigation

- Define routes through one selected router.
- Separate public routes from authenticated dashboard routes.
- Apply route-level authentication checks consistently.
- Keep route parameters and search parameters typed and validated.
- Use nested layouts for marketing, authentication, and dashboard experiences.
- Provide not-found, forbidden, session-expired, and route-error experiences.
- Use lazy loading for substantial feature areas when beneficial.
- Keep route definitions separate from complex page logic.
- Navigation visibility must reflect actual product availability and permissions.
- Direct route access must also be checked.
- Do not treat a hidden navigation link as authorization.
- Keep widget routing or view transitions inside the widget's own application boundary.

A suggested route map, subject to existing implementation and product requirements:

```text
/                       Marketing home
/products/wymassist     WymAssist product page
/sign-in                Authentication
/register               Registration, if supported
/dashboard              Authenticated overview
/dashboard/assistant    Assistant configuration
/dashboard/knowledge    Knowledge management
/dashboard/conversations Conversation management
/dashboard/settings     Organization settings
```

These paths are examples, not confirmed requirements. Inspect the existing router and agree on the actual route map before implementation.

---

## 13. Embeddable widget architecture

The WymAssist widget has distinct distribution and runtime requirements.

### 13.1 Build boundary

When widget implementation begins, inspect the existing Vite configuration and design a widget-specific entry point and build output.

The widget should:

- Initialize independently of the dashboard.
- Accept only the public configuration fields defined by the widget integration contract.
- Connect to the correct public API.
- Keep session handling isolated.
- Avoid bundling dashboard-only routes, authentication state, and large unrelated dependencies.
- Avoid conflicting with host website CSS and JavaScript.
- Have a documented installation and initialization method.
- Fail gracefully if the host website configuration is invalid.

Do not implement a separate widget build until the public API contract and intended embedding approach are understood.

### 13.2 Host-page isolation

A third-party website may already have its own CSS, JavaScript, fonts, and component libraries.

Choose an isolation strategy appropriate to the implementation, such as a Shadow DOM-based UI or an isolated iframe. Evaluate accessibility, styling, deployment, and security implications before deciding.

Requirements:

- Avoid global CSS selectors that affect the host website.
- Avoid relying on host website styles.
- Prevent the host website's ordinary CSS from unexpectedly breaking the widget.
- Keep widget-specific tokens and styles isolated.
- Do not claim complete isolation if the chosen technique does not provide it.
- Never inject unsanitized visitor or assistant content as executable HTML.
- Handle links and source references safely.
- Do not use `dangerouslySetInnerHTML` for untrusted message content.

### 13.3 Widget interaction states

The widget should explicitly handle:

- Initial closed state.
- Opening and initializing.
- Creating a public session.
- Loading conversation history when supported.
- Sending a message.
- Receiving an assistant response.
- Rate limiting.
- Network failures.
- Expired or invalid session.
- Closed conversation.
- Unavailable assistant.
- Empty or no-answer responses.

Do not treat all failures as the same generic error. Show a useful message and an appropriate next action without exposing internal diagnostics.

---

## 14. Performance and resilience

- Avoid premature optimization.
- Measure before introducing complexity.
- Lazy-load substantial dashboard feature areas when useful.
- Use stable query keys and deliberate stale times.
- Avoid unnecessary global context providers.
- Memoize only when justified by profiling or a clear identity-sensitive dependency.
- Use server-side pagination for large datasets.
- Debounce server-driven search where appropriate.
- Do not retry non-idempotent operations automatically without a safe strategy.
- Prevent duplicate submissions where appropriate.
- Keep one failed dashboard section from unnecessarily blanking the entire application.
- Provide route-level and application-level error boundaries.
- Keep the public widget bundle lean.
- Handle slow connections and interrupted requests.
- Do not leave loading indicators running indefinitely after an error.

---

## 15. Testing standards

Use the repository's existing test infrastructure. If testing tools are missing, propose a minimal compatible setup before adding dependencies.

### Unit tests

Test:

- Validation schemas.
- Formatters.
- Permission helpers.
- Query-key factories.
- API error normalization.
- Pure domain transformations.

### Component tests

Test:

- Rendering and user interactions.
- Accessible labels and keyboard behavior.
- Loading, empty, error, and success states.
- Form validation and server validation errors.
- Dialog behavior and destructive-action confirmation.

### Feature integration tests

Test:

- Authentication flows against mocked API contracts.
- Knowledge upload and processing states.
- Assistant settings save and failure behavior.
- Conversation submission and history rendering.
- Query invalidation after mutations.
- Organization switching and cache isolation.

### Widget tests

Test:

- Public session creation.
- Message submission and response rendering.
- Expired and invalid session handling.
- Rate-limited and unavailable API behavior.
- Safe rendering of message content.
- Host-page isolation where feasible.
- Absence of staff credentials from widget requests.

### Browser-level tests

Where the repository supports E2E testing, cover critical journeys:

1. Public visitor opens the marketing website.
2. User signs in and enters the dashboard.
3. Authorized user configures the assistant.
4. User adds knowledge and sees its actual processing state.
5. User views conversations.
6. Public visitor interacts with WymAssist through the widget when implemented.

Rules:

- Use deterministic fixtures.
- Do not depend on production data.
- Do not require live Gemini calls in ordinary automated tests.
- Do not treat mocked API behavior as proof of backend correctness.
- Test important failure paths, not just the happy path.
- Prefer accessible role- and label-based queries over brittle CSS selectors.

---

## 16. AI implementation workflow

Every coding agent must follow this sequence for each task.

### Step 1 — Inspect

Read this document, the relevant source files, route definitions, installed dependencies, design tokens, backend API contracts, and tests.

### Step 2 — Establish scope

Identify the requested outcome and distinguish existing functionality from proposed functionality.

Do not implement unrelated features while working on the requested task.

### Step 3 — Resolve uncertainties

Identify missing API contracts, unclear permissions, unconfirmed response fields, and workflow decisions.

Ask for clarification when a guess would affect security, data correctness, or user-visible behavior. Otherwise, use a clearly documented, low-risk assumption.

### Step 4 — Plan

Provide a concise implementation plan identifying:

- Files to create or modify.
- Route and permission requirements.
- API operations.
- Types and schemas.
- State ownership.
- Component tree.
- Loading, empty, error, and success states.
- Tests to add or update.

### Step 5 — Implement in layers

Use this order when appropriate:

1. API contracts, types, and schemas.
2. Feature services and query definitions.
3. Feature hooks and state orchestration.
4. Presentational components.
5. Page composition and routing.
6. Tests and documentation.

Do not force this order when a smaller change has a simpler, clearer dependency flow.

### Step 6 — Enforce component limits

Keep every React component under 100 lines. Extract meaningful responsibilities before the limit is exceeded.

### Step 7 — Verify behavior

Test the happy path, failure paths, authorization boundaries, and relevant edge cases.

### Step 8 — Run quality checks

Run the repository's actual typecheck, lint, formatting, tests, and production build scripts where available.

### Step 9 — Review the diff

Remove unused imports, dead code, accidental generated files, unrelated changes, unsafe assumptions, and unnecessary dependencies.

### Step 10 — Report honestly

Summarize the implementation, architectural decisions, verification results, and remaining blockers.

### Required implementation report

```text
Implemented
- ...

Architecture
- State ownership:
- API contracts:
- Components created or reused:

Verification
- TypeScript: pass / fail / not run
- Lint: pass / fail / not run
- Formatting: pass / fail / not run
- Tests: pass / fail / not run
- Production build: pass / fail / not run

Outstanding
- API assumptions:
- Unimplemented requirements:
- Known limitations:
```

---

## 17. Definition of done

A frontend task is complete only when all applicable conditions are satisfied:

- [ ] Requirements and API contracts were inspected.
- [ ] The affected route and access requirements are explicit.
- [ ] Component responsibilities and state ownership are clear.
- [ ] Every React component is under 100 lines.
- [ ] API calls are separated from presentation.
- [ ] Types and schemas match the actual API contract.
- [ ] Loading, empty, error, and success states are implemented where applicable.
- [ ] Permissions and organization boundaries are handled correctly in the UI.
- [ ] No client-side security assumption replaces backend authorization.
- [ ] Responsive behavior and accessibility have been considered.
- [ ] Important user interactions and failure paths are tested.
- [ ] Typecheck, lint, formatting, tests, and production build pass, or failures are explicitly reported.
- [ ] No dead code, unexplained `any`, fake production data, exposed secrets, or unrelated changes remain.
- [ ] Documentation and handoff information reflect the actual implementation.

---

## 18. Architectural failure modes to avoid

Do not introduce:

- Giant components containing an entire page or workflow.
- Components that perform requests, transform data, enforce permissions, and render a full screen.
- A single global component directory for every product feature.
- A global store containing all server responses.
- Cross-feature imports that bypass public feature APIs.
- Invented backend endpoints or assumed response fields.
- Fake data displayed as live customer information.
- UI-only authorization presented as a security boundary.
- Hard-coded organization-specific behavior in reusable components.
- Dashboard state shared with the public widget.
- Staff tokens included in widget requests.
- Unnecessary dependencies or framework rewrites.
- Excessive `useEffect` chains.
- Broad exception handling that hides failures.
- Unnecessary abstractions built for hypothetical future products.
- Large, unrelated refactors while implementing a focused feature.
- Claims of completion without actual verification.

---

## 19. Final architectural principle

Build WymNet AI as a cohesive product with clear boundaries between the marketing website, authenticated customer dashboard, and public WymAssist widget.

Keep the implementation modular, typed, secure, and easy to review. Let features own their behavior, let shared modules provide genuinely reusable capabilities, and let the existing backend remain authoritative for business rules and persisted data.

Design for future growth without building future products prematurely.

**When the repository or API contract disagrees with an assumption in a task, inspect the implementation and resolve the discrepancy rather than guessing.**

---

## 20. Implementation state (Phase 0 + 1)

This section records what actually exists so the rest of this document can be
read against real code rather than aspiration.

### Implemented route map

```text
/                          Marketing home
/products                  Product overview
/products/:slug            Product detail (wymassist | wyminsight | wymflow)
/use-cases                 Use cases
/pricing                   Contact-for-pricing (no billing API exists)
/about                     About
/contact                   Contact (real mailto:, no contact API exists)
/sign-in                   Sign in (RedirectIfAuthed)
/register                  Registration = organization onboarding (RedirectIfAuthed)
/dashboard                 Protected overview — real org + entitlements
/dashboard/products/:code  Protected product landing page
*                          Not found (inside marketing layout)
```

Route guard redirects carry a `returnTo` in location state that is validated as
an internal path only.

### Structure notes

- Providers live in `app/providers/` (`AppProviders`, `QueryProvider`,
  `AuthProvider`, `auth-context`), layouts in `app/layouts/` (`MarketingLayout`,
  `AuthLayout`, `DashboardLayout`), router in `app/router/router.tsx`, error
  UI in `app/errors/`. The thin `routes/` layer is not used yet — features own
  their pages directly under `features/<name>/pages/`.
- Server state uses TanStack Query (`@tanstack/react-query` is installed).
  Organization + entitlement queries are centralized in
  `features/organizations/queries/` with a `orgKeys` key factory scoped by
  organization id.
- `useAuth`/`hasPermission` come from `app/providers/auth-context`;
  authorization checks always defer to the backend.
- The widget boundary (`src/widget/`) is intentionally unimplemented.

### Backend contract notes relied on by this frontend

- Register creates organization + admin user and returns tokens — no separate
  onboarding API exists.
- `/auth/refresh` and `/auth/logout` require the access token in the
  Authorization header (expired-but-valid signatures accepted) plus the
  refresh token in the body.
- Entitlements are read via `GET /api/v1/organizations/:id/products`.
- Error envelope: `{ error: { code, message, details? } }`.

### Marketing redesign (Phase 1.1)

- The marketing site uses an editorial design system in
  `features/marketing/styles/marketing.css` (layout, header/footer, hero,
  steps, case rows, product lines, CTA band) plus `mocks.css` for the
  purpose-built product illustrations.
- Page-level copy lives in `features/marketing/data/` (`products.ts`,
  `use-cases.ts`) so content can be reviewed without touching markup.
- The composite WymAssist illustration is built from focused components in
  `features/marketing/components/mocks/`; shared primitives (`SectionHead`,
  `Eyebrow`, `StatusTag`) live in `features/marketing/components/SectionHead.tsx`.
- `AuthLayout` intentionally imports `marketing.css` for the shared `.brand` /
  `.logo-mark` mark — do not remove that import or rename those classes.
- `.nav-mobile` must not carry the `.container` class: `.site-header .container`
  sets `display: flex` at higher specificity and would override its
  `display: none` state.
