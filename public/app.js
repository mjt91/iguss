// iGuss — Pflanzen Gieß-Plan App

const STORAGE_KEY = 'iguss_plants';

// ── Helpers ──────────────────────────────────────────────
function loadPlants() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePlants(plants) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysSince(dateStr) {
  const d1 = new Date(dateStr);
  const d2 = new Date();
  d2.setHours(0,0,0,0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function daysUntilWater(plant) {
  const passed = daysSince(plant.lastWatered);
  return plant.interval - passed;
}

function daysUntilFertilize(plant) {
  if (!plant.fertilizeInterval || !plant.lastFertilized) return null;
  return plant.fertilizeInterval - daysSince(plant.lastFertilized);
}

function fertExportEnabled(plant) {
  return !!plant.fertilizeInterval && plant.includeFertilizerInExport !== false;
}

function locationIcon(loc) {
  return loc === 'indoor' ? '🏠' : loc === 'pot' ? '🪴' : '🌱';
}

function locationLabel(loc) {
  return loc === 'indoor' ? 'Haus' : loc === 'pot' ? 'Kübel' : 'Beet';
}

// ── Calendar Export ───────────────────────────────────────
function generateICS() {
  const plants = loadPlants();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//iGuss//Plant Watering Calendar//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:iGuss Gieß- & Düngeplan',
    'X-WR-TIMEZONE:Europe/Berlin',
    'X-WR-CALDESC:Automatisch generierter Gieß- und Düngeplan für deine Pflanzen'
  ];
  
  const locationMap = {
    'indoor': 'Im Haus',
    'pot': 'Draußen im Kübel',
    'bed': 'Im Beet'
  };
  
  plants.forEach(plant => {
    // Calculate next watering date
    const lastWatered = new Date(plant.lastWatered);
    const nextWater = new Date(lastWatered);
    nextWater.setDate(lastWatered.getDate() + plant.interval);
    
    // If next water date is in the past, calculate from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (nextWater < today) {
      nextWater.setDate(nextWater.getDate() + plant.interval);
    }
    
    // Recurring event series for the next 12 months
    const startDateStr = nextWater.toISOString().split('T')[0].replace(/-/g, '');
    const untilDate = new Date(nextWater);
    untilDate.setFullYear(untilDate.getFullYear() + 1);
    const untilStr = untilDate.toISOString().split('T')[0].replace(/-/g, '');
    const uid = `${plant.id}-${startDateStr}@iguss`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${startDateStr}`,
      `DTEND;VALUE=DATE:${startDateStr}`,
      `RRULE:FREQ=DAILY;INTERVAL=${plant.interval};UNTIL=${untilStr}`,
      `SUMMARY:💧 ${plant.name} gießen`,
      `DESCRIPTION:Pflanze: ${plant.name}${plant.type ? ' (' + plant.type + ')' : ''}\\nStandort: ${locationMap[plant.location]}\\nIntervall: Alle ${plant.interval} Tage\\nApp: iGuss`,
      `LOCATION:${locationMap[plant.location]}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Gieße ${plant.name}!`,
      'TRIGGER:-PT2H',
      'END:VALARM',
      'END:VEVENT'
    );

    if (fertExportEnabled(plant)) {
      const lastFert = plant.lastFertilized ? new Date(plant.lastFertilized) : new Date();
      const nextFert = new Date(lastFert);
      nextFert.setDate(lastFert.getDate() + plant.fertilizeInterval);
      while (nextFert < today) {
        nextFert.setDate(nextFert.getDate() + plant.fertilizeInterval);
      }
      const fertStartStr = nextFert.toISOString().split('T')[0].replace(/-/g, '');
      const fertUntilDate = new Date(nextFert);
      fertUntilDate.setFullYear(fertUntilDate.getFullYear() + 1);
      const fertUntilStr = fertUntilDate.toISOString().split('T')[0].replace(/-/g, '');
      const fertUid = `${plant.id}-fert-${fertStartStr}@iguss`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${fertUid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART;VALUE=DATE:${fertStartStr}`,
        `DTEND;VALUE=DATE:${fertStartStr}`,
        `RRULE:FREQ=DAILY;INTERVAL=${plant.fertilizeInterval};UNTIL=${fertUntilStr}`,
        `SUMMARY:🌿 ${plant.name} düngen`,
        `DESCRIPTION:Pflanze: ${plant.name}${plant.type ? ' (' + plant.type + ')' : ''}\\nStandort: ${locationMap[plant.location]}\\nDünge-Intervall: Alle ${plant.fertilizeInterval} Tage\\nApp: iGuss`,
        `LOCATION:${locationMap[plant.location]}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Dünge ${plant.name}!`,
        'TRIGGER:-PT2H',
        'END:VALARM',
        'END:VEVENT'
      );
    }
  });
  
  icsContent.push('END:VCALENDAR');
  
  return icsContent.join('\r\n');
}

