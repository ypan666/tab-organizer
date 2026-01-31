// ============================================
// Popup Interface Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load statistics
  await loadStats();
  
  // Load settings
  await loadSettings();
  
  // Bind events
  bindEvents();
});

// ============================================
// Load statistics
// ============================================
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStats' });
    
    document.getElementById('totalTabs').textContent = response.totalTabs;
    document.getElementById('inactiveTabs').textContent = response.inactiveTabs;
    
    // Update button state
    const archiveBtn = document.getElementById('archiveNowBtn');
    if (response.inactiveTabs === 0) {
      archiveBtn.disabled = true;
      archiveBtn.textContent = '✅ No tabs to archive';
    } else {
      archiveBtn.disabled = false;
      archiveBtn.textContent = `🗂 Archive ${response.inactiveTabs} Tabs`;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// ============================================
// Load settings
// ============================================
async function loadSettings() {
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  
  document.getElementById('enableToggle').checked = settings.enabled ?? true;
  document.getElementById('intervalSelect').value = settings.intervalMinutes || 10;
}

// ============================================
// Bind events
// ============================================
function bindEvents() {
  // Archive now button
  document.getElementById('archiveNowBtn').addEventListener('click', async () => {
    const btn = document.getElementById('archiveNowBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Opening confirmation page...';
    
    // Open confirmation page
    chrome.windows.create({
      url: 'confirm.html',
      type: 'popup',
      width: 650,
      height: 700
    });
    
    // Close popup
    window.close();
  });
  
  // Check button
  document.getElementById('checkNowBtn').addEventListener('click', async () => {
    const btn = document.getElementById('checkNowBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '🔄 Checking...';
    
    await loadStats();
    
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = originalText;
    }, 1000);
  });
  
  // Enable toggle
  document.getElementById('enableToggle').addEventListener('change', async (e) => {
    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: { enabled: e.target.checked }
    });
    
    showToast(e.target.checked ? 'Auto-archive enabled' : 'Auto-archive disabled');
  });
  
  // Interval select
  document.getElementById('intervalSelect').addEventListener('change', async (e) => {
    const minutes = parseInt(e.target.value);
    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: { intervalMinutes: minutes }
    });
    
    showToast(`Check interval updated to ${minutes} minutes`);
  });
}

// ============================================
// Show toast message
// ============================================
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 13px;
    z-index: 1000;
    animation: slideUp 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

console.log('Popup interface loaded');
