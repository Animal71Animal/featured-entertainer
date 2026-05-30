/**
 * Featured Entertainer Sign-Up — Google Apps Script
 * Web app endpoint + sheet management
 */

const SHEET_NAME = 'SignUps';
const TAKEN_SHEET = 'TakenWeekends';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // === WRITE TO SIGNUPS SHEET ===
    let signupsSheet = ss.getSheetByName(SHEET_NAME);
    if (!signupsSheet) {
      signupsSheet = ss.insertSheet(SHEET_NAME);
      signupsSheet.appendRow([
        'Timestamp (MDT)',
        'Stage Name',
        'Phone',
        'Weekend Value',
        'Weekend Label',
        'Show Theme / Concept',
        'Costume Ideas',
        'Props / Special Requests',
        'Music Style / Genre',
        'Previous Performance Experience',
        'Instagram / Social Handle',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Dietary / Accessibility Needs',
        'Notes',
        'Status'
      ]);
      // Format header row
      signupsSheet.getRange(1, 1, 1, 16)
        .setFontWeight('bold')
        .setBackground('#c9a84c')
        .setFontColor('#0a0a0a');
      signupsSheet.setFrozenRows(1);
    }

    const timestamp = data.submittedAt || new Date().toLocaleString('en-US', {
      timeZone: 'America/Denver',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    signupsSheet.appendRow([
      timestamp,
      data.stageName || '',
      data.phone || '',
      data.weekend || '',
      data.weekendLabel || '',
      data.theme || '',
      data.costume || '',
      data.props || '',
      data.musicStyle || '',
      data.experience || '',
      data.socialHandle || '',
      data.emergencyName || '',
      data.emergencyPhone || '',
      data.accessibility || '',
      data.notes || '',
      data.status || 'Pending'
    ]);

    // === WRITE TO TAKEN WEEKENDS SHEET ===
    let takenSheet = ss.getSheetByName(TAKEN_SHEET);
    if (!takenSheet) {
      takenSheet = ss.insertSheet(TAKEN_SHEET);
      takenSheet.appendRow(['Weekend Value', 'Weekend Label', 'Stage Name', 'Taken At']);
      takenSheet.getRange(1, 1, 1, 4)
        .setFontWeight('bold')
        .setBackground('#c9a84c')
        .setFontColor('#0a0a0a');
      takenSheet.setFrozenRows(1);
    }

    takenSheet.appendRow([
      data.weekend || '',
      data.weekendLabel || '',
      data.stageName || '',
      timestamp
    ]);

    return jsonResponse({ ok: true, message: 'Sign-up recorded' });

  } catch (err) {
    console.error('Apps Script error:', err);
    return jsonResponse({ error: err.message }, 500);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'weekends') {
    return getAvailableWeekends();
  }

  return jsonResponse({ error: 'Unknown action. Use ?action=weekends' }, 400);
}

function getAvailableWeekends() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const takenSheet = ss.getSheetByName(TAKEN_SHEET);

  const ALL_WEEKENDS = [
    { value: '2026-07-10', label: 'July 10 & 11, 2026 (Fri–Sat)' },
    { value: '2026-07-24', label: 'July 24 & 25, 2026 (Fri–Sat)' },
    { value: '2026-08-07', label: 'August 7 & 8, 2026 (Fri–Sat)' },
    { value: '2026-08-21', label: 'August 21 & 22, 2026 (Fri–Sat)' },
    { value: '2026-09-04', label: 'September 4 & 5, 2026 (Fri–Sat)' },
    { value: '2026-09-18', label: 'September 18 & 19, 2026 (Fri–Sat)' },
    { value: '2026-10-02', label: 'October 2 & 3, 2026 (Fri–Sat)' },
    { value: '2026-10-16', label: 'October 16 & 17, 2026 (Fri–Sat)' },
    { value: '2026-10-30', label: 'October 30 & 31, 2026 (Fri–Sat)' },
  ];

  let takenValues = [];
  if (takenSheet) {
    const data = takenSheet.getDataRange().getValues();
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) takenValues.push(String(data[i][0]).trim());
    }
  }

  const available = ALL_WEEKENDS.filter(w => !takenValues.includes(w.value));
  const taken = ALL_WEEKENDS.filter(w => takenValues.includes(w.value));

  return jsonResponse({ available, taken });
}

function jsonResponse(obj, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
