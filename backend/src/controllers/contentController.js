const Language = require('../models/Language');
const Translation = require('../models/Translation');

// Get all active languages
const getLanguages = async (req, res) => {
    try {
        const languages = await Language.find({ isActive: true }).select('code name nativeName -_id');
        res.json(languages);
    } catch (err) {
        console.error('Error fetching languages:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get translations for a specific language
const getTranslations = async (req, res) => {
    try {
        const { lang } = req.query;
        if (!lang) return res.status(400).json({ error: 'Language code required' });

        const translations = await Translation.find({ languageCode: lang });

        // Convert array to object { key: value }
        const translationMap = {};
        translations.forEach(t => {
            translationMap[t.key] = t.value;
        });

        res.json(translationMap);
    } catch (err) {
        console.error('Error fetching translations:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create or Update Translation (Admin only - for future use)
const upsertTranslation = async (req, res) => {
    try {
        const { languageCode, key, value, section } = req.body;

        const translation = await Translation.findOneAndUpdate(
            { languageCode, key },
            { value, section },
            { upsert: true, new: true }
        );

        res.json(translation);
    } catch (err) {
        console.error('Error updating translation:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getLanguages, getTranslations, upsertTranslation };
