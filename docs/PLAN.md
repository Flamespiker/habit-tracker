+-----------------------------------------------------------------------+
| **🎯 Habit & Goal Tracker**                                           |
|                                                                       |
| **Learning Plan**                                                     |
|                                                                       |
| Build a full-stack personal productivity app with AI coaching         |
|                                                                       |
| 16 Weeks · 10+ hrs/week · Anthropic-First · Vercel Hobby · Zero Extra |
| Cost                                                                  |
+-----------------------------------------------------------------------+

**🎯 What You\'re Building**

A personal Habit & Goal Tracker --- a hobby app for your own use. Track
daily habits, set goals, log check-ins, and get AI coaching nudges from
Claude. Built with a modern dual-database architecture: Supabase for
structured relational data, MongoDB Atlas for flexible AI-generated
content.

+-----------------------+-----------------------+-----------------------+
| **📋 Core Features**  | **🤖 AI Features**    | **⚙️ Tech Goals**     |
|                       |                       |                       |
| -   Create & manage   | -   Daily coaching    | -   SQL vs NoSQL      |
|     habits            |     nudge from Claude |     architecture      |
|                       |                       |                       |
| -   Set goals with    | -   Weekly AI summary | -   RBAC + ABAC auth  |
|     target dates      |     of progress       |     patterns          |
|                       |                       |                       |
| -   Daily check-in &  | -   Smart habit       | -   Agentic CI/CD     |
|     streak tracking   |     suggestions       |     pipeline          |
|                       |                       |                       |
| -   Habit categories  | -   Goal adjustment   | -   Playwright E2E    |
|     & tags            |     recommendations   |     testing           |
|                       |                       |                       |
| -   Progress charts & | -   Motivational      | -   n8n local         |
|     stats             |     streaks analysis  |     automation        |
+-----------------------+-----------------------+-----------------------+

**✅ Why Vercel Hobby Works for This Project**

  ---- ---------------------------------------------------------------------
  💡   This is a genuine personal hobby app --- no commercial intent, no
       businesses, no revenue. You\'re the only user. This is exactly what
       Vercel\'s Hobby tier is designed for.

  ---- ---------------------------------------------------------------------

  ----------------------------------- -----------------------------------
  **Vercel Hobby Free Tier Gives      **Why It\'s Enough for This App**
  You**                               

  **100GB bandwidth/month**           Personal app --- you\'re the only
                                      user, tiny traffic

  **1M function invocations/month**   AI nudges + check-ins = hundreds,
                                      not millions

  **Unlimited projects & deploys**    Push code freely, deploy as often
                                      as you like

  **Preview URLs per PR**             Test every feature branch before
                                      merging

  **Auto-deploy on git push**         Full CI/CD pipeline at zero cost

  **Custom domain support**           Point your own domain at it for
                                      free
  ----------------------------------- -----------------------------------

**🗄️ Dual Database Architecture**

Understanding why you\'re using two databases is as important as how to
use them. This is real-world polyglot persistence --- choosing the right
tool for each type of data.

+-----------------------------------+-----------------------------------+
| **🟢 Supabase (PostgreSQL)**      | **🍃 MongoDB Atlas**              |
|                                   |                                   |
| Structured, relational data       | Flexible, document-shaped data    |
+-----------------------------------+-----------------------------------+

+-----------------------------------+-----------------------------------+
| -   Users & profiles              | -   AI coaching responses (vary   |
|                                   |     in structure)                 |
| -   Habits (name, frequency,      |                                   |
|     category)                     | -   Weekly AI summaries (rich     |
|                                   |     nested content)               |
| -   Goals (title, target, status) |                                   |
|                                   | -   User preferences & settings   |
| -   Check-ins (habit_id, date,    |     (grow over time)              |
|     done)                         |                                   |
|                                   | -   Habit insights & patterns     |
| -   Streaks & counts              |     (AI-generated)                |
|                                   |                                   |
| Why SQL? These records have fixed | -   n8n workflow logs & pipeline  |
| shapes and strong relationships.  |     outputs                       |
| A check-in always belongs to      |                                   |
| exactly one habit. SQL enforces   | Why NoSQL? AI output has no fixed |
| this perfectly.                   | shape. A coaching nudge for a     |
|                                   | habit streak looks totally        |
|                                   | different to one for a missed     |
|                                   | goal. Documents handle this       |
|                                   | naturally.                        |
+-----------------------------------+-----------------------------------+

**📐 Data Schema Design**

**Supabase (PostgreSQL) --- Structured Tables**

+-----------------------------------------------------------------------+
| **users** · Supabase Auth (built-in)                                  |
+-----------------------------------------------------------------------+
| **id** uuid --- auto-generated by Supabase Auth                       |
|                                                                       |
| **email** text --- unique, indexed                                    |
|                                                                       |
| **created_at** timestamp                                              |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **habits** · Supabase Postgres                                        |
+-----------------------------------------------------------------------+
| **id** uuid primary key                                               |
|                                                                       |
| **user_id** uuid → users.id --- foreign key, RLS scoped per user      |
|                                                                       |
| **name** text --- e.g. \'Morning run\'                                |
|                                                                       |
| **frequency** text --- \'daily\' \| \'weekly\' \| \'custom\'          |
|                                                                       |
| **category** text --- \'health\' \| \'learning\' \| \'mindfulness\'   |
|                                                                       |
| **target_days** int\[\] --- \[1,2,3,4,5\] = Mon--Fri                  |
|                                                                       |
| **created_at** timestamp                                              |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **goals** · Supabase Postgres                                         |
+-----------------------------------------------------------------------+
| **id** uuid primary key                                               |
|                                                                       |
| **user_id** uuid → users.id --- RLS scoped                            |
|                                                                       |
| **habit_id** uuid → habits.id --- nullable --- goal can be standalone |
|                                                                       |
| **title** text --- e.g. \'Run 5k in under 30 mins\'                   |
|                                                                       |
| **target_date** date                                                  |
|                                                                       |
| **status** text --- \'active\' \| \'completed\' \| \'paused\'         |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **checkins** · Supabase Postgres                                      |
+-----------------------------------------------------------------------+
| **id** uuid primary key                                               |
|                                                                       |
| **habit_id** uuid → habits.id                                         |
|                                                                       |
| **user_id** uuid → users.id --- RLS --- users only see own check-ins  |
|                                                                       |
| **date** date --- one check-in per habit per day                      |
|                                                                       |
| **completed** boolean                                                 |
|                                                                       |
| **notes** text --- optional user note                                 |
+-----------------------------------------------------------------------+

