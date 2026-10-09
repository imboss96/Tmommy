# MommyCare Nairobi MVP and Implementation Roadmap

## 1. Product summary

MommyCare Nairobi helps families find vetted nannies and household professionals, and helps those professionals apply to be considered for work. MommyCare is the trusted placement operator: the website captures demand and supply, while a coordinator reviews requests and makes introductions.

**MVP product promise:** A Nairobi household can understand the available care options, review eligible professionals, and ask MommyCare for a placement consultation. MommyCare can review that request and respond using a clear, human-led process.

This is a managed lead-generation and placement service, not an instant-booking marketplace. The website must not imply that a profile is currently available, a placement is guaranteed, or emergency coverage is confirmed unless the operations team has verified it.

## 2. Users and jobs to be done

### Households

- Find a nanny or household professional by role and Nairobi area.
- Understand the provider's experience, skills, and vetting status without seeing sensitive documents.
- Request a consultation or placement and know that MommyCare received the request.
- Contact the team directly for urgent needs, with realistic expectations about dispatch availability.

### Homecare professionals

- Submit contact, role, availability, experience, and required supporting documents.
- Understand that an application is pending review and is not a promise of placement.
- Receive a clear next step from MommyCare outside the website during the MVP.

### MommyCare coordinators

- Review placement, emergency, contact, and provider applications in one operational workflow.
- Contact a household or applicant, record progress, and close or archive requests.
- Approve only reviewed provider profiles before making them public.

## 3. MVP scope

### Must have for a pilot

1. **Trustworthy service information**
   - Clear description of the managed placement process, vetting standards, trial arrangements, pricing approach, and replacement terms.
   - Honest availability and response-time language. Emergency requests are requests for contact, not a guaranteed dispatch.
   - Privacy and safety information appropriate to collecting household and applicant details.

2. **Discoverable provider directory**
   - Public profiles for approved, available professionals only.
   - Filter or browse by role and service area; profile details include role, experience, skills, and relevant non-sensitive verification indicators.
   - A clear call to action to request a consultation or placement.

3. **Household enquiry intake**
   - A general placement enquiry can capture the household contact, location, role/care needs, desired start, and useful context.
   - A profile-specific enquiry retains the selected provider as context without representing the enquiry as a confirmed booking.
   - Emergency requests are separately labelled and routed to the coordinator.
   - The submitter receives an understandable success or actionable error state.

4. **Provider application and review**
   - Applicants can submit a provider application and the required identity and good-conduct documents.
   - Documents remain private and accessible only to authorized reviewers through short-lived links.
   - A coordinator can review, approve, reject, or disable an application. Approval is an explicit human decision before a profile appears in the public directory.

5. **Coordinator operations**
   - Authorized staff can find submissions, update statuses, add internal notes, and follow up.
   - New submissions are easy to identify and the team has a defined response owner and service-level target.
   - Operational fallback is documented for outages; a failed submission must not be displayed as successful.

6. **Launch foundations**
   - Responsive and accessible core journeys, sensible loading/empty/error states, and basic search metadata.
   - Production configuration, database migrations, backups, monitoring, and a tested deployment/rollback process.
   - Basic funnel measurement from directory visit to enquiry submission and coordinator follow-up.

### Explicitly out of scope for the MVP

- Instant booking, automated matching, availability calendars, or placement guarantees.
- Payments, deposits, payroll, staff time tracking, or employment-contract management.
- Customer or provider accounts and self-service application tracking.
- Native mobile applications, chat, or real-time dispatch tracking.
- Automated criminal-background, identity, or reference verification. These remain human-reviewed operational responsibilities.
- Expanding beyond the initial Nairobi service area before the local placement workflow is reliable.

The current site contains additional marketing, editorial, comparison, salary-guide, and academy content. Keep these where they support trust or organic discovery, but they are not launch blockers for proving the core placement workflow.

## 4. MVP user journeys and acceptance criteria

### Household placement

1. A visitor reaches the directory or placement call to action.
2. They browse/filter professionals or submit a general request.
3. They provide required contact and service details, review their information, and submit.
4. The site confirms receipt only after persistence succeeds; otherwise it explains that the request did not submit and how to contact MommyCare.
5. A coordinator sees the enquiry, contacts the household, records the outcome, and updates the status.

**Acceptance:** A submitted enquiry is persisted once, appears in the coordinator workflow, retains relevant provider context where applicable, and can be progressed to a terminal status. Validation errors are shown beside the relevant fields. No payment or confirmed booking is implied.

### Provider application

1. An applicant reads the eligibility and privacy information.
2. They submit profile information and required documents.
3. The site confirms that the application is pending review.
4. A coordinator reviews the profile and documents, records a decision, and approves only after completing required checks.
5. An approved profile is made public only when the coordinator has supplied/confirmed the public profile fields and availability.

**Acceptance:** Private documents are never exposed in public profile responses; unreviewed applicants are not publicly listed; duplicate or invalid submissions receive actionable errors; approval/rejection is auditable by status and review time.

### Emergency request

1. A household provides contact details, location, role, and timing.
2. The request is clearly identified as urgent but not guaranteed coverage.
3. A coordinator receives it in the emergency queue and contacts the household.

**Acceptance:** The UI sets accurate expectations, the request is persisted and visible to authorized staff, and the team has a monitored notification/response process before advertising the service as available.

## 5. Success measures

Establish a baseline during the first pilot rather than treating the following suggested thresholds as proven forecasts. Agree final targets with the operations team before launch.

