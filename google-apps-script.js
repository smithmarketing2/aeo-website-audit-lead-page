/**
 * Google Apps Script for AEO Website Audit Lead Capture
 * Deploy as Web App with "Execute as me" and "Anyone" access
 */

const SHEET_NAME = 'Leads';
const SPREADSHEET_ID = '{{SPREADSHEET_ID}}'; // Will be set after sheet creation

function doPost(e) {
  try {
    // Parse JSON payload
    var data = JSON.parse(e.postData.contents);
    
    // Get or create spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Business', 'Website', 'Source']);
      // Format header row
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }
    
    // Append lead data
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.business || '',
      data.website || '',
      data.source || 'aeo-website-audit'
    ]);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Lead captured' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'AEO Audit Lead Capture API' }))
    .setMimeType(ContentService.MimeType.JSON);
}
