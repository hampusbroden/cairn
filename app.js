// Cairn Web Application Logic

// Initial Application State
const state = {
  activeScreen: 0, // 0 to 6 (defaults to Landing Page Screen 0)
  currentUser: null,
  hostGuestbooks: [],
  hostConfig: {
    eventType: 'wedding',
    partner1: 'Anna',
    partner2: 'Erik',
    date: '2026-06-15',
    venue: 'Mariefred, Sweden',
    contentTypes: {
      text: true,
      video: true,
      scribble: true,
      photo: true
    },
    privacyMode: 'public', // public, private, curated
    identity: {
      allowAnonymous: false,
      requireName: true,
      requirePhoto: false
    },
    keepsakeOutputs: {
      web: true,
      pdf: true,
      mp4: true,
      physical: true
    },
    vibes: {
      moods: ['minimal', 'editorial', 'warm', 'classic'],
      palette: 'cairn-cream',
      customColors: { bg: '#F8F5F0', text: '#1F1B16', accent: '#C9A19A' },
      serifFont: 'newsreader',
      sansFont: 'jakarta',
      heroPhoto: 'assets/couple_portrait.png',
      introMessage: 'Welcome — leave a stone for our cairn'
    }
  },
  // Default feed items (starter cards for Anna & Erik)
  feedItems: [
    {
      id: 1,
      type: 'text',
      guestName: 'Sofia Lindqvist',
      avatarText: 'SL',
      avatarImg: '',
      timeAgo: '2 hours ago',
      content: 'Dearest Anna and Erik, what a stunning celebration in Mariefred! May your years together be as peaceful and beautiful as the lake here. Thank you for including us in your story.'
    },
    {
      id: 2,
      type: 'scribble',
      guestName: 'Marcus & Elin',
      avatarText: 'ME',
      avatarImg: '',
      timeAgo: '4 hours ago',
      content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" fill="none" stroke="%231F1B16" stroke-width="2.5" stroke-linecap="round"><path d="M 50,110 C 90,60 140,80 180,60 C 220,40 250,90 270,110 M 110,60 C 130,40 160,30 180,50 M 90,110 C 110,95 130,95 150,110 M 160,110 C 180,90 200,95 220,110"/><text x="145" y="130" font-family="Georgia" font-size="12" fill="%23A89A8A" text-anchor="middle">M + E</text></svg>'
    },
    {
      id: 3,
      type: 'photo',
      guestName: 'Lukas Berg',
      avatarText: 'LB',
      avatarImg: '',
      timeAgo: '5 hours ago',
      content: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 4,
      type: 'video',
      guestName: 'Emma Sjöberg',
      avatarText: 'ES',
      avatarImg: '',
      timeAgo: '1 day ago',
      content: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600'
    }
  ]
};

// Preset Color Palettes
const PALETTES = {
  'cairn-cream': {
    name: 'Cairn Cream',
    bg: '#F8F5F0',
    surface: '#FFFFFF',
    text: '#1F1B16',
    taupe: '#A89A8A',
    accent: '#C9A19A'
  },
  'nordic-slate': {
    name: 'Nordic Slate',
    bg: '#F4F6F6',
    surface: '#FFFFFF',
    text: '#2C3A3B',
    taupe: '#8C9A9E',
    accent: '#D2B48C'
  },
  'forest-mist': {
    name: 'Forest Mist',
    bg: '#F0F4F1',
    surface: '#FFFFFF',
    text: '#2D3A31',
    taupe: '#94A79A',
    accent: '#E6B89C'
  },
  'muted-apricot': {
    name: 'Muted Apricot',
    bg: '#FAF5F0',
    surface: '#FFFFFF',
    text: '#29211C',
    taupe: '#B59E90',
    accent: '#E3A888'
  },
  'midnight-minimal': {
    name: 'Midnight',
    bg: '#141311',
    surface: '#1E1C1A',
    text: '#F5F5F0',
    taupe: '#7A756E',
    accent: '#D0B58F'
  }
};

// Typography Fonts Config
const FONTS = {
  serif: {
    'newsreader': "'Newsreader', Georgia, serif",
    'playfair': "'Playfair Display', Georgia, serif",
    'lora': "'Lora', Georgia, serif"
  },
  sans: {
    'jakarta': "'Plus Jakarta Sans', system-ui, sans-serif",
    'inter': "'Inter', system-ui, sans-serif",
    'system': "system-ui, -apple-system, sans-serif"
  }
};

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initRouting();
  initFormInteractivity();
  syncNameFieldsByEventType();
  initCanvasDrawing();
  initVibeGenerator();
  renderPreview();
  renderGuestFeed();
  navigateTo(0); // Ensure initial routing state is synced
});

// View Navigation & State Machine Router
function initRouting() {
  const barFill = document.querySelector('.progress-bar-fill');
  
  window.navigateTo = function(screenNum) {
    if (screenNum < 0 || screenNum > 7) return;
    
    // Sync cover photo to active screen images
    if (state.hostConfig && state.hostConfig.vibes && state.hostConfig.vibes.heroPhoto) {
      document.querySelectorAll('.guest-hero-image').forEach(img => {
        img.src = state.hostConfig.vibes.heroPhoto;
      });
    }
    
    const appShell = document.getElementById('app-shell');
    const headerBar = document.querySelector('.header-bar');
    const hostControlBar = document.getElementById('host-feed-control-header');
    
    if (screenNum === 0) {
      appShell.className = 'landing-shell-wrapper';
      headerBar.style.display = 'none';
      if (hostControlBar) hostControlBar.style.display = 'none';
      
      const mainView = document.getElementById('landing-main-view');
      const dashView = document.getElementById('landing-dashboard-view');
      
      if (state.currentUser) {
        if (mainView) mainView.style.display = 'none';
        if (dashView) dashView.style.display = 'block';
        
        // Populate host details
        document.getElementById('host-display-name').innerText = state.currentUser.name;
        document.getElementById('host-settings-email').innerText = state.currentUser.email;
        document.getElementById('host-dashboard-avatar').innerText = state.currentUser.name[0].toUpperCase();
        
        const activeCard = document.getElementById('dashboard-active-guestbook-card');
        const emptyState = document.getElementById('dashboard-empty-state');
        
        if (state.hostGuestbooks.length > 0) {
          if (activeCard) activeCard.style.display = 'block';
          if (emptyState) emptyState.style.display = 'none';
          
          const gb = state.hostGuestbooks[0];
          document.getElementById('dash-gb-title').innerText = getEventDisplayNameForGb(gb);
          document.getElementById('dash-gb-date').innerText = gb.date;
          document.getElementById('dash-analytic-stones').innerText = state.feedItems.length;
        } else {
          if (activeCard) activeCard.style.display = 'none';
          if (emptyState) emptyState.style.display = 'block';
        }
      } else {
        if (mainView) mainView.style.display = 'block';
        if (dashView) dashView.style.display = 'none';
      }
    } else if (screenNum === 7) {
      appShell.className = 'print-signage-wrapper';
      headerBar.style.display = 'none';
      if (hostControlBar) hostControlBar.style.display = 'none';
    } else if (screenNum >= 5) {
      appShell.className = 'guest-frame-desktop-wrapper';
      headerBar.style.display = 'none';
      if (hostControlBar) {
        hostControlBar.style.display = state.currentUser ? 'flex' : 'none';
      }
    } else {
      appShell.className = '';
      headerBar.style.display = 'flex';
      if (hostControlBar) hostControlBar.style.display = 'none';
      
      // Update Setup Flow Header Steps
      const percent = ((screenNum) / 4) * 100;
      if (barFill) barFill.style.width = `${percent}%`;
      const stepText = document.querySelector('.progress-step');
      if (stepText) stepText.innerText = `Step ${screenNum} of 4`;
    }
    
    // Transition view visibilities
    document.querySelectorAll('.screen-view').forEach(view => {
      view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`screen-${screenNum}`);
    if (targetView) {
      targetView.classList.add('active');
      state.activeScreen = screenNum;
      window.scrollTo(0, 0);
    }
    
    // Canvas sizing trigger when Screen 6 becomes active
    if (screenNum === 6) {
      setTimeout(resizeCanvas, 50);
    }
  };
  
  // Brand Logo Click resets to Screen 0
  document.querySelectorAll('.logo-container').forEach(logo => {
    logo.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo(0);
    });
  });
}

