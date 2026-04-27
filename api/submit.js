// Vercel serverless function — handles Featured Entertainer sign-up submissions
// Posts to Discord #featured-entertainer + sends to Google Sheets via Apps Script

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = '1498173573477433378';
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL; // set after Apps Script deploy

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { stageName, phone, weekend, weekendLabel, theme, submittedAt } = req.body;

  if (!stageName || !phone || !weekend) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const timestamp = new Date(submittedAt || Date.now()).toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const errors = [];

  // 1. Post to Discord
  if (DISCORD_TOKEN) {
    try {
      const discordMsg = {
        embeds: [{
          title: '🎤 New Featured Entertainer Sign-Up',
          color: 0xc9a84c,
          fields: [
            { name: 'Stage Name', value: stageName, inline: true },
            { name: 'Phone', value: phone, inline: true },
            { name: 'Weekend', value: weekendLabel || weekend, inline: false },
            ...(theme ? [{ name: 'Show Theme / Concept', value: theme, inline: false }] : []),
          ],
          footer: { text: `Submitted ${timestamp} MDT` }
        }]
      };

      const discordResp = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discordMsg)
      });

      if (!discordResp.ok) {
        const err = await discordResp.text();
        errors.push(`Discord: ${discordResp.status} ${err}`);
      }
    } catch (e) {
      errors.push(`Discord error: ${e.message}`);
    }
  }

  // 2. Send to Google Sheets via Apps Script
  if (GOOGLE_SCRIPT_URL) {
    try {
      const sheetResp = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageName, phone, weekend, weekendLabel, theme, submittedAt: timestamp })
      });
      if (!sheetResp.ok) errors.push(`Sheets: ${sheetResp.status}`);
    } catch (e) {
      errors.push(`Sheets error: ${e.message}`);
    }
  }

  if (errors.length > 0) {
    console.error('Submission errors:', errors);
  }

  return res.status(200).json({ ok: true });
}
