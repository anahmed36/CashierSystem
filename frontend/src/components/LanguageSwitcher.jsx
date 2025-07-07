import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-1">
            <Button
                variant={i18n.language === 'en' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('en')}
            >
                EN
            </Button>
            <Button
                variant={i18n.language === 'ar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('ar')}
            >
                AR
            </Button>
        </div>
    );
};