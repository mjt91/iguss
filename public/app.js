// iGuss — Pflanzen Gieß-Plan App (localStorage + optional server backup)

const STORAGE_KEY = 'iguss_plants';
const BACKUP_KEY = 'iguss_backup_id';

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

function locationIcon(loc) {
  return loc === 'indoor' ? '🏠' : loc === 'pot' ? '🪴' : '🌱';
}

function locationLabel(loc) {
  return loc === 'indoor' ? 'Haus' : loc === 'pot' ? 'Kübel' : 'Beet';
}

// ── Backup & Sync ──────────────────────────────────────────
async function backupToServer() {
  const plants = loadPlants();
  const backupId = localStorage.getItem(BACKUP_KEY) || generateBackupId();
  
  try {
    const response = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId, plants })
    });
    
    if (response.ok) {
      localStorage.setItem(BACKUP_KEY, backupId);
      showNotification('💾 Backup erfolgreich!', 'success');
      updateBackupStatus('Gesichert: ' + new Date().toLocaleString());
    } else {
      throw new Error('Backup failed');
    }
  } catch (err) {
    console.error('Backup error:', err);
    showNotification('❌ Backup fehlgeschlagen', 'error');
    updateBackupStatus('Fehler beim Speichern');
  }
}

async function restoreFromServer() {
  const backupId = localStorage.getItem(BACKUP_KEY);
  if (!backupId) {
    showNotification('ℹ️ Kein Backup vorhanden', 'info');
    return;
  }
  
  if (!confirm('Dadurch werden deine aktuellen Daten überschrieben. Fortfahren?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/backup/${backupId}`);
    if (!response.ok) throw new Error('Restore failed');
    
    const data = await response.json();
    if (data.plants && Array.isArray(data.plants)) {
      savePlants(data.plants);
      render();
      showNotification('✅ Wiederherstellung erfolgreich!', 'success');
      updateBackupStatus('Wiederhergestellt: ' + new Date().toLocaleString());
    } else {
      throw new Error('Invalid data');
    }
  } catch (err) {
    console.error('Restore error:', err);
    showNotification('❌ Wiederherstellung fehlgeschlagen', 'error');
  }
}

async function exportBackupFile() {
  const plants = loadPlants();
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    plants: plants
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `iguss-backup-${todayStr()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification('💾 Datei heruntergeladen!', 'success');
}

async function importBackupFile(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.plants || !Array.isArray(data.plants)) {
      throw new Error('Invalid backup file');
    }
    
    if (confirm(`Soll das Backup vom ${new Date(data.exported).toLocaleString()} geladen werden?\n\nDadurch werden aktuelle Daten ersetzt!`)) {
      savePlants(data.plants);
      render();
      showNotification('✅ Backup geladen!', 'success');
    }
  } catch (err) {
    console.error('Import error:', err);
    showNotification('❌ Ungültige Backup-Datei', 'error');
  }
}

function generateBackupId() {
  return 'iguss_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notif = document.createElement('div');
  notif.className = `notification notification-${type}`;
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#2d6a4f' : type === 'error' ? '#dc2626' : '#4b5563'};
    color: white;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function updateBackupStatus(text) {
  const statusEl = document.getElementById('backup-status');
  if (statusEl) statusEl.textContent = text;
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
    'X-WR-CALNAME:iGuss Gieß-Plan',
    'X-WR-TIMEZONE:Europe/Berlin',
    'X-WR-CALDESC:Automatisch generierter Gieß-Plan für deine Pflanzen'
  ];
  
  const locationMap = {
    'indoor': 'Im Haus',
    'pot': 'Draußen im Kübel',
    'bed': 'Im Beet'
  };
  
  plants.forEach(plant => {
    const lastWatered = new Date(plant.lastWatered);
    const nextWater = new Date(lastWatered);
    nextWater.setDate(lastWatered.getDate() + plant.interval);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (nextWater < today) {
      nextWater.setDate(nextWater.getDate() + plant.interval);
    }
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);
    
    let currentDate = new Date(nextWater);
    let eventCount = 0;
    
    while (currentDate < endDate && eventCount < 52) {
      const dateStr = currentDate.toISOString().split('T')[0].replace(/-/g, '');
      const uid = `${plant.id}-${dateStr}@iguss`;
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
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
      
      currentDate.setDate(currentDate.getDate() + plant.interval);
      eventCount++;
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

function renderToday(plants) {
  const list = document.getElementById('today-list');
  const due = plants
    .map(p => ({ ...p, daysUntil: daysUntilWater(p) }))
    .filter(p => p.daysUntil <= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (due.length === 0) {
    list.innerHTML = '<p class="empty">🎉 Alles versorgt! Keine Pflanzen müssen heute gegossen werden.</p>';
    return;
  }

  list.innerHTML = due.map(p => plantCard(p, true)).join('');
  attachCardListeners();
}

function renderAll(plants) {
  const list = document.getElementById('all-plants');
  if (plants.length === 0) {
    list.innerHTML = '<p class="empty">Noch keine Pflanzen. Gehe auf „Hinzufügen"!</p>';
    return;
  }

  const sorted = plants
    .map(p => ({ ...p, daysUntil: daysUntilWater(p) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

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
        <div class="plant-status">${statusText} · alle ${p.interval} Tage</div>
        <button class="water-btn" data-id="${p.id}">💧 Gegossen</button>
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
    plants.push({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: document.getElementById('p-name').value.trim(),
      type: document.getElementById('p-type').value.trim(),
      location: document.getElementById('p-location').value,
      interval: parseInt(document.getElementById('p-interval').value),
      lastWatered: document.getElementById('p-last-watered').value,
    });
    savePlants(plants);
    e.target.reset();
    document.getElementById('p-last-watered').value = todayStr();
    
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

    savePlants(plants);
    closeModal();
    render();
  });

  // Close modal on backdrop click
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('edit-modal')) closeModal();
  });
}

// ── Backup UI ─────────────────────────────────────────────
function initBackupUI() {
  // Create backup section in settings tab
  const backupSection = document.getElementById('backup-section');
  if (backupSection) {
    backupSection.innerHTML = `
      <div class="backup-panel">
        <h3>💾 Datensicherung</h3>
        <p class="backup-info">
          Deine Pflanzen werden automatisch in diesem Browser gespeichert. 
          Du kannst sie zusätzlich auf dem Server sichern oder als Datei exportieren.
        </p>
        <div class="backup-actions">
          <button onclick="backupToServer()" class="btn-primary">
            💾 Auf Server sichern
          </button>
          <button onclick="restoreFromServer()" class="btn-secondary">
            📥 Von Server wiederherstellen
          </button>
          <button onclick="exportBackupFile()" class="btn-secondary">
            📤 Als Datei exportieren
          </button>
        </div>
        <div class="backup-file-import">
          <label class="file-label">
            📁 Backup-Datei importieren
            <input type="file" id="backup-file-input" accept=".json" style="display: none;">
          </label>
        </div>
        <div id="backup-status" class="backup-status"></div>
      </div>
    `;
    
    // File import handler
    const fileInput = document.getElementById('backup-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackupFile(e.target.files[0]);
        }
      });
    }
  }
  
  // Auto-backup on change (optional - can be disabled)
  const originalSavePlants = savePlants;
  savePlants = function(plants) {
    originalSavePlants(plants);
    // Uncomment to enable auto-backup:
    // backupToServer();
  };
}

// ── PWA / Install prompt ─────────────────────────────────
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }

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

    document.addEventListener('click', e => {
      if (!dbSearch.contains(e.target) && !dbResults.contains(e.target)) {
        dbResults.classList.remove('active');
      }
    });
  }
  initTabs();
  initForms();
  initBackupUI();
  initPWA();
  render();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  .backup-panel {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-top: 20px;
  }
  .backup-panel h3 {
    margin-top: 0;
    color: #2d6a4f;
  }
  .backup-info {
    color: #666;
    margin-bottom: 16px;
  }
  .backup-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }
  .backup-file-import {
    margin-top: 10px;
  }
  .file-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 2px dashed #2d6a4f;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .file-label:hover {
    background: #e8f5e9;
  }
  .backup-status {
    margin-top: 12px;
    font-size: 14px;
    color: #666;
    min-height: 20px;
  }
`;
document.head.appendChild(style);