**MongoDB Atlas --- Flexible Documents**

+-----------------------------------------------------------------------+
| **ai_coaching (collection)** · MongoDB Atlas                          |
+-----------------------------------------------------------------------+
| **\_id** ObjectId --- auto                                            |
|                                                                       |
| **user_id** string --- links to Supabase user                         |
|                                                                       |
| **type** string --- \'daily_nudge\' \| \'weekly_summary\' \|          |
| \'suggestion\'                                                        |
|                                                                       |
| **habit_context** object --- varies --- snapshot of relevant habit    |
| data                                                                  |
|                                                                       |
| **content** object --- AI response --- structure varies by type       |
|                                                                       |
| **created_at** ISODate                                                |
|                                                                       |
| **model** string --- \'claude-sonnet-4-6\' --- track which model      |
| generated it                                                          |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **user_preferences (collection)** · MongoDB Atlas                     |
+-----------------------------------------------------------------------+
| **\_id** ObjectId                                                     |
|                                                                       |
| **user_id** string                                                    |
|                                                                       |
| **coaching_style** string --- \'motivational\' \| \'analytical\' \|   |
| \'gentle\'                                                            |
|                                                                       |
| **notification_time** string --- \'08:00\'                            |
|                                                                       |
| **focus_areas** array --- grows over time as user adds preferences    |
|                                                                       |
| **custom_settings** object --- open-ended --- any new settings stored |
| here                                                                  |
+-----------------------------------------------------------------------+

**🧰 Full Zero-Cost Toolbox**

Every tool is free beyond your Claude Pro subscription. Verified March
2026.

**Anthropic Ecosystem --- Included in Claude Pro**

  ---- --------------- ----------------------------------------- ----------
  🤖   **Claude        Tutor, planner, architect, debugger ---   **✅ Pro**
       (claude.ai)**   use throughout all 16 weeks               

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  ⚡   **Claude Code** Agentic coding --- writes code, edits     **✅ Pro**
                       files, opens PRs, reviews diffs           

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- -------------
  🖥️   **Claude        Desktop agent --- file automation, doc    **✅ Pro
       Cowork**        creation, task scheduling                 (Preview)**

  ---- --------------- ----------------------------------------- -------------

  ---- --------------- ----------------------------------------- ----------
  🌐   **Claude in     Browser automation for visual UI          **✅ Pro**
       Chrome**        verification and testing                  

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🎓   **Claude        Custom workflows --- teach Claude your    **✅ Pro**
       Skills**        conventions once, reuse forever           

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🔌   **MCP Servers** Connect Claude Code to GitHub, Supabase,  **✅ Free
                       MongoDB, browser                          / OSS**

  ---- --------------- ----------------------------------------- ----------

**Frontend**

  --- --------------- ----------------------------------------- ----------
  ▲   **Next.js 15+** React framework --- routing, SSR, API     **✅
                      routes                                    Free**

  --- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🎨   **Tailwind      Utility-first styling                     **✅
       CSS**                                                     Free**

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🧩   **shadcn/ui**   Pre-built component library               **✅
                                                                 Free**

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🪄   **v0 by         Generate UI from prompts --- paste into   **✅ Free
       Vercel**        project                                   tier**

  ---- --------------- ----------------------------------------- ----------

**Databases**

  ---- ---------------- ----------------------------------------- ----------
  🟢   **Supabase       Structured data --- users, habits, goals, **✅ Free
       (PostgreSQL)**   check-ins                                 tier**

  ---- ---------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- -----------
  🍃   **MongoDB Atlas Flexible data --- AI responses,           **✅ Free
       (M0)**          preferences, insights                     forever**

  ---- --------------- ----------------------------------------- -----------

  ---- --------------- ----------------------------------------- ----------
  🔐   **Supabase      Login, sessions, OAuth                    **✅
       Auth**                                                    Free**

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ------------
  🔒   **Row Level     RBAC --- users only access their own data **✅
       Security**                                                Built-in**

  ---- --------------- ----------------------------------------- ------------

  ---- --------------- ----------------------------------------- ------------
  🏷️   **Custom JWT    ABAC --- attribute rules in user tokens   **✅
       Claims**                                                  Built-in**

  ---- --------------- ----------------------------------------- ------------

**AI Features & Pipelines**

  ---- --------------- ----------------------------------------- -------------
  🧠   **Anthropic     Claude in your app --- coaching,          **⚠️
       API**           summaries, suggestions                    Sparingly**

  ---- --------------- ----------------------------------------- -------------

  ---- --------------- ----------------------------------------- ----------
  🌊   **Vercel AI     Stream Claude responses into Next.js ---  **✅
       SDK**           free OSS                                  Free**

  ---- --------------- ----------------------------------------- ----------

  ---- ---------------- ----------------------------------------- ----------
  🔗   **LangChain.js / Agent pipelines --- multi-step AI         **✅ Free
       LangGraph**      reasoning                                 / OSS**

  ---- ---------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🔄   **n8n (local)** Visual automation --- Community Edition   **✅ Free
                       on laptop                                 local**

  ---- --------------- ----------------------------------------- ----------

**Testing & DevOps**

  ---- ---------------- ----------------------------------------- ----------
  🎭   **Playwright**   E2E browser testing --- real browser,     **✅ Free
                        real flows                                / OSS**

  ---- ---------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🐙   **GitHub        Repo, PR workflow, Issues, Actions        **✅
       (public repo)**                                           Free**

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ------------
  ⚙️   **GitHub        CI/CD --- unlimited minutes on public     **✅ Free
       Actions**       repos                                     (public)**

  ---- --------------- ----------------------------------------- ------------

  ---- --------------- ----------------------------------------- ----------
  🤖   **Claude Code   Autonomous PR review agent on every PR    **✅ Pro**
       Action**                                                  

  ---- --------------- ----------------------------------------- ----------

  ---- --------------- ----------------------------------------- ----------
  🌲   **Trunk.io**    AI code quality gates --- free for open   **✅ Free
                       source                                    (OSS)**

  ---- --------------- ----------------------------------------- ----------

  --- --------------- ----------------------------------------- ----------
  ▲   **Vercel        Deploy Next.js --- personal use,          **✅
      (Hobby)**       auto-deploy on push                       Free**

  --- --------------- ----------------------------------------- ----------

