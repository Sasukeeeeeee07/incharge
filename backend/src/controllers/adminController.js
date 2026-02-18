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
  try {
    console.log('Debug Import: Request received');
    if (!req.file) {
      console.log('Debug Import: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log(`Debug Import: File uploaded to ${filePath}`);

    const results = [];
    const summary = { success: 0, failure: 0, duplicates: 0, updated: 0, details: [] };

    try {
      if (req.file.originalname.endsWith('.csv')) {
        console.log('Debug Import: Parsing CSV');
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', resolve)
            .on('error', reject);
        });
      } else {
        console.log('Debug Import: Parsing Excel');
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

      console.log(`Debug Import: Parsed ${results.length} rows`);

      for (const row of results) {
        // ... (rest of processing) ...
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          if (key) normalizedRow[key.trim().toLowerCase()] = row[key];
        });

        const name = normalizedRow['name'];
        const email = normalizedRow['email'];
        const mobile = normalizedRow['mobile'];
        const company = normalizedRow['company'];
        const accessFlag = normalizedRow['accessflag'];

        // console.log(`Debug Import: Processing ${email}`);

        if (!name || !email || !mobile) {
          summary.failure++;
          summary.details.push({ email: email || 'Unknown', error: 'Missing mandatory fields' });
          continue;
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          // ... update logic ...
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
      console.log('Debug Import: Completed successfully');
      res.json(summary);
    } catch (err) {
      console.error('Debug Import: Processing Error', err);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Import failed: ' + err.message });
    }
  } catch (outerErr) {
    console.error('Debug Import: Outer Error', outerErr);
    res.status(500).json({ error: 'Import failed: ' + outerErr.message });
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

const createUsers = async (req, res) => {
  const { users } = req.body;
  console.log('Debug CreateUsers: Received payload', JSON.stringify(req.body));

  if (!users || !Array.isArray(users)) {
    console.error('Debug CreateUsers: Invalid payload format');
    return res.status(400).json({ error: 'Valid users array required' });
  }

  const summary = { success: 0, failure: 0, duplicates: 0, updated: 0, details: [] };

  try {
    for (const userData of users) {
      const { name, email, mobile, company } = userData;
      console.log(`Debug CreateUsers: Processing user ${email}`);

      if (!name || !email || !mobile) {
        console.warn(`Debug CreateUsers: Missing fields for ${email}`);
        summary.failure++;
        summary.details.push({ email: email || 'Unknown', error: 'Missing mandatory fields (Name, Email, Mobile)' });
        continue;
      }

      // Check existence
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        console.warn(`Debug CreateUsers: User already exists ${email}`);
        summary.duplicates++;
        // Optional: Update user if exists? For now, just skip/report duplicate as per current logic
        summary.details.push({ email, error: 'User already exists' });
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
          accessFlag: true,
          firstLoginRequired: true
        });
        console.log(`Debug CreateUsers: Created user ${email}`);
        summary.success++;
      } catch (err) {
        console.error(`Debug CreateUsers: Creation error for ${email}`, err);
        summary.failure++;
        summary.details.push({ email: email, error: err.message });
      }
    }

    console.log('Debug CreateUsers: Completed summary', summary);
    res.json(summary);
  } catch (err) {
    console.error('Debug CreateUsers: Critical error', err);
    res.status(500).json({ error: 'Creation failed: ' + err.message });
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

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Debug DeleteUser: Request to delete user ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      console.log(`Debug DeleteUser: User ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      console.log(`Debug DeleteUser: Attempt to delete admin ${userId} blocked`);
      return res.status(403).json({ error: 'Admins cannot be deleted' });
    }

    await User.findByIdAndDelete(userId);
    console.log(`Debug DeleteUser: User ${userId} deleted successfully`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(`Debug DeleteUser: Error deleting user:`, err);
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Direct assignment triggers pre-save hash
    user.password = newPassword;
    // We might want to set firstLoginRequired to true?
    // For admin reset, usually yes, force them to change it again? 
    // Or just set it. Let's set it and arguably set firstLoginRequired = true so they change it.
    // user.firstLoginRequired = true; // Optional: let's stick to just changing it for now as requested.

    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = { bulkImport, getUsers, exportUsers, updateUser, createUsers, deleteUser, resetUserPassword };
