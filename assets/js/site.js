(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('#themeToggle');
  const welcomeMessage = document.querySelector('#welcomeMessage');
  const bibleVerse = document.querySelector('#bibleVerse');
  const countdown = document.querySelector('#nextEventCountdown');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let timer;

  const events = [
    { day: 0, hour: 19, minute: 30, labelDay: 'Domingo', labelTime: '19h30', type: 'Culto' },
    { day: 3, hour: 19, minute: 30, labelDay: 'Quarta-feira', labelTime: '19h30', type: 'Culto' },
    { day: 5, hour: 19, minute: 30, labelDay: 'Sexta-feira (PG)', labelTime: '19h30', type: 'PG' },
    { day: 6, hour: 8, minute: 45, labelDay: 'Sábado', labelTime: '08h45', type: 'Culto' }
  ];
  const regularVerses = [
    ['“Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.”', 'João 3:16'],
    ['“Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.”', 'Mateus 11:28'],
    ['“O Senhor é a minha luz e a minha salvação; a quem temerei?”', 'Salmo 27:1'],
    ['“Confia no Senhor de todo o teu coração.”', 'Provérbios 3:5']
  ];
  const sabbathVerses = [
    ['“Lembra-te do dia de sábado, para o santificar.”', 'Êxodo 20:8'],
    ['“Cheguemos, pois, com confiança ao trono da graça.”', 'Hebreus 4:16']
  ];

  function isSabbath() { const now = new Date(); return (now.getDay() === 5 && now.getHours() >= 18) || (now.getDay() === 6 && now.getHours() < 18); }
  function applySabbath() { root.classList.toggle('sabbath-mode', isSabbath()); }
  function applyTheme(theme) { const dark = theme === 'dark'; root.classList.toggle('dark-theme', dark); themeToggle?.setAttribute('aria-pressed', String(dark)); themeToggle?.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro'); const icon = themeToggle?.querySelector('i'); if (icon) icon.className = `fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`; }
  function initTheme() { const saved = localStorage.getItem('theme'); applyTheme(saved || (prefersDark.matches ? 'dark' : 'light')); }
  function updateVerse() { const verses = isSabbath() ? sabbathVerses : regularVerses; const [text, reference] = verses[Math.floor(Math.random() * verses.length)]; if (bibleVerse) bibleVerse.innerHTML = `${text}<cite>${reference}</cite>`; }
  function nextEvent() { const now = new Date(); return events.map((event) => { const date = new Date(now); date.setDate(date.getDate() + ((event.day - date.getDay() + 7) % 7)); date.setHours(event.hour, event.minute, 0, 0); if (date <= now) date.setDate(date.getDate() + 7); return { ...event, date }; }).sort((a, b) => a.date - b.date)[0]; }
  function formatDistance(milliseconds) { const minutes = Math.max(0, Math.ceil(milliseconds / 60000)); const days = Math.floor(minutes / 1440); const hours = Math.floor((minutes % 1440) / 60); const mins = minutes % 60; return [days && `${days} dia${days > 1 ? 's' : ''}`, hours && `${hours}h`, mins && `${mins}min`].filter(Boolean).join(' ') || 'menos de um minuto'; }
  function updateCountdown() { const event = nextEvent(); if (!event || !countdown) return; countdown.textContent = `Próximo ${event.type}: ${event.labelDay}, ${event.labelTime} · faltam ${formatDistance(event.date - new Date())}`; document.querySelectorAll('.schedule-card').forEach((card) => card.classList.toggle('is-next-event', card.dataset.day === event.labelDay)); }
  function scheduleCountdown() { updateCountdown(); window.clearTimeout(timer); const now = new Date(); timer = window.setTimeout(scheduleCountdown, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50); }

  initTheme(); applySabbath(); updateVerse(); scheduleCountdown();
  if (welcomeMessage) welcomeMessage.textContent = 'Que bom ter você aqui! Seja muito bem-vindo à IASD Vila Eduardo.';
  themeToggle?.addEventListener('click', () => { const next = root.classList.contains('dark-theme') ? 'light' : 'dark'; localStorage.setItem('theme', next); applyTheme(next); });
  prefersDark.addEventListener('change', ({ matches }) => { if (!localStorage.getItem('theme')) applyTheme(matches ? 'dark' : 'light'); });
})();
