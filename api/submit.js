// Vercel serverless function — Featured Entertainer sign-up submissions
// Forwards to Google Apps Script + posts to Discord

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = '1498173573477433378';
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const {
    stageName, phone, weekend, weekendLabel, theme,
    costume, props, experience, socialHandle,
    notes, submittedAt
  } = body;

  if (!stageName || !phone || !weekend) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const timestamp = new Date(submittedAt || Date.now()).toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const errors = [];

  // 1. Forward to Google Apps Script
  if (GOOGLE_SCRIPT_URL) {
    try {
      const sheetResp = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!sheetResp.ok) {
        const errText = await sheetResp.text();
        errors.push(`Sheets: ${sheetResp.status} ${errText}`);
      }
    } catch (e) {
      errors.push(`Sheets error: ${e.message}`);
    }
  }

  // 2. Post to Discord
  if (DISCORD_TOKEN) {
    try {
      const fields = [
        { name: 'Stage Name', value: stageName, inline: true },
        { name: 'Phone', value: phone, inline: true },
        { name: 'Weekend', value: weekendLabel || weekend, inline: false },
      ];
      if (theme) fields.push({ name: 'Show Theme', value: theme.substring(0, 1024), inline: false });
      if (costume) fields.push({ name: 'Costume Ideas', value: costume.substring(0, 1024), inline: false });
      if (props) fields.push({ name: 'Props / Requests', value: props.substring(0, 1024), inline: false });
      if (socialHandle) fields.push({ name: 'Social', value: socialHandle, inline: true });

      const discordMsg = {
        embeds: [{
          title: '🎤 New Featured Entertainer Sign-Up',
          color: 0xc9a84c,
          fields,
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

  if (errors.length > 0) {
    console.error('Submission errors:', errors);
  }

  return res.status(200).json({ ok: true });
}