- **Demand:** qualified household enquiries per week and the share that meet service-area and role criteria.
- **Conversion:** directory/profile visits to submitted enquiries; enquiry to consultation; consultation to placement.
- **Speed:** median time from submission to first human response, including the emergency queue separately.
- **Supply:** complete applications, review turnaround, approval rate, and approved profiles marked genuinely available.
- **Trust and quality:** enquiry abandonment/error rate, complaints, placement outcomes, trial completion, and replacement requests.
- **Reliability:** successful form persistence, API availability, and zero public exposure of private application documents.

Recommended pilot guardrails: respond to standard enquiries within one business day; respond to an emergency request within the response window explicitly shown on the site; and pause or revise any advertised service whose staffing cannot meet those targets.

## 6. Current implementation baseline

The repository is not a blank-slate build. It already includes a React/TypeScript frontend, an Express API, Supabase migrations, a public staff directory, household enquiry surfaces, provider applications, and admin management components. Relevant existing database capabilities are described in [supabase/migrations/001_initial_schema.sql](../supabase/migrations/001_initial_schema.sql), [supabase/migrations/004_contact_inquiries.sql](../supabase/migrations/004_contact_inquiries.sql), [supabase/migrations/005_reviews.sql](../supabase/migrations/005_reviews.sql), and [supabase/migrations/006_provider_applications.sql](../supabase/migrations/006_provider_applications.sql).

Treat existing screens and tables as implementation in progress, not proof that the complete production journey is ready. Validate behavior against the acceptance criteria below in a deployed-like environment. The product's differentiator is the quality of verification and follow-up, so operations and data handling are part of the MVP, not later polish.

## 7. Implementation roadmap

The sequence below assumes a small team and an initial Nairobi pilot. Estimate each phase after confirming staffing, existing production configuration, and whether the current flows pass end-to-end testing.

### Phase 0 — Confirm the service and pilot (about 1 week)

- Confirm initial roles/areas, operating hours, placement steps, trial terms, fees, replacement terms, and realistic response promises.
- Assign an owner and backup for each enquiry queue; define the standard and emergency response procedures.
- Agree what evidence is required before a provider is described as vetted, approved, and available.
- Create a small, consented set of complete provider profiles and define who maintains availability.

**Exit:** Operations approves the service promise, the manual workflow, and the pilot cohort. No UI copy promises service the team cannot currently deliver.

### Phase 1 — Stabilize the core journeys (about 1–2 weeks)

- Walk through directory search, general and profile-specific enquiries, emergency requests, and provider applications on desktop and mobile.
- Verify validation, loading, submission, duplicate-submit behavior, persistence, error recovery, and success messaging.
- Verify statuses, internal notes, assignment, filtering, and close/archive actions in the admin workflow.
- Ensure private documents are never included in public API responses and that only reviewed/available profiles are listed.
- Add or correct missing acceptance tests and fix only the issues that block the pilot journeys.

**Exit:** Each journey above passes using production-like Supabase configuration, including failure cases; coordinators can process a request from receipt through closure.

### Phase 2 — Production readiness and operational controls (about 1–2 weeks)

- Confirm administrator identity and authorization use the production authentication/RLS policy; remove development-only credentials and defaults from the deployed configuration.
- Review database policies, API authorization, request validation/rate limiting, file upload limits, secrets handling, and document retention with the responsible engineer.
- Set up production environment variables, database migration procedure, backups, uptime/error monitoring, and tested recovery/rollback.
- Configure reliable notifications to the coordinator for new standard and emergency requests, with a monitored fallback if delivery fails.
- Add privacy-conscious analytics for the funnel and a mechanism to remove or correct personal data when required.

**Exit:** A staging deployment passes smoke tests; a real submission reaches the right operational owner; access to sensitive data is limited and verified; restore/rollback steps are tested.

### Phase 3 — Controlled pilot (about 2–4 weeks)

- Launch to a limited audience in the agreed Nairobi areas with an intentionally small, maintained provider directory.
- Review new enquiries daily and track response times, completeness, consultation outcomes, and provider availability.
- Interview households and providers after meaningful interactions; log recurring confusion and operational bottlenecks.
- Fix conversion-blocking defects and incorrect expectations before adding features.

**Exit:** The team consistently meets its response target, providers shown as available are actually contactable, and the enquiry-to-consultation path is understood from observed data.

### Phase 4 — Improve based on evidence (ongoing)

- Improve search and profile information based on common household requests and failed searches.
- Add richer coordinator reporting, automation, or customer status updates only where observed workflow volume justifies them.
- Consider accounts, payment, scheduling, or automated matching only after placement operations and trust requirements are stable.
- Expand service areas or provider roles in step with verification capacity and coordinator coverage.

**Exit:** Each investment has a measurable user or operational outcome, an owner, and a success measure.

## 8. Release checklist

- [ ] Pilot geography, roles, availability, pricing/terms, and response windows are approved and accurately represented.
- [ ] Household and provider flows pass on a real mobile device and in a production-like environment.
- [ ] Public directory data contains only approved profiles and excludes private documents and sensitive vetting identifiers.
- [ ] Authorized coordinators can handle submissions; unauthorized users cannot access admin operations or private documents.
- [ ] Standard and emergency request notifications are tested end to end, including a delivery-failure fallback.
- [ ] Privacy, terms, safety, document retention, and data deletion procedures are reviewed by the business owner.
- [ ] Backups, monitoring, deployment, and rollback have named owners and have been exercised.
- [ ] Funnel and operational metrics have definitions, a baseline, and a review cadence.

## 9. Key product decisions to preserve

- Keep placement human-led until enough reliable outcome data exists to automate matching.
- Separate a request for help from a confirmed booking or guaranteed emergency dispatch.
- Treat vetting as a controlled operational process, not a marketing badge that is automatically inferred from a submitted application.
- Show only the minimum information households need to choose whether to enquire; keep identity documents and sensitive checks private.
- Prefer a reliable, measurable core journey over adding more public content or marketplace features during the pilot.
