// Theme handling
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
    body.setAttribute('data-bs-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-bs-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
});

// Language handling (basic – expand later with real translations)
const langButtons = {
    en: document.getElementById('lang-en'),
    vn: document.getElementById('lang-vn')
};

function applyLanguage(lang) {
    // For now just visual feedback + save
    // Later: swap text content, change <html lang="...">, etc.
    document.documentElement.lang = lang === 'vn' ? 'vi' : 'en';
    localStorage.setItem('language', lang);

    // Example: add class to body for CSS-based translations if you use them
    document.body.classList.remove('lang-en', 'lang-vn');
    document.body.classList.add(`lang-${lang}`);
}

// Load saved language or default to en
const savedLang = localStorage.getItem('language') || 'en';
applyLanguage(savedLang);

langButtons.en.addEventListener('click', () => applyLanguage('en'));
langButtons.vn.addEventListener('click', () => applyLanguage('vn'));