function exportCalendar() {
  const plants = loadPlants();
  if (plants.length === 0) {
    alert('Keine Pflanzen vorhanden. Füge zuerst Pflanzen hinzu!');
    return;
  }
  
  const icsContent = generateICS();
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `iguss-giessplan-${todayStr()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// ── Tabs ─────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      render();
    });
  });
}

// ── Render ───────────────────────────────────────────────
function render() {
  const plants = loadPlants();
  renderToday(plants);
  renderAll(plants);
}

function enrich(plants) {
  return plants.map(p => ({
    ...p,
    daysUntil: daysUntilWater(p),
    daysUntilFert: daysUntilFertilize(p),
  }));
}

function urgencySort(a, b) {
  const aMin = Math.min(a.daysUntil, a.daysUntilFert ?? Infinity);
  const bMin = Math.min(b.daysUntil, b.daysUntilFert ?? Infinity);
  return aMin - bMin;
}

function renderToday(plants) {
  const list = document.getElementById('today-list');
  const due = enrich(plants)
    .filter(p => p.daysUntil <= 0 || (p.daysUntilFert !== null && p.daysUntilFert <= 0))
    .sort(urgencySort);

  if (due.length === 0) {
    list.innerHTML = '<p class="empty">🎉 Alles versorgt! Keine Pflanzen müssen heute gegossen oder gedüngt werden.</p>';
    return;
  }

  list.innerHTML = due.map(p => plantCard(p, true)).join('');
  attachCardListeners();
}

function renderAll(plants) {
  const list = document.getElementById('all-plants');
  if (plants.length === 0) {
    list.innerHTML = '<p class="empty">Noch keine Pflanzen. Gehe auf „Hinzufügen“!</p>';
    return;
  }

  const sorted = enrich(plants).sort(urgencySort);
  list.innerHTML = sorted.map(p => plantCard(p, false)).join('');
  attachCardListeners();
}

function plantCard(p, isToday) {
  const days = p.daysUntil;
  let statusClass = 'ok';
  let statusText = `<span class="ok-text">in ${days} Tagen</span>`;

  if (days < 0) {
    statusClass = 'overdue';
    statusText = `<span class="overdue-text">${Math.abs(days)} Tag${Math.abs(days) !== 1 ? 'e' : ''} überfällig!</span>`;
  } else if (days === 0) {
    statusClass = 'overdue';
    statusText = `<span class="overdue-text">Heute!</span>`;
  } else if (days === 1) {
    statusClass = 'due-soon';
    statusText = `<span class="due-text">Morgen</span>`;
  } else if (days <= 2) {
    statusClass = 'due-soon';
    statusText = `<span class="due-text">in ${days} Tagen</span>`;
  }

  let fertLine = '';
  let fertBtn = '';
  if (p.daysUntilFert !== null && p.daysUntilFert !== undefined) {
    const fd = p.daysUntilFert;
    let fertText;
    if (fd < 0) fertText = `${Math.abs(fd)} Tag${Math.abs(fd) !== 1 ? 'e' : ''} überfällig`;
    else if (fd === 0) fertText = 'heute fällig';
    else if (fd === 1) fertText = 'morgen fällig';
    else fertText = `in ${fd} Tagen`;
    fertLine = `<span class="fert-line">🌿 Düngen: ${fertText} · alle ${p.fertilizeInterval} Tage</span>`;
    fertBtn = `<button class="fertilize-btn" data-id="${p.id}">🌿 Gedüngt</button>`;
  }

  return `
    <div class="plant-card ${statusClass}" data-id="${p.id}">
      <div class="plant-header">
        <div>
          <div class="plant-name">${p.name}</div>
          <div class="plant-type">${p.type || ''}</div>
        </div>
        <span class="plant-location">${locationIcon(p.location)} ${locationLabel(p.location)}</span>
      </div>
      <div class="plant-info">
        <div class="plant-status">${statusText} · alle ${p.interval} Tage${fertLine}</div>
        <div class="plant-actions">
          <button class="water-btn" data-id="${p.id}">💧 Gegossen</button>
          ${fertBtn}
        </div>
      </div>
      ${!isToday ? `
        <div class="card-actions">
          <button class="edit-btn" data-id="${p.id}">✏️ Bearbeiten</button>
          <button class="delete-btn" data-id="${p.id}">🗑️ Löschen</button>
        </div>
      ` : ''}
    </div>
  `;
}

function attachCardListeners() {
  document.querySelectorAll('.water-btn').forEach(btn => {
    btn.addEventListener('click', () => waterPlant(btn.dataset.id));
  });
  document.querySelectorAll('.fertilize-btn').forEach(btn => {
    btn.addEventListener('click', () => fertilizePlant(btn.dataset.id));
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEdit(btn.dataset.id));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deletePlant(btn.dataset.id));
  });
}

// ── Actions ──────────────────────────────────────────────
function waterPlant(id) {
  const plants = loadPlants();
  const p = plants.find(x => x.id === id);
  if (!p) return;
  p.lastWatered = todayStr();
  savePlants(plants);
  render();
}

function fertilizePlant(id) {
  const plants = loadPlants();
  const p = plants.find(x => x.id === id);
  if (!p) return;
  p.lastFertilized = todayStr();
  savePlants(plants);
  render();
}

function deletePlant(id) {
  if (!confirm('Pflanze wirklich löschen?')) return;
  let plants = loadPlants();
  plants = plants.filter(x => x.id !== id);
  savePlants(plants);
  render();
}

function openEdit(id) {
  const plants = loadPlants();
  const p = plants.find(x => x.id === id);
  if (!p) return;

  document.getElementById('e-id').value = p.id;
  document.getElementById('e-name').value = p.name;
  document.getElementById('e-type').value = p.type || '';
  document.getElementById('e-location').value = p.location;
  document.getElementById('e-interval').value = p.interval;
  document.getElementById('e-last-watered').value = p.lastWatered;
  document.getElementById('e-fert-interval').value = p.fertilizeInterval || '';
  document.getElementById('e-last-fertilized').value = p.lastFertilized || '';
  document.getElementById('e-fert-export').checked = p.includeFertilizerInExport !== false;

  document.getElementById('edit-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

// ── Forms ────────────────────────────────────────────────
function initForms() {
  // Add form
  document.getElementById('plant-form').addEventListener('submit', e => {
    e.preventDefault();
    const plants = loadPlants();
    const fertIntervalRaw = document.getElementById('p-fert-interval').value;
    const newPlant = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: document.getElementById('p-name').value.trim(),
      type: document.getElementById('p-type').value.trim(),
      location: document.getElementById('p-location').value,
      interval: parseInt(document.getElementById('p-interval').value),
      lastWatered: document.getElementById('p-last-watered').value,
    };
    if (fertIntervalRaw) {
      newPlant.fertilizeInterval = parseInt(fertIntervalRaw);
      newPlant.lastFertilized = document.getElementById('p-last-fertilized').value || todayStr();
      newPlant.includeFertilizerInExport = document.getElementById('p-fert-export').checked;
    }
    plants.push(newPlant);
    savePlants(plants);
    e.target.reset();
    document.getElementById('p-last-watered').value = todayStr();
    document.getElementById('p-fert-export').checked = true;

    // Switch to "Today" tab
    document.querySelector('[data-tab="today"]').click();
  });

  // Edit form
  document.getElementById('edit-form').addEventListener('submit', e => {
    e.preventDefault();
    const plants = loadPlants();
    const id = document.getElementById('e-id').value;
    const p = plants.find(x => x.id === id);
    if (!p) return;

    p.name = document.getElementById('e-name').value.trim();
    p.type = document.getElementById('e-type').value.trim();
    p.location = document.getElementById('e-location').value;
    p.interval = parseInt(document.getElementById('e-interval').value);
    p.lastWatered = document.getElementById('e-last-watered').value;

    const fertIntervalRaw = document.getElementById('e-fert-interval').value;
    if (fertIntervalRaw) {
      p.fertilizeInterval = parseInt(fertIntervalRaw);
      p.lastFertilized = document.getElementById('e-last-fertilized').value || todayStr();
      p.includeFertilizerInExport = document.getElementById('e-fert-export').checked;
    } else {
      delete p.fertilizeInterval;
      delete p.lastFertilized;
      delete p.includeFertilizerInExport;
    }

    savePlants(plants);
    closeModal();
    render();
  });

  // Close modal on backdrop click
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('edit-modal')) closeModal();
  });
}

// ── PWA / Install prompt ─────────────────────────────────
function initPWA() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }

  // Install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBar();
  });

  function showInstallBar() {
    if (document.querySelector('.install-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'install-bar';
    bar.innerHTML = `
      <span>📲 iGuss als App installieren?</span>
      <button id="install-btn">Installieren</button>
    `;
    document.body.appendChild(bar);
    document.getElementById('install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      bar.remove();
    });
  }
}

// ── Version badge ────────────────────────────────────────
function initVersion() {
  const el = document.getElementById('app-version');
  if (!el) return;
  fetch('/version')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.version) el.textContent = 'v' + data.version;
    })
    .catch(() => {});
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // DB Search
  const dbSearch = document.getElementById('p-db-search');
  const dbResults = document.getElementById('db-results');

  if (dbSearch && typeof PLANT_DB !== 'undefined') {
    dbSearch.addEventListener('input', () => {
      const q = dbSearch.value.trim().toLowerCase();
      if (!q) { dbResults.classList.remove('active'); return; }

      const hits = PLANT_DB.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      ).slice(0, 8);

      if (hits.length === 0) { dbResults.classList.remove('active'); return; }

      dbResults.innerHTML = hits.map(p => `
        <div class="db-result-item" data-name="${p.name}" data-type="${p.type}"
             data-interval="${p.interval}" data-location="${p.location}" data-note="${p.note || ''}">
          <div class="db-result-header">
            <span class="db-name">${p.name}</span>
            <span class="db-location-badge">${locationIcon(p.location)}</span>
          </div>
          <div class="db-type">${p.type}</div>
          <div class="db-note"> alle ${p.interval} Tage · ${locationLabel(p.location)}${p.note ? ' · ' + p.note : ''}</div>
        </div>
      `).join('');
      dbResults.classList.add('active');

      dbResults.querySelectorAll('.db-result-item').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById('p-name').value = item.dataset.name;
          document.getElementById('p-type').value = item.dataset.type;
          document.getElementById('p-interval').value = item.dataset.interval;
          document.getElementById('p-location').value = item.dataset.location;
          dbSearch.value = '';
          dbResults.classList.remove('active');
        });
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!dbSearch.contains(e.target) && !dbResults.contains(e.target)) {
        dbResults.classList.remove('active');
      }
    });
  }
  initTabs();
  initForms();
  initPWA();
  initVersion();
  render();
});
