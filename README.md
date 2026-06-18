# Local Lead Hunter AI - Production Ready SaaS Dashboard

Local Lead Hunter AI is a production-ready Node.js + Express + HTML/CSS/JS application that implements a sequential multi-agent workflow to automate local lead generation, presence verification, rating analysis, and cold email outreach.

---

## 🚀 Key Features

* **Sleek SaaS Dashboard**: Modern, responsive dark mode layout utilizing Outfit and Plus Jakarta Sans typography, featuring rich gradients, interactive tables, statistic cards, settings managers, and live progress indicators.
* **Agent 1 - Lead Finder**: Fetches business details (name, website, phone, address, rating) by scraping Google Maps with Playwright or querying the OpenStreetMap Nominatim/Overpass API.
* **Agent 2 - Lead Verifier**: Validates presence by checking website HTTP responses (200 status checks), HTTPS capabilities, phone format validity, and duplicate checks, computing a lead score out of 100. Discards leads scoring &le; 60.
* **Agent 3 - Review Analyzer**: Scrapes customer reviews and employs LLMs to identify specific business weaknesses, complaints, and pain points (such as "slow quotes" or "no online scheduling").
* **Agent 4 - Email Writer**: Drafts highly personalized cold outreach emails targeting the exact complaints identified by Agent 3 using a fallback AI routing system.
* **Robust Export Formats**: Instant downloads of verified leads in CSV, JSON, and TXT format containing all business metrics and generated emails.
* **Bulk Location Scanner**: Supports executing single-city searches or bulk searches for up to 100 cities in a single queued task with real-time UI logging.

---

## 🛠️ Multi-Agent Architecture

1. **Lead Finder (Agent 1)**: Query OSM coordinates -> Query Overpass tags or search Google Maps via Playwright -> Return JSON.
2. **Lead Verifier (Agent 2)**: Ping website domain -> Check HTTPS -> Match phone format -> Calculate score:
   * Website resolves (HTTP 200) = `+25`
   * Phone exists and is valid = `+25`
   * Review rating > 4.0 = `+25`
   * Total review count > 20 = `+25`
   * *Keeps leads scoring > 60.*
3. **Review Analyzer (Agent 3)**: Scrapes reviews -> LLM parses weaknesses -> Save to reviews database.
4. **Email Writer (Agent 4)**: Pulls weaknesses -> Crafts tailored email -> Integrates fallback LLM client (Gemini -> OpenRouter -> Ollama) -> Save email to database.

---

## 💻 Prerequisites

* **Node.js**: Version 18.0.0 or higher.
* **SQLite3**: Handled automatically via native compilation or pre-built binaries (with dynamic fallback logic).
* **LLM Engine**:
  * For Gemini: A free API Key from Google AI Studio.
  * For OpenRouter: A free API Key from OpenRouter.ai (uses `google/gemini-2.5-flash:free`).
  * For Ollama (optional): Local Ollama server running on `http://localhost:11434` with model `llama3.2` or similar.

---

## 📦 Setup & Installation

### One-Click Quick Start (Windows PowerShell)

In your terminal, navigate to the project directory and run the following command to initialize and start the app:

```powershell
# 1. Install Node modules
npm install

# 2. Download Playwright browser binaries
npx playwright install chromium

# 3. Start the application
npm start
```

### Manual Starting

If you need to customize ports or use environment files:
1. Create a `.env` file in the root directory (based on `.env.example`).
2. Run `npm start` to spin up the local webserver on port `3000`.
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔒 Configuration & Settings

Once the dashboard is loaded, navigate to the **Settings** view in the left sidebar:
1. **Gemini API Key**: Add your key to activate Google Gemini 1.5 Flash (Free Tier) email and review analysis.
2. **OpenRouter API Key**: Input your key to enable fallback options using free OpenRouter endpoints.
3. **Ollama Host / Model**: Customize endpoints (defaults to `http://localhost:11434` and model `llama3.2`).
4. **Scraper Mode Toggle**: Enable or disable the Playwright Google Maps scraper. When disabled, the application fetches business data directly from the OpenStreetMap API (bypassing any network scrape limits).

---

## 🗄️ Database Schema

The system initializes a SQLite database file called `leads.db` in the root folder with the following tables:
* `leads`: Stores unique business records, scores, coordinates, address, and processing status.
* `reviews`: Houses scraped customer reviews, sentiments, and weaknesses tags.
* `generated_emails`: Holds custom email outreach scripts, subjects, and the AI model used for generation.
* `settings`: Stores configuration keys and values securely.
