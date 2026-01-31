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
  const summary = { success: 0, failure: 0, duplicates: 0, updated: 0, details: [] };

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
      
      const headers = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value;
      });

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber]] = cell.value;
        });
        results.push(rowData);
      });
    }

    for (const row of results) {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        if (key) normalizedRow[key.trim().toLowerCase()] = row[key];
      });

      const name = normalizedRow['name'];
      const email = normalizedRow['email'];
      const mobile = normalizedRow['mobile'];
      const company = normalizedRow['company'];
      const accessFlag = normalizedRow['accessflag'];

      if (!name || !email || !mobile) {
        summary.failure++;
        summary.details.push({ email: email || 'Unknown', error: 'Missing mandatory fields' });
        continue;
      }

      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        // Check if details are different
        const isDifferent = 
          existingUser.name !== name || 
          existingUser.mobile !== mobile.toString() || 
          existingUser.company !== (company || '') || 
          existingUser.accessFlag !== (String(accessFlag).toLowerCase() === 'false' ? false : true);

        if (isDifferent) {
          existingUser.name = name;
          existingUser.mobile = mobile.toString();
          existingUser.company = company || '';
          existingUser.accessFlag = String(accessFlag).toLowerCase() === 'false' ? false : true;
          await existingUser.save();
          summary.updated++;
        } else {
          summary.duplicates++;
        }
        continue;
      }

      const tempPassword = generateTempPassword(name.toString(), mobile.toString());
      
      try {
        await User.create({
          name: name,
          email: email,
          mobile: mobile.toString(),
          password: tempPassword,
          company: company || '',
          accessFlag: String(accessFlag).toLowerCase() === 'false' ? false : true,
          firstLoginRequired: true
        });
        summary.success++;
      } catch (err) {
        summary.failure++;
        summary.details.push({ email: email, error: err.message });
      }
    }

    fs.unlinkSync(filePath);
    res.json(summary);
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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

const exportUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Access Flag', key: 'accessFlag', width: 15 },
      { header: 'First Login Required', key: 'firstLoginRequired', width: 20 }
    ];

    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        company: user.company,
        accessFlag: user.accessFlag,
        firstLoginRequired: user.firstLoginRequired
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'users_export.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, mobile, company, accessFlag } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (company !== undefined) user.company = company;
    if (accessFlag !== undefined) user.accessFlag = accessFlag;

    await user.save();
    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

module.exports = { bulkImport, getUsers, exportUsers, updateUser };
