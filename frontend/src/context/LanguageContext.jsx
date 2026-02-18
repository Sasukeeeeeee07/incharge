import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [languages, setLanguages] = useState([]);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch available languages on mount
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/content/languages`);
                setLanguages(res.data);
            } catch (err) {
                console.error('Failed to fetch languages', err);
            }
        };
        fetchLanguages();
    }, []);

    // Fetch translations when language changes
    useEffect(() => {
        const fetchTranslations = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/content/translations?lang=${currentLanguage}`);
                setTranslations(prev => ({ ...prev, [currentLanguage]: res.data }));
            } catch (err) {
                console.error(`Failed to fetch translations for ${currentLanguage}`, err);
            } finally {
                setLoading(false);
            }
        };

        if (currentLanguage) {
            if (!translations[currentLanguage]) {
                fetchTranslations();
            } else {
                setLoading(false);
            }
        }
    }, [currentLanguage]);

    const t = (key) => {
        if (!translations[currentLanguage]) return key;
        return translations[currentLanguage][key] || key;
    };

    const value = {
        languages,
        currentLanguage,
        setCurrentLanguage,
        t,
        loading
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