// Sync name fields based on active event type
function syncNameFieldsByEventType() {
  const type = state.hostConfig.eventType;
  const group1 = document.getElementById('group-partner1');
  const group2 = document.getElementById('group-partner2');
  const label1 = document.getElementById('label-partner1');
  const partner1 = document.getElementById('partner1');
  const partner2 = document.getElementById('partner2');
  
  if (!group1 || !group2 || !label1 || !partner1 || !partner2) return;
  
  if (type === 'wedding' || type === 'anniversary') {
    group2.style.display = 'block';
    label1.innerText = 'Partner One Name';
    partner1.placeholder = 'e.g., Anna';
    if (partner1.value === 'Anna' || partner1.value === 'Sarah' || partner1.value === 'Alex' || partner1.value === 'Grandma Rose') {
      partner1.value = 'Anna';
    }
  } else {
    group2.style.display = 'none';
    if (type === 'birthday') {
      label1.innerText = 'Celebrant Name';
      partner1.placeholder = 'e.g., Sarah';
      if (partner1.value === 'Anna' || partner1.value === 'Alex' || partner1.value === 'Grandma Rose') {
        partner1.value = 'Sarah';
      }
    } else if (type === 'graduation') {
      label1.innerText = 'Graduate Name';
      partner1.placeholder = 'e.g., Alex';
      if (partner1.value === 'Anna' || partner1.value === 'Sarah' || partner1.value === 'Grandma Rose') {
        partner1.value = 'Alex';
      }
    } else if (type === 'memorial') {
      label1.innerText = 'Honored Person Name';
      partner1.placeholder = 'e.g., Grandma Rose';
      if (partner1.value === 'Anna' || partner1.value === 'Sarah' || partner1.value === 'Alex') {
        partner1.value = 'Grandma Rose';
      }
    }
  }
  
  const introInput = document.getElementById('refine-intro-edit');
  const defaultIntros = {
    wedding: 'Welcome — leave a stone for our cairn',
    anniversary: 'Celebrating our years together — leave a stone',
    birthday: 'Welcome to my birthday celebration — leave a stone',
    graduation: 'Celebrating my graduation — leave a stone',
    memorial: 'In loving memory — please share a memory or message'
  };
  
  state.hostConfig.vibes.introMessage = defaultIntros[type] || 'Welcome — leave a stone for our cairn';
  if (introInput) {
    introInput.value = state.hostConfig.vibes.introMessage;
  }
  
  state.hostConfig.partner1 = partner1.value || 'Anna';
  state.hostConfig.partner2 = partner2.value || 'Erik';
  
  renderPreview();
}

function getEventDisplayNameForGb(gb) {
  const type = gb.eventType;
  const p1 = gb.partner1 || 'Anna';
  const p2 = gb.partner2 || 'Erik';
  if (type === 'wedding') return `${p1} & ${p2}'s Wedding`;
  if (type === 'anniversary') return `${p1} & ${p2}'s Anniversary`;
  if (type === 'birthday') return `${p1}'s Birthday`;
  if (type === 'graduation') return `${p1}'s Graduation`;
  if (type === 'memorial') return `In Loving Memory of ${p1}`;
  return `${p1}'s Event`;
}

// Host Step Toggles & Input Capture
function initFormInteractivity() {
  // Screen 1: Event Type Selector Cards
  const typeCards = document.querySelectorAll('#screen-1 .selection-card');
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.hostConfig.eventType = card.dataset.type;
      syncNameFieldsByEventType();
    });
  });
  
  // Screen 1 Inputs
  const partner1Input = document.getElementById('partner1');
  const partner2Input = document.getElementById('partner2');
  const eventDateInput = document.getElementById('event-date');
  const eventVenueInput = document.getElementById('event-venue');
  
  const updateHostBasics = () => {
    state.hostConfig.partner1 = partner1Input.value || 'Anna';
    state.hostConfig.partner2 = partner2Input.value || 'Erik';
    state.hostConfig.date = eventDateInput.value || '2026-06-15';
    state.hostConfig.venue = eventVenueInput.value || 'Mariefred, Sweden';
    renderPreview();
  };
  
  partner1Input.addEventListener('input', updateHostBasics);
  partner2Input.addEventListener('input', updateHostBasics);
  eventDateInput.addEventListener('input', updateHostBasics);
  eventVenueInput.addEventListener('input', updateHostBasics);
  
  // Screen 2: Content types toggles
  const contentToggles = document.querySelectorAll('#screen-2 .toggle-card');
  contentToggles.forEach(card => {
    card.addEventListener('click', () => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
      
      if (checkbox.checked) {
        card.classList.add('checked');
      } else {
        card.classList.remove('checked');
      }
      
      const type = card.dataset.type;
      state.hostConfig.contentTypes[type] = checkbox.checked;
    });
  });
  
  // Screen 2: Privacy boxes
  const privacyItems = document.querySelectorAll('#privacy-list .inner-selection-item');
  privacyItems.forEach(item => {
    item.addEventListener('click', () => {
      privacyItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      state.hostConfig.privacyMode = item.dataset.value;
    });
  });
  
  // Screen 2: Identity toggle switches
  const identitySwitches = document.querySelectorAll('#screen-2 .pref-box input[type="checkbox"]');
  identitySwitches.forEach(sw => {
    sw.addEventListener('change', () => {
      const field = sw.dataset.field;
      state.hostConfig.identity[field] = sw.checked;
    });
  });
  
  // Screen 2: Keepsake Outputs toggles
  const keepsakeSwitches = document.querySelectorAll('#screen-2 input[data-keepsake]');
  keepsakeSwitches.forEach(sw => {
    sw.addEventListener('change', () => {
      const field = sw.dataset.keepsake;
      state.hostConfig.keepsakeOutputs[field] = sw.checked;
      
      // Update Keepsake Download Modal layout in real-time
      if (window.syncKeepsakeDownloadModalOptions) {
        window.syncKeepsakeDownloadModalOptions();
      }
    });
  });
  
  // Screen 3: Mood Tag Chips Toggle
  const moodChips = document.querySelectorAll('.mood-chip');
  moodChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const val = chip.dataset.mood;
      const idx = state.hostConfig.vibes.moods.indexOf(val);
      if (idx > -1) {
        state.hostConfig.vibes.moods.splice(idx, 1);
      } else {
        state.hostConfig.vibes.moods.push(val);
      }
    });
  });
  
  // Screen 3: Preset color palettes
  const colorTiles = document.querySelectorAll('#palette-picker .palette-tile');
  colorTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      colorTiles.forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      const palKey = tile.dataset.palette;
      state.hostConfig.vibes.palette = palKey;
      
      // Inject variables into custom preview
      applySelectedPaletteToPreview(palKey);
    });
  });
  
  // Custom Color Input selection
  const customColorInput = document.getElementById('custom-color-picker');
  if (customColorInput) {
    customColorInput.addEventListener('change', (e) => {
      const colorVal = e.target.value;
      // Synthesize custom palette
      state.hostConfig.vibes.palette = 'custom';
      state.hostConfig.vibes.customColors.bg = colorVal;
      state.hostConfig.vibes.customColors.text = '#1F1B16'; // default dark text
      state.hostConfig.vibes.customColors.accent = '#C9A19A'; // default accent
      
      applySelectedPaletteToPreview('custom');
      
      // Highlight custom picker
      colorTiles.forEach(t => t.classList.remove('selected'));
      document.querySelector('.custom-picker-tile').style.borderColor = '#1F1B16';
    });
  }
}

