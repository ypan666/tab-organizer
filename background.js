// ============================================
// Tab Organizer - Background Service
// ============================================

const INACTIVE_THRESHOLD = 10 * 60 * 1000; // 10 minutes (milliseconds)
const CHECK_INTERVAL = 10; // 10 minutes

// Store tab activity times
let tabActivity = {};

// ============================================
// Initialization
// ============================================
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Organizer installed');
  
  // Create alarm - check every 10 minutes
  chrome.alarms.create('checkInactiveTabs', {
    delayInMinutes: CHECK_INTERVAL,
    periodInMinutes: CHECK_INTERVAL
  });
  
  // Initialize all existing tabs' activity time
  initializeExistingTabs();
  
  // Initialize default settings
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          enabled: true,
          intervalMinutes: CHECK_INTERVAL,
          autoArchive: false // Default requires user confirmation
        }
      });
    }
  });
});

// ============================================
// Initialize existing tabs
// ============================================
async function initializeExistingTabs() {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  
  tabs.forEach(tab => {
    tabActivity[tab.id] = {
      lastActive: now,
      url: tab.url,
      title: tab.title
    };
  });
  
  // Save to storage
  await chrome.storage.local.set({ tabActivity });
  console.log(`Initialized ${tabs.length} tabs`);
}

// ============================================
// Listen for tab activation (user switches tabs)
// ============================================
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const now = Date.now();
  
  // Update activity time
  tabActivity[activeInfo.tabId] = {
    ...tabActivity[activeInfo.tabId],
    lastActive: now
  };
  
  // Save to storage
  await chrome.storage.local.set({ tabActivity });
  console.log(`Tab ${activeInfo.tabId} activated`);
});

// ============================================
// Listen for tab updates (content changes indicate usage)
// ============================================
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const now = Date.now();
    
    tabActivity[tabId] = {
      lastActive: now,
      url: tab.url,
      title: tab.title
    };
    
    await chrome.storage.local.set({ tabActivity });
  }
});

// ============================================
// Listen for new tab creation
// ============================================
chrome.tabs.onCreated.addListener(async (tab) => {
  const now = Date.now();
  
  tabActivity[tab.id] = {
    lastActive: now,
    url: tab.url || 'about:blank',
    title: tab.title || 'New Tab'
  };
  
  await chrome.storage.local.set({ tabActivity });
  console.log(`New tab ${tab.id} created`);
});

// ============================================
// Listen for tab closure
// ============================================
chrome.tabs.onRemoved.addListener(async (tabId) => {
  delete tabActivity[tabId];
  await chrome.storage.local.set({ tabActivity });
  console.log(`Tab ${tabId} closed`);
});

// ============================================
// Periodic check for inactive tabs
// ============================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkInactiveTabs') {
    console.log('Checking for inactive tabs...');
    await checkAndNotifyInactiveTabs();
  }
});

// ============================================
// Check inactive tabs and notify user
// ============================================
async function checkAndNotifyInactiveTabs() {
  const settings = await chrome.storage.local.get(['settings']);
  
  // Check if enabled
  if (!settings.settings || !settings.settings.enabled) {
    console.log('Tab Organizer is disabled');
    return;
  }
  
  const now = Date.now();
  const allTabs = await chrome.tabs.query({});
  const inactiveTabs = [];
  
  for (const tab of allTabs) {
    // Skip pinned tabs
    if (tab.pinned) continue;
    
    // Skip special pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      continue;
    }
    
    // Skip currently active tab
    if (tab.active) continue;
    
    const activity = tabActivity[tab.id];
    if (activity && (now - activity.lastActive) > INACTIVE_THRESHOLD) {
      inactiveTabs.push({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        windowId: tab.windowId,
        inactiveTime: Math.floor((now - activity.lastActive) / 1000 / 60) // minutes
      });
    }
  }
  
  console.log(`Found ${inactiveTabs.length} inactive tabs`);
  
  if (inactiveTabs.length > 0) {
    // Save pending archive tabs list
    await chrome.storage.local.set({ pendingArchiveTabs: inactiveTabs });
    
    // Send notification
    chrome.notifications.create('archive-reminder', {
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Tab Organizer',
      message: `Found ${inactiveTabs.length} tabs inactive for over 10 minutes. Archive them?`,
      buttons: [
        { title: 'View Now' },
        { title: 'Remind Later' }
      ],
      requireInteraction: true,
      priority: 2
    });
  }
}

