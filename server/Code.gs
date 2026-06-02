/**
 * Google Apps Script — Cổng kết nối dữ liệu (Backend Proxy) cho BIDV Hà Đông
 * Dán mã này vào phần Extensions -> Apps Script trên Google Sheet của bạn.
 *
 * Cấu hình:
 * 1. Mở Sheet của bạn.
 * 2. Chọn Extensions (Tiện ích mở rộng) -> Apps Script.
 * 3. Xoá mọi code cũ và dán code này vào.
 * 4. Nhấp vào Deploy (Triển khai) -> New deployment (Triển khai mới).
 *    - Select type (Chọn loại): Web app (Ứng dụng web).
 *    - Execute as (Chạy dưới danh nghĩa): Me (Tôi).
 *    - Who has access (Ai có quyền truy cập): Anyone (Bất kỳ ai).
 * 5. Copy Web App URL vừa được tạo và dán vào file .env với key GOOGLE_SCRIPT_URL.
 * 
 * Lưu ý bảo mật:
 * Bạn có thể cấu hình thuộc tính AUTH_TOKEN trong phần Settings -> Script Properties
 * để tránh người ngoài tự tiện gửi dữ liệu vào Apps Script của bạn.
 */

const AUTH_TOKEN = "BIDV_HADONG_SECRET_2026"; // Nên trùng khớp với AUTH_TOKEN trong file .env

function checkAuth(e) {
  // Kiểm tra token gửi từ Next.js
  const token = e.parameter.token || "";
  if (token !== AUTH_TOKEN) {
    throw new Error("Unauthorized access. Invalid auth token.");
  }
}

/**
 * Xử lý GET request — Admin lấy dữ liệu submissions hiển thị lên bảng điều khiển
 */
function doGet(e) {
  try {
    checkAuth(e);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    const result = {};

    sheets.forEach(sheet => {
      const name = sheet.getName();
      // Chỉ lấy dữ liệu từ các sheet biểu mẫu BM01 và BM02
      if (name === "BM01" || name === "BM02") {
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) {
          result[name] = [];
          return;
        }

        const headers = data[0];
        const rows = data.slice(1);

        result[name] = rows.map((row, rowIdx) => {
          const item = { _rowId: rowIdx + 2 }; // Dòng bắt đầu từ 2 (dòng 1 là header)
          headers.forEach((header, colIdx) => {
            item[header] = row[colIdx];
          });
          return item;
        });
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý POST request — Khách hàng gửi hồ sơ trực tuyến từ Form Wizard
 */
function doPost(e) {
  try {
    // Đọc payload gửi lên
    const payload = JSON.parse(e.postData.contents);
    
    // Kiểm tra token bảo mật
    if (payload.token !== AUTH_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid auth token"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const { mucDich, doiTuong, data } = payload;
    const bmType = mucDich === "cap-lai-mat-khau" ? "BM02" : "BM01";

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(bmType);
    
    // Nếu sheet chưa tồn tại, tự động tạo sheet mới
    if (!sheet) {
      sheet = spreadsheet.insertSheet(bmType);
    }

    // Chuẩn bị dữ liệu để ghi
    const timestamp = new Date().toISOString();
    const record = {
      "SYSTEM_TIMESTAMP": timestamp,
      "SYSTEM_MUC_DICH": mucDich,
      "SYSTEM_DOI_TUONG": doiTuong,
      ...data
    };

    // Đọc hàng tiêu đề hiện tại của Sheet
    let headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // Nếu sheet trống, khởi tạo hàng tiêu đề
    if (headers.length === 0 || headers[0] === "") {
      headers = Object.keys(record);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1B7070")
                 .setFontColor("#FFFFFF")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else {
      // Nếu có key mới trong record mà chưa có trong headers, tự động thêm cột mới
      let headersChanged = false;
      Object.keys(record).forEach(key => {
        if (headers.indexOf(key) === -1) {
          headers.push(key);
          headersChanged = true;
        }
      });

      if (headersChanged) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        // Update styling cho header mới
        sheet.getRange(1, sheet.getLastColumn(), 1, headers.length - sheet.getLastColumn() + 1)
             .setBackground("#1B7070")
             .setFontColor("#FFFFFF")
             .setFontWeight("bold")
             .setHorizontalAlignment("center");
      }
    }

    // Sắp xếp dữ liệu theo thứ tự cột tiêu đề và ghi hàng mới
    const rowValues = headers.map(header => record[header] !== undefined ? record[header] : "");
    sheet.appendRow(rowValues);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data recorded successfully",
      timestamp
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
