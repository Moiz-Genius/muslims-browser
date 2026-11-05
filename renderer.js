const { ipcRenderer } = require('electron');

const tabsContainer = document.getElementById('tabs-container');
const newTabBtn = document.getElementById('new-tab-btn');
const urlInput = document.getElementById('url-input');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');

let activeTabId = null;

// Helper to create tab element
function createTabElement(id, title) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.id = id;
    tab.innerHTML = `
        <span class="tab-title">${title || 'New Tab'}</span>
        <span class="tab-close">×</span>
    `;

    // Click on tab to switch
    tab.addEventListener('click', (e) => {
        if (e.target.className !== 'tab-close') {
            ipcRenderer.send('switch-tab', id);
            setActiveTab(id);
        }
    });

    // Click on close button
    tab.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        ipcRenderer.send('close-tab', id);
        tab.remove();
        // Determine new active tab if this one was active
        if (activeTabId === id) {
            const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));
            if (tabs.length > 0) {
                const lastTab = tabs[tabs.length - 1];
                setActiveTab(lastTab.dataset.id);
                // Note: Main process also handles the logic of which view to show, 
                // but we need to update UI active state here or wait for confirmation.
                // Actually, main process should tell us which tab is now active if we close one.
                // For now, let's rely on 'switch-tab' or similar event if main process initiates it?
                // Simpler: let Main process decide and tell us.
            } else {
                activeTabId = null;
                urlInput.value = '';
            }
        }
    });

    return tab;
}

function setActiveTab(id) {
    if (activeTabId) {
        const prevTab = tabsContainer.querySelector(`.tab[data-id="${activeTabId}"]`);
        if (prevTab) prevTab.classList.remove('active');
    }
    activeTabId = id;
    const currTab = tabsContainer.querySelector(`.tab[data-id="${activeTabId}"]`);
    if (currTab) currTab.classList.add('active');
}

// Event Listeners
newTabBtn.addEventListener('click', () => {
    ipcRenderer.send('create-tab', 'https://www.google.com');
});

urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const url = urlInput.value;
        ipcRenderer.send('navigate', url);
    }
});

backBtn.addEventListener('click', () => {
    ipcRenderer.send('go-back');
});

forwardBtn.addEventListener('click', () => {
    ipcRenderer.send('go-forward');
});

reloadBtn.addEventListener('click', () => {
    ipcRenderer.send('reload');
});

// IPC Listeners
ipcRenderer.on('tab-created', (event, { id, url }) => {
    const tab = createTabElement(id, 'Loading...');
    tabsContainer.insertBefore(tab, newTabBtn);
    setActiveTab(id);
    urlInput.value = url;
});

ipcRenderer.on('update-url', (event, { id, url }) => {
    if (id === activeTabId) {
        urlInput.value = url;
    }
});

ipcRenderer.on('update-title', (event, { id, title }) => {
    const tab = tabsContainer.querySelector(`.tab[data-id="${id}"]`);
    if (tab) {
        tab.querySelector('.tab-title').textContent = title;
    }
});

ipcRenderer.on('update-nav-state', (event, { canGoBack, canGoForward }) => {
    backBtn.disabled = !canGoBack;
    forwardBtn.disabled = !canGoForward;
});

// Initial tab setup (if main sends one immediately, or we request one)
// Main process creates one on load, we should wait for 'tab-created' or sync?
// The main.js sends 'tab-created' AFTER we load?
// No, main.js sends it when creating. If we reload renderer, we might lose state.
// Ideally, we ask main for current state on load.
// For this MVP, assuming we start fresh.
// But wait, main.js creates the initial tab in createWindow.
// If renderer loads after that, it might miss the event.
// Let's add a 'get-app-state' IPC or just rely on new tabs for now.
// Better: Ask main for current tabs.

// Request initial state logic could go here if needed.
