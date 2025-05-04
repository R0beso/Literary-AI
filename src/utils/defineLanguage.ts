
export function defineLanguage(): void {

    function changeLanguagePrivate(langPrivate: string): void {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', langPrivate);
        window.history.pushState({}, '', url);
        document.documentElement.lang = langPrivate;
    }

    const langPrivate = new URL(window.location.href).searchParams.get('lang');
    if (langPrivate === 'es' || langPrivate === 'en ') changeLanguagePrivate(langPrivate);
    else changeLanguagePrivate('en');

}


