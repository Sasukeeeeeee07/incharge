const User = require('../models/User');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');

const generateTempPassword = (name, mobile) => {
  const namePart = name.substring(0, 2).toUpperCase();
  const mobilePart = mobile.toString().slice(-4);
  return `${namePart}${mobilePart}`;
};

const bulkImport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const results = [];
  const summary = { success: 0, failure: 0, duplicates: 0, details: [] };

  try {
    if (req.file.originalname.endsWith('.csv')) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      
      // Get headers from first row
      const headers = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value;
      });

      // Iterate remaining rows
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip headers
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber]] = cell.value;
        });
        results.push(rowData);
      });
    }

    for (const row of results) {
      const { Name, Email, Mobile, Company, AccessFlag } = row;

      if (!Name || !Email || !Mobile) {
        summary.failure++;
        summary.details.push({ email: Email || 'Unknown', error: 'Missing mandatory fields' });
        continue;
      }

      const existingUser = await User.findOne({ email: Email });
      if (existingUser) {
        summary.duplicates++;
        summary.details.push({ email: Email, error: 'Duplicate user' });
        continue;
      }

      const tempPassword = generateTempPassword(Name, Mobile);
      
      try {
        await User.create({
          name: Name,
          email: Email,
          mobile: Mobile,
          password: tempPassword,
          company: Company || '',
          accessFlag: String(AccessFlag).toLowerCase() === 'false' ? false : true,
          firstLoginRequired: true
        });
        summary.success++;
      } catch (err) {
        summary.failure++;
        summary.details.push({ email: Email, error: err.message });
      }
    }

    fs.unlinkSync(filePath); // Delete temporary file
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports = { bulkImport, getUsers };
