(() => {
  const nav = document.querySelector('.topnav');
  const toggle = nav?.querySelector('[data-menu-toggle]');
  const menu = nav?.querySelector('[data-mobile-menu]');
  if (!(nav instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
    return;
  }

  const closeMenu = () => {
    nav.dataset.menuOpen = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    nav.dataset.menuOpen = 'true';
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    if (nav.dataset.menuOpen === 'true') {
      closeMenu();
      return;
    }
    openMenu();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 960) {
      closeMenu();
    }
  });
})();
