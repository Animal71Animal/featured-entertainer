# Featured Entertainer — Google Apps Script Setup

## What This Does

- **doPost()**: Receives sign-up submissions from the website, writes to two sheets:
  - `SignUps` — all entertainer applications with full details
  - `TakenWeekends` — booked weekends (used to filter available dates)
- **doGet(action=weekends)**: Returns available weekends (excludes taken ones)

## Setup Steps

1. **Create a new Google Sheet**
   - Go to https://sheets.new
   - Name it: `Featured Entertainer Sign-Ups`

2. **Open Apps Script**
   - Extensions → Apps Script
   - Delete the default `myFunction()` code
   - Paste the entire contents of `Code.gs`
   - Save (Ctrl+S)

3. **Deploy as Web App**
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the **Web app URL**

4. **Update the website**
   - Replace the `APPS_SCRIPT_URL` in `index.html` with your new URL
   - Update `GOOGLE_SCRIPT_URL` in `vercel.json` (for the Vercel API fallback)
   - Redeploy to Vercel

## Sheet Structure (Auto-Created)

### SignUps sheet
| Column | Field |
|--------|-------|
| A | Timestamp (MDT) |
| B | Stage Name |
| C | Phone |
| D | Weekend Value |
| E | Weekend Label |
| F | Show Theme / Concept |
| G | Costume Ideas |
| H | Props / Special Requests |
| I | Music Style / Genre |
| J | Previous Performance Experience |
| K | Instagram / Social Handle |
| L | Emergency Contact Name |
| M | Emergency Contact Phone |
| N | Dietary / Accessibility Needs |
| O | Notes |
| P | Status |

### TakenWeekends sheet
| Column | Field |
|--------|-------|
| A | Weekend Value |
| B | Weekend Label |
| C | Stage Name |
| D | Taken At |

## How It Works

1. Entertainer visits the site → frontend calls `doGet(action=weekends)`
2. Apps Script reads `TakenWeekends` sheet → returns only available dates
3. Entertainer fills form → frontend calls `doPost()`
4. Apps Script writes to both sheets atomically (with lock)
5. Next visitor won't see the taken weekend

## Security Notes

- The web app is public (Anyone can access) — this is required for the website to call it
- No API key needed
- LockService prevents race conditions if two people submit simultaneously
- CORS headers allow cross-origin requests from the Vercel domain
