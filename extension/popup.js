const FIELDS = [
  { key: 'name', label: 'Full Name', section: 'personal' },
  { key: 'fatherName', label: "Father's Name", section: 'personal' },
  { key: 'dateOfBirth', label: 'Date of Birth', section: 'personal' },
  { key: 'gender', label: 'Gender', section: 'personal' },
  { key: 'email', label: 'Email Address', section: 'personal' },
  { key: 'phone', label: 'Phone Number', section: 'personal' },
  { key: 'address', label: 'Address', section: 'address' },
  { key: 'district', label: 'District', section: 'address' },
  { key: 'state', label: 'State', section: 'address' },
  { key: 'pincode', label: 'Pincode', section: 'address' },
  { key: 'aadhaarNumber', label: 'Aadhaar Number', section: 'ids' },
  { key: 'panNumber', label: 'PAN Number', section: 'ids' },
  { key: 'voterIdNumber', label: 'Voter ID', section: 'ids' },
  { key: 'drivingLicenseNumber', label: 'Driving License', section: 'ids' },
  { key: 'marks10th', label: '10th Marks', section: 'academic' },
  { key: 'marks12th', label: '12th Marks', section: 'academic' },
  { key: 'sgpa', label: 'Engineering SGPA', section: 'academic' },
  { key: 'codechefLink', label: 'CodeChef Profile', section: 'academic' },
  { key: 'leetcodeLink', label: 'LeetCode Profile', section: 'academic' },
  { key: 'githubLink', label: 'GitHub Profile', section: 'academic' },
  { key: 'gfgLink', label: 'GFG Profile', section: 'academic' },
  { key: 'hackerrankLink', label: 'HackerRank Profile', section: 'academic' },
  { key: 'linkedinLink', label: 'LinkedIn Profile', section: 'academic' },
];

let currentData = {};
let customFields = []; // { key, label }

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
  });
});

// Load data
function loadData() {
  chrome.storage.local.get(['docfillData', 'docfillCustomFields', 'docfillDebug'], (result) => {
    currentData = result.docfillData || {};
    customFields = result.docfillCustomFields || [];
    const dbg = document.getElementById('debug-toggle');
    if (dbg) dbg.checked = !!result.docfillDebug;
    renderView();
    populateEdit();
    renderCustomFields();
  });
}

function renderView() {
  const container = document.getElementById('data-display');
  const filledFields = FIELDS.filter(f => currentData[f.key]);
  
  if (filledFields.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <p>No data stored yet.<br>Extract documents from the app or add data manually in the Edit tab.</p>
      </div>`;
    return;
  }

  let html = '';
  let currentSection = '';
  const sectionLabels = { personal: '👤 Personal', address: '📍 Address', ids: '🪪 Documents', academic: '🎓 Academic & Profile', custom: '➕ Custom' };
  
  const allFields = [...filledFields];
  customFields.forEach(cf => {
    if (currentData[cf.key]) allFields.push({ ...cf, section: 'custom' });
  });

  allFields.forEach(field => {
    if (field.section !== currentSection) {
      currentSection = field.section;
      html += `<div class="section-title">${sectionLabels[currentSection] || currentSection}</div>`;
    }
    const isLink = (field.key || '').toLowerCase().includes('link') || (currentData[field.key] || '').startsWith('http');
    const displayValue = isLink
      ? `<a href="${currentData[field.key]}" target="_blank" style="color:#4f46e5;text-decoration:underline;">${currentData[field.key]}</a>`
      : currentData[field.key];
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin-bottom:4px;background:white;border-radius:6px;border:1px solid #e2e8f0;">
        <span style="font-size:11px;color:#64748b;">${field.label}</span>
        <span style="font-size:13px;font-weight:600;color:#1e293b;">${displayValue}</span>
      </div>`;
  });
  
  html += `<div style="margin-top:12px;text-align:center;"><span class="badge">${allFields.length} fields stored</span></div>`;
  container.innerHTML = html;
}

function populateEdit() {
  FIELDS.forEach(f => {
    const el = document.getElementById('edit-' + f.key);
    if (el) el.value = currentData[f.key] || '';
  });
}