// Screen 3 Generator screen loader sequence
function initVibeGenerator() {
  const genBtn = document.getElementById('btn-generate-guestbook');
  const generatorView = document.getElementById('generator-loading-overlay');
  
  genBtn.addEventListener('click', () => {
    // Open generator loading panel with custom typewriter phases
    generatorView.style.display = 'flex';
    const statusText = generatorView.querySelector('.generator-status-text');
    
    const steps = [
      'Curating your visual vibes...',
      'Synthesizing Nordic color palettes...',
      'Selecting contemporary typography...',
      'Erecting your digital cairn...'
    ];
    
    let currentStepIndex = 0;
    statusText.innerText = steps[currentStepIndex];
    
    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        statusText.innerText = steps[currentStepIndex];
      } else {
        clearInterval(interval);
        // Hide overlay, update real-time preview, go to Screen 4
        generatorView.style.opacity = '0';
        setTimeout(() => {
          generatorView.style.display = 'none';
          generatorView.style.opacity = '1';
          renderPreview();
          renderGuestFeed();
          navigateTo(4);
        }, 400);
      }
    }, 1200);
  });
}

// Screen 4 Live mockup builder
function renderPreview() {
  // Sync names
  const previewHeadline = document.getElementById('preview-guest-headline');
  const p1 = state.hostConfig.partner1;
  const p2 = state.hostConfig.partner2;
  const type = state.hostConfig.eventType;
  const headlineStr = (type === 'wedding' || type === 'anniversary') ? `${p1} & ${p2}` : p1;
  
  if (previewHeadline) previewHeadline.innerText = headlineStr;
  
  // Sync date
  const previewDate = document.getElementById('preview-guest-date');
  if (previewDate) {
    const d = new Date(state.hostConfig.date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    previewDate.innerText = d.toLocaleDateString('en-US', options);
  }
  
  // Sync font picks
  applySerifFontToPreview(state.hostConfig.vibes.serifFont);
  applySansFontToPreview(state.hostConfig.vibes.sansFont);
  
  // Sync layout details in refinement panels
  const nameEditInput = document.getElementById('refine-names-edit');
  if (nameEditInput && (nameEditInput.value === '' || nameEditInput.value === 'Anna & Erik')) {
    nameEditInput.value = headlineStr;
  }
  
  const introEditInput = document.getElementById('refine-intro-edit');
  if (introEditInput && (introEditInput.value === '' || introEditInput.value === 'Welcome — leave a stone for our cairn')) {
    introEditInput.value = state.hostConfig.vibes.introMessage;
  }
  
  syncFontPickerPreviewText();
}

function syncFontPickerPreviewText() {
  const nameInput = document.getElementById('refine-names-edit');
  const introInput = document.getElementById('refine-intro-edit');
  
  const nameVal = nameInput ? nameInput.value : (state.hostConfig.partner1 + (state.hostConfig.partner2 ? ` & ${state.hostConfig.partner2}` : ''));
  const introVal = introInput ? introInput.value : state.hostConfig.vibes.introMessage;
  
  // Serif font tiles should show the event name(s)
  document.querySelectorAll('.font-picker-serif .font-opt-preview').forEach(el => {
    el.innerText = nameVal;
  });
  
  // Sans font tiles should show the intro message
  document.querySelectorAll('.font-picker-sans .font-opt-preview').forEach(el => {
    el.innerText = introVal;
  });
}


// Custom Font Selectors in Screen 4 Refinement panel
function setupFontPicker() {
  const serifCards = document.querySelectorAll('.font-picker-serif .font-option-card');
  serifCards.forEach(card => {
    card.addEventListener('click', () => {
      serifCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.hostConfig.vibes.serifFont = card.dataset.font;
      applySerifFontToPreview(card.dataset.font);
    });
  });
  
  const sansCards = document.querySelectorAll('.font-picker-sans .font-option-card');
  sansCards.forEach(card => {
    card.addEventListener('click', () => {
      sansCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.hostConfig.vibes.sansFont = card.dataset.font;
      applySansFontToPreview(card.dataset.font);
    });
  });
}
// Run setupFontPicker once style elements are interactive
setTimeout(setupFontPicker, 100);

function applySerifFontToPreview(fontKey) {
  const fontVal = FONTS.serif[fontKey];
  const targetMockup = document.querySelector('.phone-screen');
  const targetGuestFlow = document.querySelector('.guest-view-frame');
  const targetCanvasFlow = document.querySelector('.canvas-view-container');
  
  [targetMockup, targetGuestFlow, targetCanvasFlow].forEach(el => {
    if (el) el.style.setProperty('--font-serif', fontVal);
  });
}

function applySansFontToPreview(fontKey) {
  const fontVal = FONTS.sans[fontKey];
  const targetMockup = document.querySelector('.phone-screen');
  const targetGuestFlow = document.querySelector('.guest-view-frame');
  const targetCanvasFlow = document.querySelector('.canvas-view-container');
  
  [targetMockup, targetGuestFlow, targetCanvasFlow].forEach(el => {
    if (el) el.style.setProperty('--font-sans', fontVal);
  });
}

function applySelectedPaletteToPreview(palKey) {
  const pal = palKey === 'custom' ? {
    bg: state.hostConfig.vibes.customColors.bg,
    surface: '#FFFFFF',
    text: '#1F1B16',
    taupe: '#A89A8A',
    accent: '#C9A19A'
  } : PALETTES[palKey];
  
  const targetMockup = document.querySelector('.phone-screen');
  const targetGuestFlow = document.querySelector('.guest-view-frame');
  const targetCanvasFlow = document.querySelector('.canvas-view-container');
  
  [targetMockup, targetGuestFlow, targetCanvasFlow].forEach(el => {
    if (el) {
      el.style.setProperty('--bg-cream', pal.bg);
      el.style.setProperty('--surface-white', pal.surface);
      el.style.setProperty('--text-charcoal', pal.text);
      el.style.setProperty('--text-taupe', pal.taupe);
      el.style.setProperty('--accent-rose', pal.accent);
    }
  });
}

// Interactive Theme Switcher for Marketing Sandbox
window.changeSandboxTheme = function(themeKey) {
  const pal = PALETTES[themeKey];
  if (!pal) return;
  
  const vp = document.getElementById('sandbox-viewport');
  if (vp) {
    vp.style.setProperty('--bg-cream', pal.bg);
    vp.style.setProperty('--surface-white', pal.surface);
    vp.style.setProperty('--text-charcoal', pal.text);
    vp.style.setProperty('--text-taupe', pal.taupe);
    vp.style.setProperty('--accent-rose', pal.accent);
  }
  
  document.querySelectorAll('.sandbox-toggle-btn').forEach(btn => {
    if (btn.getAttribute('data-theme') === themeKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
};

// Update text items in real-time in refinement panel
function updateRefinedCopy() {
  const nameVal = document.getElementById('refine-names-edit').value;
  const introVal = document.getElementById('refine-intro-edit').value;
  
  const previewHeadline = document.getElementById('preview-guest-headline');
  const previewIntro = document.getElementById('preview-guest-intro');
  
  const guestHeadline = document.getElementById('guest-hero-headline');
  const guestIntro = document.getElementById('guest-hero-intro');
  
  if (previewHeadline) previewHeadline.innerText = nameVal;
  if (previewIntro) previewIntro.innerText = introVal;
  
  if (guestHeadline) guestHeadline.innerText = nameVal;
  if (guestIntro) guestIntro.innerText = introVal;
  
  state.hostConfig.vibes.introMessage = introVal;
  
  const type = state.hostConfig.eventType;
  if (type === 'wedding' || type === 'anniversary') {
    const parts = nameVal.split('&');
    if (parts.length === 2) {
      state.hostConfig.partner1 = parts[0].trim();
      state.hostConfig.partner2 = parts[1].trim();
    } else {
      state.hostConfig.partner1 = nameVal.trim();
    }
  } else {
    state.hostConfig.partner1 = nameVal.trim();
  }
  
  syncFontPickerPreviewText();
}
// Wire up refinement text inputs
setTimeout(() => {
  const nEdit = document.getElementById('refine-names-edit');
  const iEdit = document.getElementById('refine-intro-edit');
  if (nEdit) nEdit.addEventListener('input', updateRefinedCopy);
  if (iEdit) iEdit.addEventListener('input', updateRefinedCopy);
}, 200);


// Guest Flow & Live Feed Renderer
function renderGuestFeed() {
  // Select both the desktop mockup container feed and the actual mobile guest flow feed
  const mockupFeed = document.getElementById('mockup-guest-feed');
  const actualFeed = document.getElementById('actual-guest-feed');
  
  const p1 = state.hostConfig.partner1;
  const p2 = state.hostConfig.partner2;
  const type = state.hostConfig.eventType;
  const headlineStr = (type === 'wedding' || type === 'anniversary') ? `${p1} & ${p2}` : p1;
  
  // Update header content of actual Screen 5 Guest Feed
  const guestHeroHeadline = document.getElementById('guest-hero-headline');
  const guestHeroDate = document.getElementById('guest-hero-date');
  const guestHeroIntro = document.getElementById('guest-hero-intro');
  
  if (guestHeroHeadline) guestHeroHeadline.innerText = headlineStr;
  if (guestHeroIntro) guestHeroIntro.innerText = state.hostConfig.vibes.introMessage;
  if (guestHeroDate) {
    const d = new Date(state.hostConfig.date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    guestHeroDate.innerText = d.toLocaleDateString('en-US', options);
  }
  
  const generateFeedHtml = () => {
    return state.feedItems.map(item => {
      let bodyHtml = '';
      if (item.type === 'text') {
        bodyHtml = `<p class="card-body-text">${item.content}</p>`;
      } else if (item.type === 'photo') {
        bodyHtml = `<img src="${item.content}" class="card-body-photo" alt="Photo entry by ${item.guestName}">`;
        if (item.caption) {
          bodyHtml += `<p class="card-body-text" style="margin-top: 12px; border-left: none; padding-left: 0; font-family: var(--font-sans); font-size: 13.5px; font-style: normal; color: var(--text-charcoal);">${item.caption}</p>`;
        }
      } else if (item.type === 'video') {
        // If it is a real uploaded local video, show native HTML5 player controls
        if (item.content.startsWith('blob:') || item.content.startsWith('data:')) {
          bodyHtml = `
            <video src="${item.content}" class="card-body-photo" style="background:#000; width:100%; border-radius:var(--radius-sm);" controls></video>
          `;
        } else {
          bodyHtml = `
            <div class="card-body-video" onclick="playMockVideo(this)">
              <img src="${item.content}" class="video-mock-thumb">
              <div class="video-play-btn">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>`;
        }
        if (item.caption) {
          bodyHtml += `<p class="card-body-text" style="margin-top: 12px; border-left: none; padding-left: 0; font-family: var(--font-sans); font-size: 13.5px; font-style: normal; color: var(--text-charcoal);">${item.caption}</p>`;
        }
      } else if (item.type === 'scribble') {
        bodyHtml = `
          <div class="card-body-scribble">
            <img src="${item.content}" alt="Scribble by ${item.guestName}">
          </div>`;
      }
      
      return `
        <div class="feed-card">
          <div class="card-header">
            <div class="guest-avatar">${item.avatarText}</div>
            <div class="guest-meta">
              <span class="guest-name">${item.guestName}</span>
              <span class="card-time">${item.timeAgo}</span>
            </div>
          </div>
          ${bodyHtml}
        </div>
      `;
    }).join('');
  };
  
  const htmlContent = generateFeedHtml();
  if (mockupFeed) mockupFeed.innerHTML = htmlContent;
  if (actualFeed) actualFeed.innerHTML = htmlContent;
}

// Simulated Video Play Interaction
window.playMockVideo = function(videoWrapper) {
  const thumb = videoWrapper.querySelector('.video-mock-thumb');
  const playBtn = videoWrapper.querySelector('.video-play-btn');
  
  // Simply hide play button and simulate video rendering by using a subtle vintage filter
  playBtn.style.opacity = '0';
  thumb.style.filter = 'contrast(1.1) brightness(1.05) sepia(0.2)';
  
  // Show active placeholder banner
  const toast = document.createElement('div');
  toast.innerText = 'Simulating video playback...';
  toast.style.position = 'absolute';
  toast.style.bottom = '16px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(31, 27, 22, 0.85)';
  toast.style.color = '#F8F5F0';
  toast.style.padding = '8px 16px';
  toast.style.borderRadius = '20px';
  toast.style.fontSize = '11px';
  toast.style.zIndex = '10';
  toast.style.pointerEvents = 'none';
  toast.style.fontFamily = 'sans-serif';
  videoWrapper.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
    playBtn.style.opacity = '1';
    thumb.style.filter = '';
  }, 2500);
};

// State tracker for uploads
state.currentMediaUpload = null;

// Bottom Sheet / Guest Interaction Controls
window.toggleBottomSheet = function(show) {
  const overlay = document.getElementById('add-stone-sheet-overlay');
  if (overlay) {
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }
};

// Handle visual vibe image uploads
window.handleVibePhotosUpload = function(input) {
  const files = input.files;
  const container = document.getElementById('vibe-thumbnails');
  if (!container) return;
  
  // Clear default mock if user uploads new files
  if (files.length > 0) {
    container.innerHTML = '';
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.className = 'thumb-preview';
      img.src = e.target.result;
      img.alt = 'Uploaded inspiration photo';
      container.appendChild(img);
      
      // Save primary uploaded photo in hostConfig and update previews in DOM
      if (i === 0) {
        state.hostConfig.vibes.heroPhoto = e.target.result;
        document.querySelectorAll('.guest-hero-image').forEach(heroImg => {
          heroImg.src = e.target.result;
        });
      }
    };
    reader.readAsDataURL(file);
  }
};

// Handle guest photo uploaded from device
window.handleGuestPhotoSelected = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  toggleBottomSheet(false);
  
  const reader = new FileReader();
  reader.onload = function(e) {
    state.currentMediaUpload = {
      type: 'photo',
      url: e.target.result
    };
    
    // Prepare dialog modal layout for photo with custom titles
    document.getElementById('dialog-header-title').innerText = 'Add a photo';
    document.getElementById('dialog-message-label').innerText = 'Caption (Optional)';
    document.getElementById('guest-text-message').placeholder = 'Say something about this photo...';
    
    // Show image preview in dialog
    const previewContainer = document.getElementById('dialog-media-preview-container');
    const imgPreview = document.getElementById('dialog-image-preview');
    const vidPreview = document.getElementById('dialog-video-preview');
    
    previewContainer.style.display = 'flex';
    imgPreview.src = e.target.result;
    imgPreview.style.display = 'block';
    vidPreview.style.display = 'none';
    
    // Open Dialog
    const dialog = document.getElementById('add-message-dialog');
    if (dialog) dialog.classList.add('active');
    document.getElementById('guest-signature-name').focus();
  };
  reader.readAsDataURL(file);
  
  // Reset input value so same file can be re-uploaded if needed
  input.value = '';
};

// Handle guest video recorded/uploaded from device
window.handleGuestVideoSelected = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  toggleBottomSheet(false);
  
  // Create local Blob URL (extremely fast and doesn't load whole video into memory string)
  const videoBlobUrl = URL.createObjectURL(file);
  state.currentMediaUpload = {
    type: 'video',
    url: videoBlobUrl
  };
  
  // Prepare dialog modal layout for video with custom titles
  document.getElementById('dialog-header-title').innerText = 'Add a video';
  document.getElementById('dialog-message-label').innerText = 'Caption (Optional)';
  document.getElementById('guest-text-message').placeholder = 'Say something about this video...';
  
  // Show video preview in dialog
  const previewContainer = document.getElementById('dialog-media-preview-container');
  const imgPreview = document.getElementById('dialog-image-preview');
  const vidPreview = document.getElementById('dialog-video-preview');
  
  previewContainer.style.display = 'flex';
  vidPreview.src = videoBlobUrl;
  vidPreview.style.display = 'block';
  imgPreview.style.display = 'none';
  
  // Open Dialog
  const dialog = document.getElementById('add-message-dialog');
  if (dialog) dialog.classList.add('active');
  document.getElementById('guest-signature-name').focus();
  
  // Reset input value
  input.value = '';
};

