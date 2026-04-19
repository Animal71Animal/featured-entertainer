/**
 * GOOGLE APPS SCRIPT — Featured Entertainer Sign-Ups
 * 
 * SETUP STEPS (one-time, takes 2 minutes):
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    Name it: "Featured Entertainer Sign-Ups"
 * 2. Go to Extensions > Apps Script
 * 3. Delete the default code and paste this entire script
 * 4. Click Save (disk icon)
 * 5. Click Deploy > New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy, authorize when prompted
 * 7. Copy the Web App URL and send it to Animal/PriScylla
 *    (it will be set as GOOGLE_SCRIPT_URL in Vercel)
 */

const SHEET_NAME = 'Sign-Ups';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get or create the sheet
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers
      sheet.appendRow(['Submitted', 'Stage Name', 'Phone', 'Weekend', 'Theme/Concept']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#c9a84c');
    }
    
    // Append the new submission
    sheet.appendRow([
      data.submittedAt || new Date().toLocaleString(),
      data.stageName || '',
      data.phone || '',
      data.weekendLabel || data.weekend || '',
      data.theme || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this manually to verify setup
function testSetup() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        stageName: 'Test Performer',
        phone: '(208) 555-0000',
        weekend: '2026-06-05',
        weekendLabel: 'June 5 & 6, 2026 (Fri–Sat)',
        theme: 'Test entry — setup verification',
        submittedAt: new Date().toLocaleString()
      })
    }
  };
  const result = doPost(testData);
  Logger.log(result.getContent());
}