function renderCustomFields() {
  const container = document.getElementById('custom-fields-container');
  if (customFields.length === 0) {
    container.innerHTML = `<p style="font-size:12px;color:#94a3b8;text-align:center;padding:8px 0;">No custom fields yet. Add one below.</p>`;
    return;
  }
  container.innerHTML = customFields.map((cf, i) => `
    <div class="field-group" style="background:#f8fafc;padding:8px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:8px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <input type="text" class="custom-label-input" data-index="${i}" value="${cf.label.replace(/"/g, '&quot;')}" style="flex:1;padding:6px 8px;font-size:12px;font-weight:600;border:1.5px solid #e2e8f0;border-radius:4px;" title="Edit field label">
        <button type="button" class="rename-custom" data-index="${i}" title="Save label" style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:4px;padding:4px 8px;font-size:12px;cursor:pointer;">✓</button>
        <button type="button" class="remove-custom" data-index="${i}" title="Delete field" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:4px;padding:4px 8px;font-size:12px;cursor:pointer;">✕</button>
      </div>
      <input type="text" id="edit-custom-${cf.key}" value="${(currentData[cf.key] || '').replace(/"/g, '&quot;')}" placeholder="Value for ${cf.label.replace(/"/g, '&quot;')}">
    </div>
  `).join('');

  container.querySelectorAll('.remove-custom').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (!confirm(`Delete custom field "${customFields[idx].label}"?`)) return;
      delete currentData[customFields[idx].key];
      customFields.splice(idx, 1);
      chrome.storage.local.set({ docfillData: currentData, docfillCustomFields: customFields }, () => {
        renderCustomFields();
        renderView();
        showStatus('save-status', 'Custom field deleted', 'info');
      });
    });
  });

  container.querySelectorAll('.rename-custom').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const input = container.querySelector(`.custom-label-input[data-index="${idx}"]`);
      const newLabel = (input.value || '').trim();
      if (!newLabel) {
        showStatus('save-status', 'Label cannot be empty', 'error');
        return;
      }
      const valueEl = document.getElementById('edit-custom-' + customFields[idx].key);
      if (valueEl && valueEl.value.trim()) {
        currentData[customFields[idx].key] = valueEl.value.trim();
      }
      customFields[idx].label = newLabel;
      chrome.storage.local.set({ docfillData: currentData, docfillCustomFields: customFields }, () => {
        renderCustomFields();
        renderView();
        showStatus('save-status', 'Label updated', 'success');
      });
    });
  });
}

document.getElementById('add-field-btn').addEventListener('click', () => {
  const label = document.getElementById('new-field-label').value.trim();
  if (!label) return;
  const key = 'custom_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (customFields.some(f => f.key === key)) {
    showStatus('save-status', 'Field already exists!', 'error');
    return;
  }
  customFields.push({ key, label });
  chrome.storage.local.set({ docfillCustomFields: customFields });
  document.getElementById('new-field-label').value = '';
  renderCustomFields();
});

// Import custom fields from JSON
document.getElementById('import-custom-btn').addEventListener('click', () => {
  const text = document.getElementById('import-custom-json').value.trim();
  if (!text) {
    showStatus('custom-import-status', 'Paste JSON data first.', 'error');
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    showStatus('custom-import-status', 'Invalid JSON format.', 'error');
    return;
  }

  // Normalize to array of {label, value}
  let entries = [];
  if (Array.isArray(parsed)) {
    entries = parsed
      .map(item => {
        if (!item || typeof item !== 'object') return null;
        const label = (item.label || item.name || item.key || '').toString().trim();
        const value = item.value !== undefined ? String(item.value) : '';
        return label ? { label, value } : null;
      })
      .filter(Boolean);
  } else if (parsed && typeof parsed === 'object') {
    entries = Object.entries(parsed).map(([label, value]) => ({
      label: label.trim(),
      value: value == null ? '' : String(value),
    }));
  }

  if (entries.length === 0) {
    showStatus('custom-import-status', 'No valid fields found in JSON.', 'error');
    return;
  }

  let added = 0, updated = 0;
  entries.forEach(({ label, value }) => {
    if (!label) return;
    const key = 'custom_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = customFields.find(f => f.key === key);
    if (!existing) {
      customFields.push({ key, label });
      added++;
    } else {
      updated++;
    }
    if (value) currentData[key] = value;
  });

  chrome.storage.local.set({ docfillCustomFields: customFields, docfillData: currentData }, () => {
    document.getElementById('import-custom-json').value = '';
    renderCustomFields();
    renderView();
    showStatus('custom-import-status', `Imported ${added} new, updated ${updated} field(s).`, 'success');
  });
});

