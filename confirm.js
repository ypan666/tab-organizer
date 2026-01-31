// ============================================
// Confirm Archive Page Logic
// ============================================

let inactiveTabs = [];
let selectedTabIds = new Set();

document.addEventListener('DOMContentLoaded', async () => {
  await loadInactiveTabs();
  bindEvents();
});

// ============================================
// Load inactive tabs
// ============================================
async function loadInactiveTabs() {
  try {
    // First try to get pending archive tabs from storage
    const storage = await chrome.storage.local.get(['pendingArchiveTabs']);
    
    if (storage.pendingArchiveTabs && storage.pendingArchiveTabs.length > 0) {
      inactiveTabs = storage.pendingArchiveTabs;
    } else {
      // If not found, get them in real-time
      inactiveTabs = await chrome.runtime.sendMessage({ action: 'getInactiveTabs' });
    }
    
    document.getElementById('loadingState').style.display = 'none';
    
    if (inactiveTabs.length === 0) {
      document.getElementById('emptyState').style.display = 'block';
      return;
    }
    
    // Select all by default
    inactiveTabs.forEach(tab => selectedTabIds.add(tab.id));
    
    renderTabList();
    document.getElementById('contentArea').style.display = 'block';
    
  } catch (error) {
    console.error('Failed to load:', error);
    showError('Failed to load tabs: ' + error.message);
  }
}

// ============================================
// Render tab list
// ============================================
function renderTabList() {
  const tabList = document.getElementById('tabList');
  tabList.innerHTML = '';
  
  document.getElementById('tabCount').textContent = inactiveTabs.length;
  
  inactiveTabs.forEach(tab => {
    const item = document.createElement('div');
    item.className = 'tab-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedTabIds.has(tab.id);
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedTabIds.add(tab.id);
      } else {
        selectedTabIds.delete(tab.id);
      }
      updateArchiveButton();
    });
    
    const info = document.createElement('div');
    info.className = 'tab-info';
    
    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title || 'Untitled';
    title.title = tab.title;
    
    const url = document.createElement('div');
    url.className = 'tab-url';
    url.textContent = tab.url;
    url.title = tab.url;
    
    info.appendChild(title);
    info.appendChild(url);
    
    const time = document.createElement('div');
    time.className = 'tab-time';
    time.textContent = formatInactiveTime(tab.inactiveTime);
    
    item.appendChild(checkbox);
    item.appendChild(info);
    item.appendChild(time);
    
    tabList.appendChild(item);
  });
  
  updateArchiveButton();
}

// ============================================
// Format inactive time
// ============================================
function formatInactiveTime(minutes) {
  if (minutes < 60) {
    return `${minutes}min inactive`;
  } else {
    const hours = Math.floor(minutes / 60);
    return `${hours}h inactive`;
  }
}

// ============================================
// Update archive button state
// ============================================
function updateArchiveButton() {
  const btn = document.getElementById('archiveBtn');
  const count = selectedTabIds.size;
  
  if (count === 0) {
    btn.disabled = true;
    btn.textContent = 'Please select at least one tab';
  } else {
    btn.disabled = false;
    btn.textContent = `🗂 Archive ${count} Tabs`;
  }
}

// ============================================
// Bind events
// ============================================
function bindEvents() {
  // Select all
  document.getElementById('selectAll').addEventListener('click', (e) => {
    e.preventDefault();
    inactiveTabs.forEach(tab => selectedTabIds.add(tab.id));
    renderTabList();
  });
  
  // Deselect all
  document.getElementById('deselectAll').addEventListener('click', (e) => {
    e.preventDefault();
    selectedTabIds.clear();
    renderTabList();
  });
  
  // Cancel button
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });
  
  // Archive button
  document.getElementById('archiveBtn').addEventListener('click', async () => {
    await archiveSelectedTabs();
  });
}

// ============================================
// Archive selected tabs
// ============================================
async function archiveSelectedTabs() {
  const btn = document.getElementById('archiveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  
  btn.disabled = true;
  cancelBtn.disabled = true;
  
  const originalText = btn.textContent;
  btn.textContent = '⏳ Archiving...';
  
  try {
    const tabIds = Array.from(selectedTabIds);
    const result = await chrome.runtime.sendMessage({
      action: 'archiveTabs',
      tabIds: tabIds
    });
    
    if (result.success) {
      showSuccess(`✅ ${result.message}`);
      
      // Clear archived tabs
      await chrome.storage.local.remove(['pendingArchiveTabs']);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      showError('Archive failed: ' + result.message);
      btn.disabled = false;
      cancelBtn.disabled = false;
      btn.textContent = originalText;
    }
  } catch (error) {
    console.error('Archive failed:', error);
    showError('Archive failed: ' + error.message);
    btn.disabled = false;
    cancelBtn.disabled = false;
    btn.textContent = originalText;
  }
}

// ============================================
// Show success message
// ============================================
function showSuccess(message) {
  const successMsg = document.getElementById('successMessage');
  successMsg.textContent = message;
  successMsg.style.display = 'block';
  
  // Hide content area
  document.getElementById('contentArea').style.display = 'none';
}

// ============================================
// Show error message
// ============================================
function showError(message) {
  alert(message);
}

console.log('Confirm page loaded');