window.openAddMessageDialog = function() {
  toggleBottomSheet(false);
  
  // Set default labels for simple text post
  document.getElementById('dialog-header-title').innerText = 'Write your message';
  document.getElementById('dialog-message-label').innerText = 'Message';
  document.getElementById('guest-text-message').placeholder = 'Dearest Anna & Erik...';
  
  // Hide media preview container
  document.getElementById('dialog-media-preview-container').style.display = 'none';
  
  const dialog = document.getElementById('add-message-dialog');
  if (dialog) {
    dialog.classList.add('active');
    document.getElementById('guest-text-message').focus();
  }
};

window.closeAddMessageDialog = function() {
  const dialog = document.getElementById('add-message-dialog');
  if (dialog) {
    dialog.classList.remove('active');
  }
  
  // Reset fields
  document.getElementById('guest-text-message').value = '';
  document.getElementById('guest-signature-name').value = '';
  
  // Hide previews
  document.getElementById('dialog-media-preview-container').style.display = 'none';
  document.getElementById('dialog-image-preview').src = '';
  document.getElementById('dialog-video-preview').src = '';
  
  // Revoke object URL if video was uploaded to avoid memory leaks
  if (state.currentMediaUpload && state.currentMediaUpload.type === 'video' && state.currentMediaUpload.url.startsWith('blob:')) {
    URL.revokeObjectURL(state.currentMediaUpload.url);
  }
  
  state.currentMediaUpload = null;
};

