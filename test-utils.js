// ============================================
// 测试辅助工具
// 这个文件用于开发和测试，不是插件必需的
// ============================================

// 在浏览器控制台中使用这些命令进行测试

// 1. 查看所有存储数据
function viewStorage() {
  chrome.storage.local.get(null, (data) => {
    console.log('=== 存储数据 ===');
    console.log('标签页活跃记录:', data.tabActivity);
    console.log('待归档标签页:', data.pendingArchiveTabs);
    console.log('设置:', data.settings);
  });
}

// 2. 清除所有数据
function clearStorage() {
  chrome.storage.local.clear(() => {
    console.log('✅ 已清除所有存储数据');
  });
}

// 3. 手动触发检查（立即）
function triggerCheck() {
  chrome.alarms.create('checkInactiveTabs', { 
    delayInMinutes: 0.1 
  });
  console.log('⏰ 已触发检查，将在6秒后执行');
}

// 4. 查看所有定时器
function viewAlarms() {
  chrome.alarms.getAll((alarms) => {
    console.log('=== 定时器列表 ===');
    alarms.forEach(alarm => {
      console.log(`名称: ${alarm.name}`);
      console.log(`周期: ${alarm.periodInMinutes} 分钟`);
      console.log(`下次触发: ${new Date(alarm.scheduledTime)}`);
    });
  });
}

// 5. 获取当前所有标签页
function viewAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    console.log('=== 所有标签页 ===');
    console.log(`总数: ${tabs.length}`);
    tabs.forEach((tab, index) => {
      console.log(`${index + 1}. ${tab.title}`);
      console.log(`   URL: ${tab.url}`);
      console.log(`   激活: ${tab.active}, 固定: ${tab.pinned}`);
    });
  });
}

// 6. 获取所有标签页组
function viewTabGroups() {
  chrome.tabGroups.query({}, (groups) => {
    console.log('=== 标签页组 ===');
    console.log(`总数: ${groups.length}`);
    groups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.title}`);
      console.log(`   颜色: ${group.color}`);
      console.log(`   折叠: ${group.collapsed}`);
    });
  });
}

// 7. 模拟10分钟前的活跃时间（用于快速测试）
async function simulateOldTabs() {
  const tabs = await chrome.tabs.query({});
  const storage = await chrome.storage.local.get(['tabActivity']);
  const tabActivity = storage.tabActivity || {};
  
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000 + 10000); // 10分钟+10秒
  
  tabs.forEach(tab => {
    if (!tab.active && !tab.pinned) {
      tabActivity[tab.id] = {
        lastActive: tenMinutesAgo,
        url: tab.url,
        title: tab.title
      };
    }
  });
  
  await chrome.storage.local.set({ tabActivity });
  console.log('✅ 已模拟标签页为10分钟前活跃');
  console.log('现在可以点击插件测试归档功能');
}

// 8. 重置为1分钟阈值（快速测试）
console.log(`
==========================================
测试辅助工具已加载
==========================================

在控制台中使用以下命令：

viewStorage()       - 查看所有存储数据
clearStorage()      - 清除所有数据
triggerCheck()      - 手动触发检查
viewAlarms()        - 查看所有定时器
viewAllTabs()       - 查看所有标签页
viewTabGroups()     - 查看所有标签页组
simulateOldTabs()   - 模拟标签页为10分钟前活跃

快速测试流程：
1. simulateOldTabs()  - 模拟旧标签页
2. 点击插件图标查看统计
3. 点击"立即归档"测试功能

==========================================
`);

// 导出到全局
window.testUtils = {
  viewStorage,
  clearStorage,
  triggerCheck,
  viewAlarms,
  viewAllTabs,
  viewTabGroups,
  simulateOldTabs
};
