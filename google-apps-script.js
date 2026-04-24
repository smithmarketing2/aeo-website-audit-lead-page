/**
 * Google Apps Script for AEO Website Audit Lead Capture
 * Deploy as Web App with "Execute as me" and "Anyone" access
 */

function doPost(e) {
  // CORS headers
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  // Handle preflight request
  if (e.parameter && e.parameter.method === "OPTIONS") {
    return ContentService.createTextOutput(JSON.stringify({"status": "ok"}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
  
  try {
    // Get active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Create headers if first row is empty
    if (sheet.getRange(1, 1).getValue() === "") {
      sheet.getRange(1, 1, 1, 5).setValues([["Timestamp", "Name", "Email", "Source", "Page URL"]]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    
    // Get form data from parameters
    var name = e.parameter.name || "";
    var email = e.parameter.email || "";
    var source = e.parameter.source || "aeo-website-audit";
    var pageUrl = e.parameter.pageUrl || "";
    var timestamp = new Date();
    
    // Append row
    sheet.appendRow([timestamp, name, email, source, pageUrl]);
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Thanks! Check your email for your audit."
    })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
      
  } catch (error) {
    // Return success anyway so user experience isn't broken
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Thanks! Check your email for your audit."
    })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "ok",
    "message": "AEO Website Audit Lead Capture API is running"
  })).setMimeType(ContentService.MimeType.JSON);
}