// Post a new entry dynamically (supports text, photo, and video)
window.submitTextMessage = function() {
  const messageInput = document.getElementById('guest-text-message');
  const nameInput = document.getElementById('guest-signature-name');
  
  const captionOrText = messageInput.value.trim();
  const guestName = nameInput.value.trim() || 'Anonymous';
  
  // For text messages, content is required. For photo/video, caption is optional.
  if (!state.currentMediaUpload && !captionOrText) return;
  
  // Format initials
  const initials = guestName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  if (state.currentMediaUpload) {
    // Media Upload (Photo/Video)
    state.feedItems.unshift({
      id: Date.now(),
      type: state.currentMediaUpload.type,
      guestName: guestName,
      avatarText: initials || '?',
      avatarImg: '',
      timeAgo: 'Just now',
      content: state.currentMediaUpload.url,
      caption: captionOrText
    });
  } else {
    // Pure Text Message
    state.feedItems.unshift({
      id: Date.now(),
      type: 'text',
      guestName: guestName,
      avatarText: initials || '?',
      avatarImg: '',
      timeAgo: 'Just now',
      content: captionOrText
    });
  }
  
  // Clear upload state without revoking active blob since it is now rendered in feed
  state.currentMediaUpload = null;
  
  closeAddMessageDialog();
  renderGuestFeed();
};