**📅 16-Week Roadmap at a Glance**

  ----------- ---------------- ------------------------ ------------------
  **Phase**   **Focus**        **Key Skills**           **Milestone**

  **1 · Wks   Environment &    Claude Code, Next.js,    App deployed on
  1--2**      Scaffold         Vercel, GitHub           Vercel

  **2 · Wks   Core UI          Tailwind, shadcn/ui, v0, Habit dashboard UI
  3--4**                       routing                  complete

  **3 · Wks   Supabase Backend Postgres schema, RBAC,   Login + habits in
  5--6**                       ABAC, RLS                real DB

  **4 · Wks   MongoDB Atlas    NoSQL setup, AI data     AI responses
  7--8**                       layer, Mongoose          stored in Mongo

  **5 · Wks   AI Coaching      Claude API, streaming,   Live AI nudges
  9--10**     Features         LangChain agents         working

  **6 · Wks   CI/CD & PR Agent GitHub Actions, Claude   Full automated
  11--12**                     PR agent, Playwright     pipeline

  **7 · Wks   Automation       n8n local, LangGraph,    Daily AI summaries
  13--14**    Pipelines        webhooks                 automated

  **8 · Wks   Polish & Launch  Cowork, Skills, UX, full v1.0 personal app
  15--16**                     review                   live
  ----------- ---------------- ------------------------ ------------------

+-----------------------------------------------------------------------+
| **PHASE 1 · Environment & Scaffold**                                  |
|                                                                       |
| Weeks 1--2 · \~22 hrs total · Goal: App live on Vercel                |
+-----------------------------------------------------------------------+

Set up your entire development environment, understand how the tools
connect, and get a skeleton of the app deployed live. No real features
yet --- just the foundation that everything else builds on.

**Week 1 --- Dev Environment & First Deploy**

+-----------------------------------------------------------------------+
| **Day 1** (2 hrs) --- Read & Get the Mental Model                     |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **1**   Read Claude Code overview:                                  |
|           docs.anthropic.com/claude-code/overview (15 mins)           |
|                                                                       |
|   **                                                                  |
| 2**   Read Next.js App Router intro: nextjs.org/docs/app (15 mins --- |
|           just the overview)                                          |
|                                                                       |
|   **3**   Read Vercel Hobby plan page to confirm personal use terms   |
|                                                                       |
|   **                                                                  |
| 4**   Ask Claude: \"Explain how Next.js, GitHub, Vercel, Supabase and |
|                                                                       |
|       MongoDB work together in a single app. Draw it as a simple text |
|           diagram.\"                                                  |
|                                                                       |
|   **5**   Ask Claude: \"What is the difference between SQL and NoSQL? |
|           Give me a real example using habits and AI coaching data.\" |
|                                                                       |
|                                                                       |
| 🤖      Claude tip: Ask Claude to quiz you on the mental model before |
|                                                                       |
|       writing any code. If you can\'t explain it back, re-read before |
|           Day 2.                                                      |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 2** (2 hrs) --- Install Everything                              |
+-----------------------------------------------------------------------+
|   ----                                                                |
| --- ----------------------------------------------------------------- |
|   **1**   Install Node.js 20 via nvm: curl -o-                        |
|                                                                       |
|       https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh |
|           \| bash                                                     |
|                                                                       |
|   **2**   Install GitHub CLI: brew install gh (Mac) or winget install |
|           GitHub.cli (Windows)                                        |
|                                                                       |
|   **3**   Authenticate GitHub: gh auth login                          |
|                                                                       |
|   *                                                                   |
| *4**   Install Claude Code: npm install -g \@anthropic-ai/claude-code |
|                                                                       |
|   **                                                                  |
| 5**   Launch Claude Code and complete OAuth: claude --- this links to |
|           your Pro account                                            |
|                                                                       |
|                                                                       |
| **6**   Verify everything: node \--version && gh \--version && claude |
|           \--version                                                  |
|                                                                       |
|                                                                       |
|  🤖      Claude tip: If any install fails, paste the error to Claude: |
|                                                                       |
|        \"This install failed --- what\'s wrong and how do I fix it?\" |
|   ----                                                                |
| --- ----------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 3** (2 hrs) --- Create Repo & Scaffold App                      |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **1**   Create public GitHub repo: gh repo create habit-tracker     |
|           \--public \--clone && cd habit-tracker                      |
|                                                                       |
|                                                                       |
|  **2**   Scaffold Next.js: npx create-next-app@latest . \--typescript |
|           \--tailwind \--eslint \--app \--src-dir \--import-alias     |
|           \"@/\*\"                                                    |
|                                                                       |
|   **3**   Verify dev server: npm run dev --- open localhost:3000      |
|                                                                       |
|   **4**   First commit: git add . && git commit -m \"feat: initial    |
|           Next.js scaffold\" && git push                              |
|                                                                       |
|   **5**   Ask Claude Code in terminal: \"What does each file in this  |
|           Next.js scaffold do?\"                                      |
|                                                                       |
|   🤖                                                                  |
|       Claude tip: Open Claude Code (claude in terminal) and ask it to |
|           explain the folder structure. Understanding this now saves  |
|           hours later.                                                |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 4** (2 hrs) --- Deploy to Vercel                                |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **1**   Sign up at vercel.com with your GitHub account              |
|                                                                       |
|   **2**   Click \'Add New Project\' → Import your habit-tracker repo  |
|                                                                       |
|   **3**   Framework preset: Next.js --- build command and output      |
|           directory auto-fill                                         |
|                                                                       |
|   **4**   Click Deploy --- first deploy takes \~3 mins                |
|                                                                       |
|                                                                       |
| **5**   Note your URL: habit-tracker-xxx.vercel.app --- share it with |
|           yourself to confirm it\'s live                              |
|                                                                       |
|   *                                                                   |
| *6**   Make a small change (edit page title), push to main --- verify |
|           Vercel auto-deploys within 2 mins                           |
|                                                                       |
|   🤖                                                                  |
|       Claude tip: Ask Claude: \"What is Vercel doing during the build |
|           step? What does it mean to \'build\' a Next.js app?\"       |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 5** (2 hrs) --- CLAUDE.md, .claudeignore & First Real Session   |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   *                                                                   |
| *1**   Create CLAUDE.md in repo root --- see template in next section |
|                                                                       |
|   **2**   Create .claudeignore --- see template in next section       |
|                                                                       |
|   **3**   Open Claude Code: claude                                    |
|                                                                       |
|   **4**   Run: /status --- Claude reads CLAUDE.md and confirms it     |
|           understands your project                                    |
|                                                                       |
|                                                                       |
|  **5**   Ask: \"Based on CLAUDE.md, what files will this project need |
|           that don\'t exist yet?\"                                    |
|                                                                       |
|                                                                       |
| **6**   Commit: git add . && git commit -m \"chore: add CLAUDE.md and |
|           .claudeignore\" && git push                                 |
|                                                                       |
|   🤖      Claude tip: Run /compact after long sessions to summarise   |
|           context and save tokens. Run /clear when switching to a     |
|           completely different task.                                  |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