// ============================================
// Listen for notification button clicks
// ============================================
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId === 'archive-reminder') {
    if (buttonIndex === 0) {
      // Open confirmation page
      chrome.windows.create({
        url: 'confirm.html',
        type: 'popup',
        width: 600,
        height: 700
      });
    }
    // buttonIndex === 1 is "Remind Later", do nothing
    chrome.notifications.clear(notificationId);
  }
});

// ============================================
// Listen for notification clicks
// ============================================
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId === 'archive-reminder') {
    // Open confirmation page
    chrome.windows.create({
      url: 'confirm.html',
      type: 'popup',
      width: 600,
      height: 700
    });
    chrome.notifications.clear(notificationId);
  }
});

// ============================================
// Listen for messages from popup and confirm pages
// ============================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getInactiveTabs') {
    getInactiveTabsNow().then(sendResponse);
    return true; // Async response
  }
  
  if (request.action === 'archiveTabs') {
    archiveTabs(request.tabIds).then(sendResponse);
    return true;
  }
  
  if (request.action === 'getStats') {
    getStats().then(sendResponse);
    return true;
  }
  
  if (request.action === 'updateSettings') {
    updateSettings(request.settings).then(sendResponse);
    return true;
  }
});

// ============================================
// Get current inactive tabs
// ============================================
async function getInactiveTabsNow() {
  const now = Date.now();
  const allTabs = await chrome.tabs.query({});
  const inactiveTabs = [];
  
  for (const tab of allTabs) {
    if (tab.pinned || tab.active) continue;
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      continue;
    }
    
    const activity = tabActivity[tab.id];
    if (activity && (now - activity.lastActive) > INACTIVE_THRESHOLD) {
      inactiveTabs.push({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        windowId: tab.windowId,
        inactiveTime: Math.floor((now - activity.lastActive) / 1000 / 60)
      });
    }
  }
  
  return inactiveTabs;
}

// ============================================
// Archive tabs
// ============================================
async function archiveTabs(tabIds) {
  if (!tabIds || tabIds.length === 0) {
    return { success: false, message: 'No tabs to archive' };
  }
  
  try {
    // Create tab group
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groupTitle = `Archived - ${monthNames[now.getMonth()]} ${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Get the window of the first tab
    const firstTab = await chrome.tabs.get(tabIds[0]);
    
    // Create group
    const groupId = await chrome.tabs.group({
      tabIds: tabIds,
      createProperties: {
        windowId: firstTab.windowId
      }
    });
    
    // Set group properties
    await chrome.tabGroups.update(groupId, {
      title: groupTitle,
      color: 'grey',
      collapsed: true // Collapse group
    });
    
    console.log(`Archived ${tabIds.length} tabs to group: ${groupTitle}`);
    
    // Remove from activity list
    tabIds.forEach(id => delete tabActivity[id]);
    await chrome.storage.local.set({ tabActivity });
    
    return { 
      success: true, 
      message: `Successfully archived ${tabIds.length} tabs`,
      groupTitle: groupTitle
    };
  } catch (error) {
    console.error('Archive failed:', error);
    return { 
      success: false, 
      message: 'Archive failed: ' + error.message 
    };
  }
}

// ============================================
// Get statistics
// ============================================
async function getStats() {
  const allTabs = await chrome.tabs.query({});
  const inactiveTabs = await getInactiveTabsNow();
  const settings = await chrome.storage.local.get(['settings']);
  
  return {
    totalTabs: allTabs.length,
    inactiveTabs: inactiveTabs.length,
    activeTabs: allTabs.length - inactiveTabs.length,
    enabled: settings.settings?.enabled ?? true
  };
}

// ============================================
// Update settings
// ============================================
async function updateSettings(newSettings) {
  const current = await chrome.storage.local.get(['settings']);
  const updated = { ...current.settings, ...newSettings };
  
  await chrome.storage.local.set({ settings: updated });
  
  // If interval changed, update alarm
  if (newSettings.intervalMinutes) {
    chrome.alarms.clear('checkInactiveTabs');
    chrome.alarms.create('checkInactiveTabs', {
      delayInMinutes: newSettings.intervalMinutes,
      periodInMinutes: newSettings.intervalMinutes
    });
  }
  
  return { success: true, settings: updated };
}

console.log('Tab Organizer background service started');