// Simulate adding a Photo or Video card dynamically (Fallback)
window.simulateMediaAdd = function(type) {
  toggleBottomSheet(false);
  const names = ['Hanna', 'Viktor', 'Karin', 'Oskar', 'Astrid'];
  const name = names[Math.floor(Math.random() * names.length)];
  const initials = name[0] + 'S';
  
  let content = '';
  if (type === 'photo') {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600'
    ];
    content = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
  } else {
    content = 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=600';
  }
  
  state.feedItems.unshift({
    id: Date.now(),
    type: type,
    guestName: `${name} Soderberg`,
    avatarText: initials,
    avatarImg: '',
    timeAgo: 'Just now',
    content: content
  });
  
  renderGuestFeed();
};


// Screen 6 Scribble Canvas Drawing Implementation
let canvas, ctx;
let isDrawing = false;
let drawColor = '#1F1B16';
let strokeWidth = 3;
let lastX = 0;
let lastY = 0;

// History Undo/Redo Stacks
const canvasHistory = [];
let historyIndex = -1;

function initCanvasDrawing() {
  canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  
  // Wire Drawing Event Listeners (Mouse + Touch)
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
  });
  
  // Wire Color Swatches
  const swatches = document.querySelectorAll('.canvas-toolbar .color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      drawColor = swatch.dataset.color;
    });
  });
  
  // Wire Brush Sizes
  const sizeOpts = document.querySelectorAll('.canvas-toolbar .stroke-opt');
  sizeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      sizeOpts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      strokeWidth = parseInt(opt.dataset.size);
    });
  });
  
  // Wire Undo/Redo/Clear buttons
  document.getElementById('canvas-undo').addEventListener('click', undoAction);
  document.getElementById('canvas-redo').addEventListener('click', redoAction);
  document.getElementById('canvas-clear').addEventListener('click', clearCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  const wrapper = canvas.parentElement;
  canvas.width = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;
  
  // Redraw guide markers or state if resized
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Clear and save initial blank state if history empty
  if (canvasHistory.length === 0) {
    saveCanvasState();
  } else {
    // Redraw active state
    const img = new Image();
    img.src = canvasHistory[historyIndex];
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }
}

// Window resizing handler
window.addEventListener('resize', () => {
  if (state.activeScreen === 6) {
    resizeCanvas();
  }
});

function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
}

function draw(e) {
  if (!isDrawing) return;
  
  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = drawColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
  
  lastX = currentX;
  lastY = currentY;
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    saveCanvasState();
  }
}

// State History Functions
function saveCanvasState() {
  const stateData = canvas.toDataURL();
  // Cut any redo paths if we drew something new
  if (historyIndex < canvasHistory.length - 1) {
    canvasHistory.splice(historyIndex + 1);
  }
  canvasHistory.push(stateData);
  historyIndex = canvasHistory.length - 1;
}

