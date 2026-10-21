CapCar public copy: proposed English wording

Approved and applied: all 53 English wording changes below are now in the application. The tables retain the original wording for comparison.

The review uses the Humanizer skill and CapCar's approved product guidance. The main patterns are broad slogans, repeated references to a car's “story” or “direction,” and buttons that could describe their action more precisely. Useful automotive terms, concrete examples and necessary caveats should stay.

These changes affect English source values. Translation keys, object properties, placeholders, ICU expressions, routes and behavior stay unchanged. German, Greek, Albanian and Japanese wording has not been rewritten; equivalent localized wording needs review before it is applied. This is a review of the main public marketing pages, public tool introductions, account copy and onboarding, not an exhaustive review of every signed-in workspace or Journal article.

[Homepage source](src/features/marketing/homepage-copy.ts), English object

| Key | Current | Proposed |
| --- | --- | --- |
| `headline` | Your car. Every idea, job and journey in one place. | Keep your car's plans and history together. |
| `buildText` | Turn an idea into parts and tasks. Keep your budget, planned costs and actual spending in view as the project moves forward. | Plan the parts and tasks for your build. Track your budget, planned costs and actual spending as you go. |
| `drivesText` | Explore Roadbook places and routes, then use AI trip planning to put a drive together around your plans. | Find places and routes in Roadbook, then use AI trip planning to organize your drive. |
| `storyEyebrow` | One example. The whole picture. | Maintenance example |
| `storyTitle` | From “one day” to part of your car’s story. | From a planned job to your vehicle history. |
| `storyText` | Example BMW 318i · E90. A cabin-filter job shows how a plan becomes a record. All costs below are illustrative, not quotes. | Follow a cabin-filter replacement on an example BMW 318i (E90). All costs shown are illustrative, not quotes. |
| `ideaText` | Freshen up the daily driver. Put a cabin-filter replacement in the plan. | Add a cabin-filter replacement to your plan. |
| `demoTitle` | Look around before you make it yours. | Try an example build. |
| `demoText` | Compare a part and see the BMW build budget change. Example data only; nothing is bought or saved. | Compare a part and see how it changes the BMW build budget. This uses example data; nothing is bought or saved. |
| `toolsTitle` | A few more tools for the detail-minded. | Models, sound and vehicle records |
| `visualText` | Explore interactive reference car models and visual directions. A concept preview, not a guarantee of fitment or a model of your exact car. | Explore interactive reference car models and concept previews. These do not guarantee fitment or model your exact car. |
| `finalTitle` | Start with one car. Save the next thing you want to do. | Add your car and save your first plan. |

The existing hero description, primary “Create your garage” button, specific goal buttons and example amounts already give useful information. Keep them. Keep the distinct meanings of project budget, planned costs, actual spending and task completion.

[Platform source](src/features/marketing/platform-copy.ts), English object

| Key | Current | Proposed |
| --- | --- | --- |
| `title` | One car. Everything you want to do with it. | Your car's plans and records, together. |
| `description` | A place for the ideas, the work and the miles that follow. See how your garage, plans, guides and drives fit together. | See how your garage brings together plans, guides and drives for your car. |
| `explore` | See how it connects | Explore the garage tools |
| `bridge` | More than a collection of tools. | Keep plans and records with the right car. |
| `bridgeText` | Discover how the rest of CapCar fits around your car. | Explore the garage, build plans, guides and drives. |
| `journey` | An idea becomes part of your car’s story. | From an idea to a vehicle record. |
| `journeyText` | You do not need a finished build to start. One useful next step is enough. | Start with one task, even if the rest of the build is still undecided. |
| `availability` | What you can use. What comes next. | Available, preview and planned features |
| `availabilityText` | The platform is growing. Previews show the direction; planned features are not working integrations or release promises. | Previews show what we're exploring. Planned features are not working integrations or release promises. |
| `previewTitle` | Explore the direction | 3D references and diagnostics previews |
| `final` | Start with your car. Build from there. | Add your car to the garage. |

Keep “Available now,” “Preview” and “Planned” as separate statuses. Keep the current availability lists and all restrictions in `todayText`, `previewText`, `futureText` and `privacyText`.

[Onboarding source](src/features/onboarding/copy.ts), English object

| Key | Current | Proposed |
| --- | --- | --- |
| `intro` | Choose a car, pick your goal and save one useful idea. Everything else can wait. | Choose your car and a goal, then save an idea. You can add more details later. |
| `maintainHint` | Keep the next service in sight. | Plan the next service. |
| `drivesHint` | Keep a road worth driving for later. | Save a road you'd like to drive. |
| `firstTitle` | Make your first useful move. | What would you like to plan first? |
| `firstHint` | This saves a plan, not a claim that work is complete or a route is safe. | This saves a plan. It does not mark work as complete or confirm that a route is safe. |
| `ready` | Your direction is ready. | Ready to save your garage. |
| `readyHint` | Save your car and chosen first action together. No engine code, VIN or payment details needed. | Save your car and first action together. You don't need an engine code, VIN or payment details. |
| `catalogHint` | Availability is transparent: references are not exact fitment or a diagnosis. You can add any other car manually. | Reference coverage does not confirm fitment or diagnose faults. You can add other cars manually. |
| `noCoverage` | Your garage works even where researched coverage is not yet available. | You can use the garage even if researched coverage is unavailable for your car. |
| `personalValue` | A private home for your car's plans and history. | Keep your car's plans and history private. |
| `goalValue` | Your next action, tailored to your goal. | Your goal sets the garage's main action. |
| `actionValue` | Your first idea is ready to save—not another blank dashboard. | Your first idea is ready to save. |
| `noAction` | Choose one small next step to give your garage a direction. | Add a first task or drive idea. |