**CLAUDE.md Template for This Project**

  ---- ---------------------------------------------------------------------
  💡   Create this file in your repo root. Claude Code reads it at the start
       of every session --- it\'s your single most important token-saving
       file.

  ---- ---------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **\# Habit & Goal Tracker**                                           |
|                                                                       |
| Personal hobby app. Not commercial. Only user is me.                  |
|                                                                       |
| **\## Stack**                                                         |
|                                                                       |
| \- Next.js 15 (App Router, TypeScript)                                |
|                                                                       |
| \- Tailwind CSS + shadcn/ui                                           |
|                                                                       |
| \- Supabase --- Postgres + Auth (structured data)                     |
|                                                                       |
| \- MongoDB Atlas M0 --- AI responses + preferences (flexible data)    |
|                                                                       |
| \- Vercel (Hobby plan --- personal use)                               |
|                                                                       |
| \- Playwright (E2E tests)                                             |
|                                                                       |
| \- GitHub Actions + Claude Code Action (CI/CD + PR reviews)           |
|                                                                       |
| **\## Folder Structure**                                              |
|                                                                       |
| src/app/ → Next.js pages and API routes                               |
|                                                                       |
| src/components/ui/ → shadcn/ui (don\'t edit)                          |
|                                                                       |
| src/components/app/ → custom app components                           |
|                                                                       |
| src/lib/db/supabase/ → Supabase query functions                       |
|                                                                       |
| src/lib/db/mongo/ → MongoDB query functions                           |
|                                                                       |
| src/lib/auth/ → auth helpers                                          |
|                                                                       |
| tests/ → Playwright tests                                             |
|                                                                       |
| .github/workflows/ → CI/CD pipelines                                  |
|                                                                       |
| **\## Conventions**                                                   |
|                                                                       |
| \- TypeScript strictly --- no \`any\` types                           |
|                                                                       |
| \- Server Components by default --- Client only when needed           |
|                                                                       |
| \- DB queries ONLY in src/lib/db/ --- never inline in components      |
|                                                                       |
| \- Auth logic ONLY in src/lib/auth/                                   |
|                                                                       |
| \- Supabase = relational data \| MongoDB = AI/flexible data           |
|                                                                       |
| **\## Commands**                                                      |
|                                                                       |
| npm run dev → dev server                                              |
|                                                                       |
| npm run build → production build                                      |
|                                                                       |
| npx playwright test → E2E tests                                       |
|                                                                       |
| npx tsc \--noEmit → type check                                        |
+-----------------------------------------------------------------------+

**Week 2 --- Project Structure & Claude Skills**

+-----------------------------------------------------------------------+
| **Day 1** (2 hrs) --- Plan App Structure with Claude                  |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **1**   Open Claude Code: claude                                    |
|                                                                       |
|   *                                                                   |
| *2**   Ask: \"Based on CLAUDE.md, create a complete file tree for the |
|                                                                       |
|          habit tracker --- all pages, components, API routes, and lib |
|           files. Don\'t create them yet, just show the plan.\"        |
|                                                                       |
|   **3**   Review the plan --- ask follow-up questions until you       |
|           understand every file\'s purpose                            |
|                                                                       |
|   *                                                                   |
| *4**   Ask: \"Now explain how data flows from the MongoDB AI coaching |
|           collection through the API route to the React component.\"  |
|                                                                       |
|   🤖      Claude tip: Take time to understand the architecture before |
|                                                                       |
|       generating files. Rushed scaffolding you don\'t understand will |
|           cost you more time to debug later.                          |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 2** (2 hrs) --- Scaffold All Pages                              |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **                                                                  |
| 1**   In Claude Code: \"Create all the pages from our file tree plan. |
|                                                                       |
|       Each page should have a heading, a TODO comment explaining what |
|           it will do, and be TypeScript. Pages needed: /, /habits,    |
|                                                                       |
|          /habits/new, /habits/\[id\], /goals, /goals/new, /dashboard, |
|           /settings\"                                                 |
|                                                                       |
|   *                                                                   |
| *2**   Review every generated file --- ask Claude to explain anything |
|           you don\'t understand                                       |
|                                                                       |
|   **3**   Run npm run dev and verify all routes load                  |
|                                                                       |
|   *                                                                   |
| *4**   Commit: git checkout -b feat/page-scaffold && git add . && git |
|           commit -m \"feat: scaffold all app pages\"                  |
|                                                                       |
|   🤖                                                                  |
|       Claude tip: After Claude generates files, always ask: \"Walk me |
|                                                                       |
|       through what you just created and why you made those choices.\" |
|           This is learning, not just code generation.                 |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 3** (2 hrs) --- Install shadcn/ui & Create Claude Skills        |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **1**   Install shadcn: npx shadcn@latest init                      |
|                                                                       |
|                                                                       |
| **2**   Add components: npx shadcn@latest add button card input label |
|           badge table dialog form toast progress                      |
|                                                                       |
|                                                                       |
|  **3**   In Claude Code: /skills create → name it \'habit-component\' |
|                                                                       |
|   **4**   Teach it: \'When creating a React component: TypeScript     |
|                                                                       |
|          interface for props, Server Component by default, use client |
|                                                                       |
|         only when needed with comment explaining why, named + default |
|           export, JSDoc comment, place in src/components/app/\'       |
|                                                                       |
|   **5**   Test the skill: \"Using the habit-component skill, create a |
|                                                                       |
|        HabitCard component that shows habit name, streak count, and a |
|           check-in button\"                                           |
|                                                                       |
|                                                                       |
| 🤖      Claude tip: Claude Skills are your biggest token saver. Every |
|                                                                       |
|          time Claude follows the skill, it reads the skill definition |
|           instead of re-reading examples from your codebase.          |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 4** (2 hrs) --- Git Branching Workflow Practice                 |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   *                                                                   |
| *1**   Merge your scaffold PR: gh pr create \--title \'feat: scaffold |
|           pages\' \--base main && gh pr merge \--squash               |
|                                                                       |
|   **2**   Practice the full workflow 3 times with small changes: git  |
|           checkout main → git pull → git checkout -b feat/xxx → make  |
|           change → commit → push → gh pr create → gh pr merge         |
|                                                                       |
|   **                                                                  |
| 3**   Add a PR template: create .github/pull_request_template.md with |
|           sections for: What changed, Why, How to test                |
|                                                                       |
|   **4**   Commit the PR template to main                              |
|                                                                       |
|   🤖      Claude tip: This workflow becomes automatic by Phase 6.     |
|           Practising it now means CI/CD in Phase 6 slots in without   |
|           friction.                                                   |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Day 5** (2 hrs) --- Cowork Setup & Week Review                      |
+-----------------------------------------------------------------------+
|   --                                                                  |
| ----- --------------------------------------------------------------- |
|   **1**   Open Claude Desktop → Cowork → grant access to your         |
|           habit-tracker folder                                        |
|                                                                       |
|   **2**   Give Cowork this task: \"Read all files in src/app/ and     |
|                                                                       |
|         src/components/. Write a one-page current state summary: what |
|           exists, what\'s missing, what phase 2 needs to address.\"   |
|                                                                       |
|                                                                       |
| **3**   Read the summary --- is it accurate? If not, update CLAUDE.md |
|           to be clearer                                               |
|                                                                       |
|   **                                                                  |
| 4**   Ask Claude to quiz you: \"Quiz me one at a time on: Next.js App |
|                                                                       |
|       Router, Vercel deploy pipeline, CLAUDE.md purpose, SQL vs NoSQL |
|           split, Claude Skills.\"                                     |
|                                                                       |
|   **5**   Push all final Week 2 changes to main                       |
|                                                                       |
|   🤖                                                                  |
|       Claude tip: End every week with a Claude quiz. Identifying gaps |
|                                                                       |
|       now is better than discovering them mid-build in a later phase. |
|   --                                                                  |
| ----- --------------------------------------------------------------- |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 2 · Core UI**                                                 |
|                                                                       |
| Weeks 3--4 · \~22 hrs total · Goal: Full habit dashboard UI           |
+-----------------------------------------------------------------------+

Build the complete visual interface --- everything a user sees and
touches. Use v0 to generate UI fast, Claude Code to refine it, and
Claude in Chrome to visually verify it. No backend yet --- all data is
hardcoded/mocked.

+-----------------------------------------------------------------------+
| **Week 3 --- Habit Dashboard & Components**                           |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Build habit     | -   v0.dev          | A beautiful habit   |   |
| |     list & habit    |     (generate       | dashboard with mock |   |
| |     card UI         |     dashboard       | data --- streaks,   |   |
| |                     |     layout)         | cards, check-ins,   |   |
| | -   Create check-in |                     | filters all working |   |
| |     button with     | -   shadcn/ui       | visually            |   |
| |     state           |     (Card, Badge,   |                     |   |
| |                     |     Progress,       |                     |   |
| | -   Add             |     Button)         |                     |   |
| |     progress/streak |                     |                     |   |
| |     display         | -   Claude Code     |                     |   |
| |                     |     (refine &       |                     |   |
| | -   Build habit     |     TypeScript)     |                     |   |
| |     category        |                     |                     |   |
| |     filters         | -   Claude in       |                     |   |
| |                     |     Chrome (visual  |                     |   |
| |                     |     verify)         |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 4 --- Goals, Forms & Navigation**                              |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Build goal      | -   shadcn/ui       | Complete UI shell   |   |
| |     creation form   |     (Form, Dialog,  | --- habits, goals,  |   |
| |                     |     Input)          | dashboard, nav ---  |   |
| | -   Create goal     |                     | all pages wired,    |   |
| |     progress card   | -   React Hook      | mobile-friendly,    |   |
| |                     |     Form + Zod      | loading states      |   |
| | -   Add site-wide   |     (validation)    | ready               |   |
| |     navigation      |                     |                     |   |
| |                     | -   Next.js layouts |                     |   |
| | -   Mobile          |     (shared nav)    |                     |   |
| |     responsive      |                     |                     |   |
| |     layout          | -   Tailwind        |                     |   |
| |                     |     responsive      |                     |   |
| | -   Loading         |     breakpoints     |                     |   |
| |     skeletons for   |                     |                     |   |
| |     all data        |                     |                     |   |
| |     components      |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 3 · Supabase Backend & Auth**                                 |
|                                                                       |
| Weeks 5--6 · \~22 hrs total · Goal: Real auth + habits in Postgres    |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 5 --- Supabase Setup & Schema**                                |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Create Supabase | -   Supabase        | Habits and goals    |   |
| |     project         |     dashboard       | load from Postgres  |   |
| |                     |     (table editor)  | --- create a habit, |   |
| | -   Build schema:   |                     | refresh, it\'s      |   |
| |     users, habits,  | -   Supabase JS     | still there         |   |
| |     goals, checkins |     client          |                     |   |
| |                     |     (@supabase/ssr) |                     |   |
| | -   Connect         |                     |                     |   |
| |     Supabase to     | -   Next.js Server  |                     |   |
| |     Next.js         |     Components      |                     |   |
| |                     |                     |                     |   |
| | -   Replace mock    | -   SQL basics      |                     |   |
| |     data with real  |     (SELECT,        |                     |   |
| |     DB queries      |     INSERT, JOIN)   |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 6 --- Auth, RBAC & ABAC**                                      |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Add Supabase    | -   Supabase Auth   | Login works. Every  |   |
| |     Auth (email +   |     (email + OAuth) | user only sees      |   |
| |     Google OAuth)   |                     | their own data.     |   |
| |                     | -   Row Level       | Routes redirect     |   |
| | -   Implement Row   |     Security (RLS)  | unauthenticated     |   |
| |     Level Security  |     policies        | users. RLS          |   |
| |     on all tables   |                     | verified.           |   |
| |                     | -   Custom JWT      |                     |   |
| | -   Add custom JWT  |     claims (ABAC)   |                     |   |
| |     claims for ABAC |                     |                     |   |
| |                     | -   Next.js         |                     |   |
| | -   Protect all     |     middleware      |                     |   |
| |     routes with     |                     |                     |   |
| |     Next.js         | -   Claude Code     |                     |   |
| |     middleware      |     (auth           |                     |   |
| |                     |     scaffolding)    |                     |   |
| | -   Test: user A    |                     |                     |   |
| |     cannot see user |                     |                     |   |
| |     B\'s habits     |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 4 · MongoDB Atlas --- AI Data Layer**                         |
|                                                                       |
| Weeks 7--8 · \~22 hrs total · Goal: NoSQL storing AI responses        |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 7 --- MongoDB Atlas Setup**                                    |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Create MongoDB  | -   MongoDB Atlas   | First MongoDB       |   |
| |     Atlas M0 free   |     dashboard       | document saved ---  |   |
| |     cluster         |                     | a hardcoded         |   |
| |                     | -   Mongoose        | coaching message    |   |
| | -   Connect MongoDB |     (schema + ODM)  | stored and          |   |
| |     to Next.js via  |                     | retrieved from      |   |
| |     Mongoose        | -   Next.js API     | Atlas               |   |
| |                     |     routes (App     |                     |   |
| | -   Create          |     Router)         |                     |   |
| |     collections:    |                     |                     |   |
| |     ai_coaching,    | -   MongoDB Compass |                     |   |
| |                     |     (local GUI)     |                     |   |
| |    user_preferences |                     |                     |   |
| |                     |                     |                     |   |
| | -   Build API       |                     |                     |   |
| |     routes that     |                     |                     |   |
| |     write to        |                     |                     |   |
| |     MongoDB         |                     |                     |   |
| |                     |                     |                     |   |
| | -   Read AI data in |                     |                     |   |
| |     components      |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 8 --- Dual DB Data Flow**                                      |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Build habit     | -   Supabase        | Check in a habit →  |   |
| |     check-in that   |     (check-in       | Supabase records it |   |
| |     writes to       |     write)          | → MongoDB stores a  |   |
| |     Supabase        |                     | coaching note →     |   |
| |                     | -   MongoDB         | dashboard shows     |   |
| | -   Trigger MongoDB |     (coaching       | both                |   |
| |     coaching doc on |     response write) |                     |   |
| |     check-in        |                     |                     |   |
| |                     | -   Promise.all()   |                     |   |
| | -   Read from both  |     (parallel       |                     |   |
| |     DBs in          |     queries)        |                     |   |
| |     dashboard       |                     |                     |   |
| |                     | -   Claude Code     |                     |   |
| | -   Understand when |     (architecture   |                     |   |
| |     to use each DB  |     review)         |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 5 · AI Coaching Features**                                    |
|                                                                       |
| Weeks 9--10 · \~22 hrs total · Goal: Live Claude coaching in the app  |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 9 --- AI Nudges & Streaming**                                  |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Add \'Get       | -   Anthropic API   | Click \'Coach me\'  |   |
| |     coaching        |                     | → Claude streams a  |   |
| |     nudge\' button  | (claude-sonnet-4-6) | personalised nudge  |   |
| |                     |                     | based on your habit |   |
| | -   Call Claude API | -   Vercel AI SDK   | data → saved to     |   |
| |     from Next.js    |     (useChat /      | MongoDB             |   |
| |     API route       |     streamText)     |                     |   |
| |                     |                     |                     |   |
| | -   Stream response | -   Next.js API     |                     |   |
| |     into UI with    |     route (POST     |                     |   |
| |     Vercel AI SDK   |     handler)        |                     |   |
| |                     |                     |                     |   |
| | -   Save coaching   | -   MongoDB (save   |                     |   |
| |     response to     |     AI outputs)     |                     |   |
| |     MongoDB         |                     |                     |   |
| |                     |                     |                     |   |
| | -   Display past    |                     |                     |   |
| |     coaching        |                     |                     |   |
| |     history         |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 10 --- LangChain Agent & Weekly Summary**                      |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Build LangGraph | -   LangGraph       | Every Sunday an     |   |
| |     agent for       |     (stateful       | agent analyses your |   |
| |     weekly summary  |     agent)          | week, reads both    |   |
| |                     |                     | databases, and      |   |
| | -   Agent reads     | -   LangChain tools | writes a rich       |   |
| |     Supabase +      |     (Supabase +     | summary to MongoDB  |   |
| |     MongoDB data    |     Mongo)          |                     |   |
| |                     |                     |                     |   |
| | -   Generates       | -   Anthropic API   |                     |   |
| |     structured      |     (Claude as LLM) |                     |   |
| |     summary         |                     |                     |   |
| |     document        | -   MongoDB (save   |                     |   |
| |                     |     structured      |                     |   |
| | -   Add coaching    |     summaries)      |                     |   |
| |     style           |                     |                     |   |
| |     preference      |                     |                     |   |
| |     (ABAC)          |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 6 · CI/CD, PR Agent & Testing**                               |
|                                                                       |
| Weeks 11--12 · \~22 hrs total · Goal: Fully automated pipeline        |
+-----------------------------------------------------------------------+

This phase turns your project from \'code on a laptop\' into a
professional development pipeline. Every push triggers tests, Claude
reviews PRs automatically, and Vercel deploys on merge.

+-----------------------------------------------------------------------+
| **Week 11 --- Playwright Tests with Claude Code**                     |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Install and     | -   Playwright (E2E | Full test suite     |   |
| |     configure       |     testing)        | covering all core   |   |
| |     Playwright      |                     | flows --- runs      |   |
| |                     | -   Claude Code     | green locally,      |   |
| | -   Ask Claude Code |     (test           | ready for CI        |   |
| |     to generate     |     generation)     |                     |   |
| |     test suite      |                     |                     |   |
| |                     | -   Claude in       |                     |   |
| | -   Tests: login    |     Chrome (visual  |                     |   |
| |     flow, habit     |     verify)         |                     |   |
| |     creation,       |                     |                     |   |
| |     check-in, goal  | -   p               |                     |   |
| |     creation        | laywright.config.ts |                     |   |
| |                     |     setup           |                     |   |
| | -   Run tests       |                     |                     |   |
| |     locally, then   |                     |                     |   |
| |     headlessly      |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 12 --- PR Agent & Full CI/CD Pipeline**                        |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Create          | -   Claude Code     | Open a PR → Claude  |   |
| |                     |     Action (PR      | reviews it          |   |
| | .github/workflows/c |     reviews)        | automatically →     |   |
| | laude-pr-review.yml |                     | tests run → quality |   |
| |                     | -   GitHub Actions  | checked → Vercel    |   |
| | -   Add Anthropic   |     (3 workflows)   | deploys preview URL |   |
| |     API key as      |                     |                     |   |
| |     GitHub secret   | -   Trunk.io        |                     |   |
| |                     |     (quality gates) |                     |   |
| | -   Set up Trunk.io |                     |                     |   |
| |     quality gates   | -   Vercel          |                     |   |
| |                     |     (auto-deploy on |                     |   |
| | -   Add Playwright  |     merge)          |                     |   |
| |     to GitHub       |                     |                     |   |
| |     Actions         | -   GitHub MCP      |                     |   |
| |                     |     Server          |                     |   |
| | -   Test full       |                     |                     |   |
| |     pipeline: push  |                     |                     |   |
| |     → review → test |                     |                     |   |
| |     → deploy        |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 7 · n8n Automation & Pipelines**                              |
|                                                                       |
| Weeks 13--14 · \~22 hrs total · Goal: Automated AI workflows          |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 13 --- n8n Local Setup & First Workflow**                      |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Install n8n     | -   n8n Community   | Automated daily     |   |
| |     locally: npx    |     Edition (local) | flow: 8am cron →    |   |
| |     n8n             |                     | check Supabase for  |   |
| |                     | -   n8n HTTP        | today\'s habits →   |   |
| | -   Build first     |     Request nodes   | call Claude → save  |   |
| |     workflow: daily |                     | nudge to MongoDB    |   |
| |     habit reminder  | -   n8n Schedule    |                     |   |
| |                     |     trigger (cron)  |                     |   |
| | -   Connect n8n to  |                     |                     |   |
| |     Supabase via    | -   n8n Supabase    |                     |   |
| |     HTTP            |     integration     |                     |   |
| |                     |                     |                     |   |
| | -   Trigger AI      |                     |                     |   |
| |     coaching nudge  |                     |                     |   |
| |     via n8n →       |                     |                     |   |
| |     Claude API      |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 14 --- LangGraph Multi-Step Agent**                            |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Build LangGraph | -   LangGraph       | Sunday night: n8n   |   |
| |     weekly review   |     (agent state    | triggers LangGraph  |   |
| |     agent           |     machine)        | agent → agent reads |   |
| |                     |                     | all your data →     |   |
| | -   Agent tools:    | -   LangChain tools | writes rich weekly  |   |
| |     read Supabase,  |     (DB connectors) | review to MongoDB → |   |
| |     read MongoDB,   |                     | available on        |   |
| |     write summary   | -   n8n             | dashboard Monday    |   |
| |                     |     (orchestration  | morning             |   |
| | -   Connect agent   |     wrapper)        |                     |   |
| |     to n8n as       |                     |                     |   |
| |     workflow step   | -   MongoDB (final  |                     |   |
| |                     |     output store)   |                     |   |
| | -   Understand      |                     |                     |   |
| |     stateful vs     |                     |                     |   |
| |     stateless       |                     |                     |   |
| |     agents          |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PHASE 8 · Polish & Launch**                                         |
|                                                                       |
| Weeks 15--16 · \~22 hrs total · Goal: v1.0 personal app live          |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 15 --- Polish, Performance & Cowork Automation**               |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Audit all RLS   | -   Claude Code     | App loads fast, all |   |
| |     policies with   |     (full codebase  | auth verified,      |   |
| |     Claude Code     |     review)         | Cowork writes your  |   |
| |                     |                     | daily dev notes,    |   |
| | -   Optimise slow   | -   Claude Cowork   | Skills capture all  |   |
| |     queries         |     (dev            | your patterns       |   |
| |     (Supabase query |     automation)     |                     |   |
| |     analyser)       |                     |                     |   |
| |                     | -   Claude Skills   |                     |   |
| | -   Compress and    |     (custom         |                     |   |
| |     optimise images |     workflow)       |                     |   |
| |     (next/image)    |                     |                     |   |
| |                     | -   Supabase query  |                     |   |
| | -   Set up Claude   |     analyser        |                     |   |
| |     Cowork for      |                     |                     |   |
| |     daily dev       | -   next/image      |                     |   |
| |     journal         |     optimisation    |                     |   |
| |                     |                     |                     |   |
| | -   Build Claude    |                     |                     |   |
| |     Skill for       |                     |                     |   |
| |                     |                     |                     |   |
| |    project-specific |                     |                     |   |
| |     patterns        |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Week 16 --- Final Review & v1.0**                                   |
+-----------------------------------------------------------------------+
| +---------------------+---------------------+---------------------+   |
| | **🎯 Goals**        | **🛠 Tools**         | **🏗 Build**         |   |
| |                     |                     |                     |   |
| | -   Full end-to-end | -   Claude Code     | v1.0 tagged. Full   |   |
| |     flow test with  |     (project audit) | app live on Vercel. |   |
| |     Playwright      |                     | You can log habits, |   |
| |                     | -   Playwright      | set goals, get AI   |   |
| | -   Claude Code     |     (regression     | coaching, weekly    |   |
| |     full project    |     suite)          | summaries           |   |
| |     review          |                     | automated. Pipeline |   |
| |                     | -   GitHub releases | runs on every PR.   |   |
| | -   Fix top issues  |     (v1.0 tag)      |                     |   |
| |     identified      |                     |                     |   |
| |                     | -   Vercel (final   |                     |   |
| | -   Tag v1.0        |     production      |                     |   |
| |     release on      |     deploy)         |                     |   |
| |     GitHub          |                     |                     |   |
| |                     |                     |                     |   |
| | -   Optionally:     |                     |                     |   |
| |     connect custom  |                     |                     |   |
| |     domain          |                     |                     |   |
| +---------------------+---------------------+---------------------+   |
+-----------------------------------------------------------------------+

**🤖 Autonomous PR Review Agent --- Full Setup**

+-----------------------------------------------------------------------+
| **Autonomous PR Review Pipeline**                                     |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|   **1**   **👨‍💻 Developer** Pushes branch → opens PR on GitHub         |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|   **2**   **⚙️ GitHub      Triggers claude-pr-review.yml automatically |
|           Actions**                                                   |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|   **3**   **🤖 Claude Code Reads diff + CLAUDE.md + repo context      |
|           Action**                                                    |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|   **4**   **💬 Claude**    Posts inline review comments on the PR     |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|  **5**   **🌲 Trunk.io**  Runs code quality, linting, security checks |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|   **6**   **🎭             Runs full E2E test suite against the PR    |
|           Playwright**                                                |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
| **7**   **✅ All Green** PR is unblocked --- developer merges to main |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
|   **8**   **🚀 Vercel**    Auto-deploys new version to production     |
|                                                                       |
|   ---                                                                 |
| ---- ---------------- ----------------------------------------------- |
+-----------------------------------------------------------------------+

**Step 1 --- Create the Workflow File**

Create .github/workflows/claude-pr-review.yml in your repo:

+-----------------------------------------------------------------------+
| name: Claude PR Review                                                |
|                                                                       |
| on:                                                                   |
|                                                                       |
| pull_request:                                                         |
|                                                                       |
| types: \[opened, synchronize, reopened\]                              |
|                                                                       |
| paths: \[\"src/\*\*\", \"tests/\*\*\"\] \# only trigger on real code  |
| changes                                                               |
|                                                                       |
| jobs:                                                                 |
|                                                                       |
| claude-review:                                                        |
|                                                                       |
| runs-on: ubuntu-latest                                                |
|                                                                       |
| permissions:                                                          |
|                                                                       |
| contents: read                                                        |
|                                                                       |
| pull-requests: write                                                  |
|                                                                       |
| issues: write                                                         |
|                                                                       |
| steps:                                                                |
|                                                                       |
| \- uses: actions/checkout@v4                                          |
|                                                                       |
| with: { fetch-depth: 0 }                                              |
|                                                                       |
| \- name: Claude Code PR Review                                        |
|                                                                       |
| uses: anthropics/claude-code-action@beta                              |
|                                                                       |
| with:                                                                 |
|                                                                       |
| anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}                  |
|                                                                       |
| review_instructions: \|                                               |
|                                                                       |
| You are reviewing a personal Habit Tracker app.                       |
|                                                                       |
| Stack: Next.js 15, TypeScript, Supabase, MongoDB, Vercel              |
|                                                                       |
| Review for: security (RLS on all queries), TypeScript (no any),       |
|                                                                       |
| conventions (CLAUDE.md), tests (Playwright for new features),         |
|                                                                       |
| correct DB usage (Supabase=structured, MongoDB=AI data).              |
|                                                                       |
| Be constructive --- explain WHY, suggest fixes, praise good patterns. |
+-----------------------------------------------------------------------+

**Step 2 --- Add API Key Secret**

-   gh secret set ANTHROPIC_API_KEY --- paste your Anthropic API key
    when prompted

-   This links to your Anthropic account, separate from Claude Pro ---
    costs \~\$0.01--0.05 per PR review

-   For a personal project with infrequent PRs this is negligible ---
    budget \$1--2/month maximum

**Step 3 --- Add Trunk.io Quality Gate**

-   curl https://get.trunk.io -fsSL \| bash --- install Trunk CLI

-   trunk init --- auto-detects Next.js/TypeScript, enables ESLint,
    Prettier, security checks

-   Create .github/workflows/trunk.yml using: uses:
    trunk-io/trunk-action@v1

-   Commit .trunk/trunk.yaml --- this is the config file Trunk reads in
    CI

**Step 4 --- Add Playwright to CI**

-   Create .github/workflows/ci.yml with Node 20 setup, npm ci,
    playwright install, playwright test

-   Add Supabase URL and key as GitHub secrets: gh secret set
    NEXT_PUBLIC_SUPABASE_URL

-   Add MongoDB URI as secret: gh secret set MONGODB_URI

-   Upload playwright-report/ as artifact on failure so you can see what
    broke

  ---- ---------------------------------------------------------------------
  💡   Once all three workflows are live: push branch → Claude reviews PR →
       Trunk checks quality → Playwright runs tests → Vercel builds preview
       → all green → merge → Vercel auto-deploys. You never manually deploy
       again.

  ---- ---------------------------------------------------------------------

**🪙 Claude Code Token Best Practices**

  ---------------------- ------------------------------------------------
  **Practice**           **Why & How**

  **CLAUDE.md**          Claude reads this first every session ---
                         defines your whole project in one file, prevents
                         re-reading dozens of source files

  **.claudeignore**      Stops Claude reading node_modules, .next/, lock
                         files, images. Saves tokens on every single
                         operation

  **/compact regularly** Summarises long conversation history
                         mid-session. Run after completing each feature
                         --- keeps context lean

  **/clear between       Starting a fresh context for an unrelated task
  tasks**                is cheaper than carrying irrelevant file context
                         forward

  **Be specific in       \'Fix RLS in src/lib/db/habits.ts line 34\'
  prompts**              reads 1 file. \'Fix the auth\' reads your entire
                         codebase

  **Claude Skills**      Teach Claude your patterns once as a Skill. It
                         reads the skill definition instead of re-reading
                         examples

  **Scope PRs tightly**  Small focused PRs = less diff = fewer tokens in
                         the PR review agent = lower API cost

  **Path filters in CI** Add paths: \[\"src/\*\*\"\] to
                         claude-pr-review.yml so Claude doesn\'t trigger
                         on docs or config changes
  ---------------------- ------------------------------------------------

**💰 Complete Cost Summary**

  ------------------------ ---------------------------- --------------------
  **Tool**                 **What the Free Tier         **Monthly Cost**
                           Covers**                     

  **Claude Pro**           All Claude tools, Code,      **Your existing
                           Cowork, Chrome, Skills       sub**

  **Vercel Hobby**         Unlimited deploys, 100GB     **\$0**
                           bandwidth, personal use      

  **Supabase Free**        500MB Postgres, 1GB storage, **\$0**
                           50K MAUs                     

  **MongoDB Atlas M0**     512MB, free forever,         **\$0**
                           commercial OK                

  **GitHub (public)**      Unlimited repos + unlimited  **\$0**
                           Actions minutes              

  **Next.js / Tailwind /   Open source, no limits       **\$0**
  shadcn**                                              

  **Playwright / LangChain Open source, run locally     **\$0**
  / n8n**                                               

  **Trunk.io**             Free for open source /       **\$0**
                           public repos                 

  **Anthropic API (PR      \~\$0.01--0.05 per PR review **\~\$1--2/month**
  agent)**                                              
  ------------------------ ---------------------------- --------------------

+-----------------------------------------------------------------------+
| **Build the habit tracker. Learn every tool for real.**               |
|                                                                       |
| Every phase ships something working. Every week you understand more.  |
|                                                                       |
| Come back to Claude whenever you finish a phase, hit a wall, or want  |
| to go deeper.                                                         |
+-----------------------------------------------------------------------+