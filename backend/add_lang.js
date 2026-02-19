const mongoose = require('mongoose');
const Language = require('./src/models/Language');

mongoose.connect('mongodb://localhost:27017/keval')
  .then(async () => {
    try {
      await Language.findOneAndUpdate(
        { code: 'ml' },
        { name: 'Malayalam', nativeName: 'മലയാളം', isActive: true },
        { upsert: true }
      );
      console.log('Successfully upserted Malayalam');
    } catch (err) {
      console.error(err);
    } finally {
      mongoose.disconnect();
    }
  });