function undoAction() {
  if (historyIndex > 0) {
    historyIndex--;
    const img = new Image();
    img.src = canvasHistory[historyIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

function redoAction() {
  if (historyIndex < canvasHistory.length - 1) {
    historyIndex++;
    const img = new Image();
    img.src = canvasHistory[historyIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveCanvasState();
}

// Save drawing as scribble feed entry
window.saveScribbleEntry = function() {
  // Capture base64 drawing
  const drawingUrl = canvas.toDataURL();
  
  // Prompt user for guest signature name
  const name = prompt("Please sign your name for this scribble:") || "Anonymous";
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Prepend entry
  state.feedItems.unshift({
    id: Date.now(),
    type: 'scribble',
    guestName: name,
    avatarText: initials || '?',
    avatarImg: '',
    timeAgo: 'Just now',
    content: drawingUrl
  });
  
  // Redraw feeds and transition back to Screen 5
  renderGuestFeed();
  clearCanvas();
  navigateTo(5);
};

window.cancelScribble = function() {
  clearCanvas();
  navigateTo(5);
};

// ==================== SCREEN 0 & HOST ACTIONS ====================
window.launchGuestbook = function() {
  const gb = JSON.parse(JSON.stringify(state.hostConfig));
  state.hostGuestbooks = [gb];
  
  if (!state.currentUser) {
    const p1 = state.hostConfig.partner1;
    const p2 = state.hostConfig.partner2;
    const type = state.hostConfig.eventType;
    const hostName = (type === 'wedding' || type === 'anniversary') ? `${p1} & ${p2} Host` : `${p1} Host`;
    
    // Auto-authenticate a guest host account so dashboard metrics/keepsakes are available
    state.currentUser = {
      name: hostName,
      email: "host@cairn.guestbook",
      password: "dummy"
    };
    
    const authBtns = document.getElementById('landing-auth-buttons');
    if (authBtns) authBtns.style.display = 'none';
    const userBadge = document.getElementById('landing-user-badge');
    if (userBadge) userBadge.style.display = 'flex';
    const avatarBadge = document.getElementById('host-navbar-avatar');
    if (avatarBadge) avatarBadge.innerText = p1[0].toUpperCase();
  }
  
  navigateTo(5);
};

// Authentication & Modal Dialogs
window.openAuthModal = function(mode = 'signup') {
  const authDialog = document.getElementById('auth-dialog');
  if (authDialog) authDialog.classList.add('active');
  switchAuthMode(mode);
};

window.closeAuthModal = function() {
  const authDialog = document.getElementById('auth-dialog');
  if (authDialog) authDialog.classList.remove('active');
};

window.switchAuthMode = function(mode) {
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('auth-name-group');
  const submitBtn = document.getElementById('auth-submit-btn');
  const switchText = document.getElementById('auth-switch-text');
  const nameInput = document.getElementById('auth-name');
  const authDialog = document.getElementById('auth-dialog');
  
  if (mode === 'signin') {
    if (title) title.innerText = 'Welcome Back';
    if (subtitle) subtitle.innerText = 'Sign in to access your dashboard and keepsakes.';
    if (nameGroup) nameGroup.style.display = 'none';
    if (nameInput) nameInput.required = false;
    if (submitBtn) submitBtn.innerText = 'Sign In';
    if (switchText) switchText.innerHTML = `Don't have an account? <span style="text-decoration:underline; cursor:pointer; color:var(--text-charcoal); font-weight:600;" onclick="switchAuthMode('signup')">Sign Up</span>`;
    if (authDialog) authDialog.dataset.mode = 'signin';
  } else {
    if (title) title.innerText = 'Create your host account';
    if (subtitle) subtitle.innerText = 'Join Cairn to configure your custom keepsake guestbook.';
    if (nameGroup) nameGroup.style.display = 'block';
    if (nameInput) nameInput.required = true;
    if (submitBtn) submitBtn.innerText = 'Sign Up';
    if (switchText) switchText.innerHTML = `Already have an account? <span style="text-decoration:underline; cursor:pointer; color:var(--text-charcoal); font-weight:600;" onclick="switchAuthMode('signin')">Sign In</span>`;
    if (authDialog) authDialog.dataset.mode = 'signup';
  }
};

window.handleAuthSubmit = function(event) {
  event.preventDefault();
  const nameVal = document.getElementById('auth-name').value;
  const emailVal = document.getElementById('auth-email').value;
  const passwordVal = document.getElementById('auth-password').value;
  const mode = document.getElementById('auth-dialog').dataset.mode || 'signup';
  
  state.currentUser = {
    name: nameVal || (mode === 'signup' ? 'Sofia S.' : 'Anna & Erik Host'),
    email: emailVal,
    password: passwordVal
  };
  
  // Update Header UI
  const authBtns = document.getElementById('landing-auth-buttons');
  if (authBtns) authBtns.style.display = 'none';
  const userBadge = document.getElementById('landing-user-badge');
  if (userBadge) userBadge.style.display = 'flex';
  const avatarBadge = document.getElementById('host-navbar-avatar');
  if (avatarBadge) avatarBadge.innerText = state.currentUser.name[0].toUpperCase();
  
  closeAuthModal();
  
  if (mode === 'signup') {
    navigateTo(1); // Go straight to event setup flow
  } else {
    // If logging in, create default sample guestbook if list is empty
    if (state.hostGuestbooks.length === 0) {
      const gb = JSON.parse(JSON.stringify(state.hostConfig));
      state.hostGuestbooks.push(gb);
    }
    navigateTo(0); // View host dashboard
  }
};

window.handleSignOut = function() {
  state.currentUser = null;
  const authBtns = document.getElementById('landing-auth-buttons');
  if (authBtns) authBtns.style.display = 'flex';
  const userBadge = document.getElementById('landing-user-badge');
  if (userBadge) userBadge.style.display = 'none';
  navigateTo(0);
};

// Keepsake Compile & Download Modal Dialog Controllers
window.syncKeepsakeDownloadModalOptions = function() {
  if (!state.hostConfig.keepsakeOutputs) return;
  const pdfEnabled = state.hostConfig.keepsakeOutputs.pdf;
  const mp4Enabled = state.hostConfig.keepsakeOutputs.mp4;
  const physicalEnabled = state.hostConfig.keepsakeOutputs.physical;
  
  const itemPdf = document.getElementById('download-item-pdf');
  const itemMp4 = document.getElementById('download-item-mp4');
  const itemPhysical = document.getElementById('download-item-physical');
  const emptyState = document.getElementById('download-empty-keepsakes');
  
  let visibleCount = 0;
  
  if (itemPdf) {
    if (pdfEnabled) {
      itemPdf.style.display = 'flex';
      visibleCount++;
    } else {
      itemPdf.style.display = 'none';
    }
  }
  
  if (itemMp4) {
    if (mp4Enabled) {
      itemMp4.style.display = 'flex';
      visibleCount++;
    } else {
      itemMp4.style.display = 'none';
    }
  }
  
  if (itemPhysical) {
    if (physicalEnabled) {
      itemPhysical.style.display = 'flex';
      visibleCount++;
    } else {
      itemPhysical.style.display = 'none';
    }
  }
  
  if (emptyState) {
    if (visibleCount === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }
  }
};

window.openKeepsakeDownloadModal = function() {
  const downloadDialog = document.getElementById('download-keepsake-dialog');
  if (downloadDialog) downloadDialog.classList.add('active');
  
  // Hide compiling loader progress meter initially
  const loader = document.getElementById('compiler-loader');
  if (loader) loader.style.display = 'none';
  
  syncKeepsakeDownloadModalOptions();
};

window.closeKeepsakeDownloadModal = function() {
  const downloadDialog = document.getElementById('download-keepsake-dialog');
  if (downloadDialog) downloadDialog.classList.remove('active');
};

window.handleKeepsakeDownload = function(format) {
  if (format === 'pdf') {
    closeKeepsakeDownloadModal();
    setTimeout(() => {
      window.print();
    }, 300);
  } else if (format === 'webbundle') {
    // Compile and download interactive HTML keepsake file
    compileWebBundleOfflineHTML();
  } else if (format === 'mp4') {
    // Render progress bar ticks in compile dialogue
    const loader = document.getElementById('compiler-loader');
    const bar = document.getElementById('compiler-loader-bar');
    const percent = document.getElementById('compiler-loader-percent');
    const text = document.getElementById('compiler-loader-text');
    
    if (loader) loader.style.display = 'flex';
    
    let progress = 0;
    const phases = [
      'Reading guest video stones...',
      'Downsampling recorded greetings...',
      'Rendering drawing strokes...',
      'Overlaying ambient soundtrack...',
      'Stitching movie compilation...'
    ];
    
    const interval = setInterval(() => {
      progress += 2;
      if (bar) bar.style.width = `${progress}%`;
      if (percent) percent.innerText = `${progress}%`;
      
      const phaseIdx = Math.min(Math.floor((progress / 100) * phases.length), phases.length - 1);
      if (text && phases[phaseIdx]) {
        text.innerText = phases[phaseIdx];
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Trigger file download
          const link = document.createElement('a');
          link.download = `cairn_keepsake_${state.hostConfig.partner1.toLowerCase()}_${state.hostConfig.eventType}.mp4`;
          link.href = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wZDJsYnJhAAAAAG1vb2YAAAA='; // fake tiny container
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          alert("Your MP4 Keepsake Compilation Reel has been stitched and downloaded successfully!");
          closeKeepsakeDownloadModal();
        }, 500);
      }
    }, 50);
  } else if (format === 'physical') {
    // Simulating physical book print preparation sequence
    const loader = document.getElementById('compiler-loader');
    const bar = document.getElementById('compiler-loader-bar');
    const percent = document.getElementById('compiler-loader-percent');
    const text = document.getElementById('compiler-loader-text');
    
    if (loader) loader.style.display = 'flex';
    
    let progress = 0;
    const phases = [
      'Assembling high-res print signatures...',
      'Optimizing color profiles for press...',
      'Calculating bleed and margins...',
      'Formatting linen cover foil stamp...',
      'Queuing print job to press...'
    ];
    
    const interval = setInterval(() => {
      progress += 4;
      if (bar) bar.style.width = `${progress}%`;
      if (percent) percent.innerText = `${progress}%`;
      
      const phaseIdx = Math.min(Math.floor((progress / 100) * phases.length), phases.length - 1);
      if (text && phases[phaseIdx]) {
        text.innerText = phases[phaseIdx];
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          alert("Your Linen-Bound Physical Photo Album has been prepared and queued! We've sent a verification link to your email to confirm shipping details and finalize your custom layout.");
          closeKeepsakeDownloadModal();
        }, 500);
      }
    }, 80);
  }
};

function compileWebBundleOfflineHTML() {
  const p1 = state.hostConfig.partner1;
  const p2 = state.hostConfig.partner2;
  const type = state.hostConfig.eventType;
  const eventName = getEventDisplayNameForGb(state.hostConfig);
  const headlineStr = (type === 'wedding' || type === 'anniversary') ? `${p1} & ${p2}` : p1;
  
  let cardsHTML = '';
  state.feedItems.forEach(item => {
    let bodyContent = '';
    if (item.type === 'text') {
      bodyContent = `<p class="card-body-text" style="font-family: var(--font-serif); font-size:16px; line-height:1.6; font-style:italic; padding-left:12px; border-left:2px solid var(--accent-rose); color:var(--text-charcoal);">${item.content}</p>`;
    } else if (item.type === 'scribble') {
      bodyContent = `<div class="card-body-scribble"><img src="${item.content}" style="max-width:100%; height:auto;"></div>`;
    } else if (item.type === 'photo') {
      bodyContent = `<img src="${item.content}" class="card-body-photo" style="width:100%; border-radius:8px; object-fit:cover;">`;
    } else if (item.type === 'video') {
      bodyContent = `<video src="${item.content}" controls class="card-body-video" style="width:100%; border-radius:8px; max-height:360px; background:#000;"></video>`;
    }
    
    cardsHTML += `
      <div class="feed-card" style="background:#fff; border-radius:12px; padding:24px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid #eae5dd; margin-bottom:24px; display:flex; flex-direction:column; gap:16px;">
        <div class="card-header" style="display:flex; align-items:center; gap:12px;">
          <div class="guest-avatar" style="width:32px; height:32px; border-radius:50%; background:#f0e8dd; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#8c7e6c; text-transform:uppercase;">${item.avatarText}</div>
          <div class="guest-meta" style="display:flex; flex-direction:column; gap:2px;">
            <span class="guest-name" style="font-size:13px; font-weight:700; color:#1a1a1a;">${item.guestName}</span>
            <span class="card-time" style="font-size:10px; color:#9c9080;">${item.timeAgo}</span>
          </div>
        </div>
        ${bodyContent}
      </div>
    `;
  });

  const fontSerifStyle = FONTS.serif[state.hostConfig.vibes.serifFont] || FONTS.serif['newsreader'];
  const fontSansStyle = FONTS.sans[state.hostConfig.vibes.sansFont] || FONTS.sans['jakarta'];
  
  const currentPalKey = state.hostConfig.vibes.palette;
  const pal = currentPalKey === 'custom' ? {
    bg: state.hostConfig.vibes.customColors.bg,
    surface: '#FFFFFF',
    text: '#1F1B16',
    taupe: '#A89A8A',
    accent: '#C9A19A'
  } : (PALETTES[currentPalKey] || PALETTES['cairn-cream']);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventName} - Offline Keepsake</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200..400;1,6..72,200..400&family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Lora:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cream: ${pal.bg};
      --surface-white: ${pal.surface};
      --text-charcoal: ${pal.text};
      --text-taupe: ${pal.taupe};
      --accent-rose: ${pal.accent};
      --font-serif: ${fontSerifStyle};
      --font-sans: ${fontSansStyle};
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--bg-cream);
      color: var(--text-charcoal);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding: 40px 20px;
    }
    
    .keepsake-wrapper {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .keepsake-header {
      text-align: center;
      margin-bottom: 48px;
    }
    
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-taupe);
      margin-bottom: 24px;
    }
    
    .serif-display {
      font-family: var(--font-serif);
    }
    
    .event-title {
      font-size: 3rem;
      font-weight: 300;
      line-height: 1.1;
      margin-bottom: 8px;
    }
    
    .event-date {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      color: var(--text-taupe);
      margin-bottom: 12px;
    }
    
    .event-venue {
      font-size: 13px;
      font-style: italic;
      color: var(--text-taupe);
    }
  </style>
