// Google Apps Script for Lead Page Form Submissions + Global Control Integration
// Save this to your Google Sheet's Apps Script editor

const GC_API_KEY = '547b49b19c1bf6abb8abec2328d487221f4bc13c6b5359199001bf46d0e58ebe';
const GC_BASE_URL = 'https://api.globalcontrol.io/api/ai';
const GC_TAG_ID = '69e91ff580a5749c2a6e58a2'; // AEO Website Audit Lead tag

function doPost(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  if (e.parameter.method === "OPTIONS") {
    return ContentService.createTextOutput(JSON.stringify({"status": "ok"}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
  
  try {
    // Get form data
    var name = e.parameter.name || "";
    var email = e.parameter.email || "";
    var website = e.parameter.website || "";
    var source = e.parameter.source || "AEO Website Audit Lead Page";
    var timestamp = new Date();
    
    // Save to Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getRange(1, 1).getValue() === "") {
      sheet.getRange(1, 1, 1, 6).setValues([["Timestamp", "Name", "Email", "Website", "Source", "GC Sync"]]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    }
    
    // Try to sync with Global Control
    var gcSyncStatus = "Failed";
    try {
      // Create contact in Global Control
      var contactPayload = {
        email: email,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        customFields: [
          { key: 'website_url', value: website },
          { key: 'lead_source', value: source }
        ]
      };
      
      var contactOptions = {
        method: 'POST',
        headers: {
          'X-API-KEY': GC_API_KEY,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(contactPayload)
      };
      
      var contactResponse = UrlFetchApp.fetch(GC_BASE_URL + '/contacts', contactOptions);
      var contactData = JSON.parse(contactResponse.getContentText());
      
      if (contactData.type === 'response' && contactData.data) {
        // Apply tag
        var tagOptions = {
          method: 'POST',
          headers: {
            'X-API-KEY': GC_API_KEY,
            'Content-Type': 'application/json'
          },
          payload: JSON.stringify({ email: email })
        };
        
        UrlFetchApp.fetch(GC_BASE_URL + '/tags/fire-tag/' + GC_TAG_ID, tagOptions);
        gcSyncStatus = "Success";
      }
    } catch (gcError) {
      console.error('Global Control Error:', gcError);
      gcSyncStatus = "Failed: " + gcError.toString();
    }
    
    // Append to sheet
    sheet.appendRow([timestamp, name, email, website, source, gcSyncStatus]);
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Thanks! We'll send your audit within 24 hours.",
      "gcSync": gcSyncStatus
    })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Something went wrong. Please try again."
    })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "ok",
    "message": "Lead capture API is running with Global Control integration"
  })).setMimeType(ContentService.MimeType.JSON);
}