// Save
document.getElementById('save-btn').addEventListener('click', () => {
  FIELDS.forEach(f => {
    const el = document.getElementById('edit-' + f.key);
    if (el && el.value.trim()) {
      currentData[f.key] = el.value.trim();
    } else {
      delete currentData[f.key];
    }
  });
  customFields.forEach(cf => {
    const el = document.getElementById('edit-custom-' + cf.key);
    if (el && el.value.trim()) {
      currentData[cf.key] = el.value.trim();
    } else {
      delete currentData[cf.key];
    }
  });
  
  chrome.storage.local.set({ docfillData: currentData, docfillCustomFields: customFields }, () => {
    renderView();
    showStatus('save-status', 'Data saved successfully!', 'success');
  });
});

// Fill Google Form
document.getElementById('fill-btn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'fillForm', data: currentData });
    showStatus('settings-status', 'Fill triggered! Check the form (and page console if debug mode is on).', 'success');
  } catch (e) {
    showStatus('settings-status', 'Could not fill form. Try refreshing the Google Form page.', 'error');
  }
});

// Debug toggle
document.getElementById('debug-toggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  chrome.storage.local.set({ docfillDebug: enabled });
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'setDebug', enabled });
  } catch {}
  showStatus('settings-status', `Debug mode ${enabled ? 'enabled — open DevTools console (F12) on the form page' : 'disabled'}`, 'info');
});

// Export
document.getElementById('export-btn').addEventListener('click', async () => {
  const text = FIELDS.filter(f => currentData[f.key]).map(f => `${f.label}: ${currentData[f.key]}`).join('\n');
  if (!text) { showStatus('settings-status', 'No data to copy', 'error'); return; }
  await navigator.clipboard.writeText(text);
  showStatus('settings-status', 'Data copied to clipboard!', 'success');
});

// Import from textarea
document.getElementById('import-btn').addEventListener('click', () => {
  const text = document.getElementById('import-json').value.trim();
  if (!text) {
    showStatus('settings-status', 'Paste JSON data in the text box above first.', 'error');
    return;
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      showStatus('settings-status', 'JSON must be an object of {"field":"value"} pairs.', 'error');
      return;
    }
    const standardKeys = new Set(FIELDS.map(f => f.key));
    let standardCount = 0, customAdded = 0, customUpdated = 0;
    Object.entries(parsed).forEach(([key, value]) => {
      const strVal = value == null ? '' : String(value);
      if (standardKeys.has(key)) {
        currentData[key] = strVal;
        standardCount++;
      } else {
        // Treat as custom field — key becomes label
        const label = key;
        const customKey = 'custom_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const existing = customFields.find(f => f.key === customKey);
        if (!existing) {
          customFields.push({ key: customKey, label });
          customAdded++;
        } else {
          customUpdated++;
        }
        currentData[customKey] = strVal;
      }
    });
    chrome.storage.local.set({ docfillData: currentData, docfillCustomFields: customFields }, () => {
      renderView();
      populateEdit();
      renderCustomFields();
      document.getElementById('import-json').value = '';
      showStatus('settings-status', `Imported: ${standardCount} standard, ${customAdded} new custom, ${customUpdated} updated custom.`, 'success');
    });
  } catch (e) {
    showStatus('settings-status', 'Invalid JSON format. Please check the pasted data.', 'error');
  }
});

// Clear
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Clear all stored data?')) {
    currentData = {};
    chrome.storage.local.remove('docfillData', () => {
      renderView();
      populateEdit();
      showStatus('settings-status', 'All data cleared', 'info');
    });
  }
});

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="status ${type}">${msg}</div>`;
  setTimeout(() => el.innerHTML = '', 3000);
}

loadData();