</head>
<body>
  <div class="keepsake-wrapper">
    <header class="keepsake-header">
      <div class="logo-badge">
        <svg viewBox="0 0 24 24" fill="none" style="width:16px; height:16px;"><path d="M7 6C7 4.89543 9.23858 4 12 4C14.7614 4 17 4.89543 17 6C17 7.10457 14.7614 8 12 8C9.23858 8 7 7.10457 7 6Z" fill="var(--text-taupe)"/><path d="M4 11C4 9.34315 7.58172 8 12 8C16.4183 8 20 9.34315 20 11C20 12.6569 16.4183 14 12 14C7.58172 14 4 12.6569 4 11Z" fill="var(--text-taupe)" opacity="0.6"/><path d="M2 17.5C2 15.2909 6.47715 13.5 12 13.5C17.5228 13.5 22 15.2909 22 17.5C22 19.7091 17.5228 21.5 12 21.5C6.47715 21.5 2 19.7091 2 17.5Z" fill="var(--text-taupe)"/></svg>
        cairn keepsake
      </div>
      <h1 class="event-title serif-display">${headlineStr}</h1>
      <div class="event-date">${new Date(state.hostConfig.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="event-venue">${state.hostConfig.venue}</div>
    </header>
    
    <div class="keepsake-feed">
      ${cardsHTML}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `cairn_keepsake_${p1.toLowerCase()}_${type}.html`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==================== PRINTABLE QR SIGNAGE VIEW NAVIGATION ====================
window.openPrintSignage = function() {
  state.lastScreenBeforePrint = state.activeScreen;
  
  const gb = state.hostGuestbooks[0] || state.hostConfig;
  
  const titleEl = document.getElementById('signage-event-title');
  const dateEl = document.getElementById('signage-event-date');
  const footerEl = document.querySelector('.signage-footer p');
  
  if (titleEl) {
    titleEl.innerText = getEventDisplayNameForGb(gb);
  }
  if (dateEl) {
    if (gb.date) {
      try {
        const parsedDate = new Date(gb.date);
        dateEl.innerText = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch(e) {
        dateEl.innerText = gb.date;
      }
    } else {
      dateEl.innerText = "";
    }
  }
  if (footerEl) {
    const slug = getEventDisplayNameForGb(gb).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    footerEl.innerText = `cairn.guestbook/${slug}`;
  }
  
  // Inherit the active event theme fonts
  const card = document.getElementById('signage-print-content');
  if (card) {
    const selectedFont = state.hostConfig.vibes.fontFamily || 'newsreader';
    const fontName = FONTS.serif[selectedFont] || FONTS.sans[selectedFont] || FONTS.serif['newsreader'];
    card.style.fontFamily = fontName;
    
    const titleHeader = card.querySelector('#signage-event-title');
    if (titleHeader) {
      if (FONTS.serif[selectedFont]) {
        titleHeader.className = 'serif-display';
      } else {
        titleHeader.className = '';
      }
    }
  }
  
  // Inherit active event theme color variables
  const currentPalKey = state.hostConfig.vibes.palette;
  const pal = currentPalKey === 'custom' ? {
    bg: state.hostConfig.vibes.customColors.bg,
    surface: '#FFFFFF',
    text: '#1F1B16',
    taupe: '#A89A8A',
    accent: '#C9A19A'
  } : (PALETTES[currentPalKey] || PALETTES['cairn-cream']);
  
  if (card) {
    card.style.setProperty('--bg-cream', pal.bg);
    card.style.setProperty('--surface-white', pal.surface);
    card.style.setProperty('--text-charcoal', pal.text);
    card.style.setProperty('--text-taupe', pal.taupe);
    card.style.setProperty('--accent-rose', pal.accent);
  }
  
  navigateTo(7);
};

window.closePrintSignage = function() {
  const returnScreen = state.lastScreenBeforePrint !== undefined ? state.lastScreenBeforePrint : 0;
  navigateTo(returnScreen);
};