Keep the optional first-action step and existing save/sign-in behavior. Keep required vehicle fields, photo limits and plate warning, browser draft behavior, estimate limits and all validation messages. The proposal does not change what is required to finish setup.

[AI preview source](src/features/marketing/ai-preview-copy.ts), English object

| Key | Current | Proposed |
| --- | --- | --- |
| `title` | A good drive starts with a plan. | Plan a drive around your car and destination. |
| `how` | From an idea to your next drive. | How to plan your drive |

Keep the existing example itinerary, account and connected-service requirements, possible provider charges, and reminder to check directions, access and opening hours. No route safety or live-navigation claim is added.

[Public translation source](messages/public/en.json)

| Key | Current | Proposed |
| --- | --- | --- |
| `StudioPage.title` | Explore the direction. | Explore cars in 3D. |
| `StudioPage.description` | Explore 25 iconic cars in interactive 3D, free and without an account. Rotate, zoom and find your next direction. The same model library is available in your garage builds. | Explore 25 iconic cars in interactive 3D, free and without an account. Rotate and zoom to inspect each model. You can also use this model library in your garage builds. |
| `Auth.accountDescription` | Keep every vehicle, service record, part and decision together—and available wherever the next workshop session happens. | Keep your vehicles, service records, parts and build decisions together, with access across devices. |
| `CommunityPublic.signInTrade` | Sign in to buy or sell | Sign in to contact sellers or list a part |
| `CommunityPublic.connectedTitle` | Keep your work connected to your car. | Keep work records with your car. |
| `StudioUi.nextDirection` | Your next direction. | Try a look for your build. |
| `StudioUi.choose` | Choose a direction, then load the interactive model. | Choose a concept, then load its interactive model. |
| `StudioUi.three` | Three directions. Your starting point. | Three concepts to start from. |
| `Roadmap.description` | A practical view of what works today, what comes next and how CapCar grows from a car app into a garage for every project. | See what's available, what's in progress and what's planned. |
| `Roadmap.build` | Build your car | Create an account |
| `Roadmap.sequenceTitle` | A roadmap shaped by real use. | Development priorities |
| `Roadmap.sequenceDescription` | CapCar grows in the order that makes each workshop session clearer. Beta feedback can move the most useful work forward. | Beta feedback can change which features we work on next. |
| `Roadmap.hardening.title` | Beta hardening | Improving the beta |
| `Roadmap.hardening.description` | The work between a feature existing and a product feeling dependable: fewer dead ends, clearer trust signals and stronger public journeys. | Reduce dead ends, clarify trust information and improve public pages. |
| `Roadmap.decisionDescription` | CapCar ships the tools that make ownership and projects clearer first. Visual technology earns its place when it helps someone make a better decision—not only because it looks good. | We prioritize tools that help owners plan and manage car projects. Visual features should help people make decisions. |

The marketplace button should describe signing in to list a part or contact a seller; it should not suggest that CapCar processes a purchase. The Roadmap button links to registration, so “Create an account” describes its immediate destination. Neither change adds a feature or changes a route.

Keep useful wording as written: “Search live listings,” “Compare two recordings,” “Visit shop website,” “Request work record,” “Save my garage,” “Create account and save,” “Send reset link” and “Update password.” The eight active homepage FAQ answers are already concise and retain important factual limits.

Questions of factual consistency to resolve separately

- AI trip planning appears under `Roadmap.beyond` with a “Later” status, while the homepage promotes it and `/ai` contains an account-and-connected-service flow. This is a source-level availability discrepancy. Confirm the intended status before changing the roadmap claim; this proposal leaves that status and its feature description untouched.
- The public messages also contain a separate `Faq` namespace with a different future-pricing statement from `Launch.faq`, which is used by the current homepage FAQ. Do not merge or harmonize these commitments as a stylistic edit. Check which surfaces still render the older namespace and confirm the intended policy first.

Preservation check

- Free-beta wording and any future-pricing commitments are unchanged.
- Public browsing versus account-required saving remains explicit.
- AI service requirements and possible provider charges remain explicit.
- Examples stay illustrative; €30 planned, €300 budget and €28 actual retain their meanings.
- Owner-recorded work is not presented as professional verification.
- Fitment, exact-car model, native OBD, recording-comparison and roadmap limitations remain explicit.
- Private records, optional sharing, specialist approval limits, retailer checkout and browser-local storage notices remain unchanged.
- No translation key, placeholder, ICU expression, numeric limit, link target, component or application behavior is changed by this proposal.

Implementation: applied 53 English values across five source files and updated three existing heading assertions. Application changes are limited to the approved wording. Deployment configuration, live provider availability and device behavior were not tested.

Validation passed: 78 existing tests across 11 files, including public translation key parity and real ICU formatting; TypeScript validation; ESLint on edited TypeScript files; and `git diff --check`. A source-token comparison against HEAD confirmed exactly the 53 approved copy edits, preserving every other token in the five copy files. No package manifest or lockfile changes were introduced.
