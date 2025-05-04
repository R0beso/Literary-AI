
export function changeLanguageURL(): void {

    function changeLanguagePrivate(lang: string): void {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);
        document.documentElement.lang = lang;
    }

    const lang = new URL(window.location.href).searchParams.get('lang');
    if (lang === 'en') changeLanguagePrivate('es');
    else changeLanguagePrivate('en');
    
}