const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');

// ============================================================
// PERFORMANCE: Chromium flags (set BEFORE app.ready)
// ============================================================

// GPU / Rendering
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');

// V8 — default tiered JIT for best benchmark scores
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
app.commandLine.appendSwitch('enable-features', 'CanvasOopRasterization,ParallelDownloading,BackForwardCache');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion,BackgroundFetch,TranslateUI,SpareRendererForSitePerProcess');

// Process — reduce overhead
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// Disable background CPU hogs
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch('metrics-recording-only');
app.commandLine.appendSwitch('no-pings');
app.commandLine.appendSwitch('disable-hang-monitor');
app.commandLine.appendSwitch('disable-ipc-flooding-protection');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('no-first-run');


// ============================================================
// AD-BLOCKER: Native Electron URL pattern filter (C++ level)
// JS callback ONLY fires for matching ad URLs — ZERO overhead on normal requests
// ============================================================
const adBlockPatterns = [
    '*://*.doubleclick.net/*',
    '*://*.googleadservices.com/*',
    '*://*.googlesyndication.com/*',
    '*://*.moatads.com/*',
    '*://*.openx.net/*',
    '*://*.adroll.com/*',
    '*://*.zedo.com/*',
    '*://*.rubiconproject.com/*',
    '*://*.criteo.com/*',
    '*://*.outbrain.com/*',
    '*://*.taboola.com/*',
    '*://*.chartbeat.com/*',
    '*://*.quantserve.com/*',
    '*://*.scorecardresearch.com/*',
    '*://*.adsrvr.org/*',
    '*://*.pubmatic.com/*',
    '*://*.casalemedia.com/*',
    '*://*.amazon-adsystem.com/*',
    '*://*.adnxs.com/*',
    '*://*.bidswitch.net/*',
    '*://*.demdex.net/*',
    '*://*.bluekai.com/*',
    '*://*.krxd.net/*',
    '*://*.mathtag.com/*',
    '*://*.serving-sys.com/*',
    '*://*.advertising.com/*',
    '*://*.indexexchange.com/*',
    '*://*.media.net/*',
    '*://*.cootlogix.com/*',
    '*://*.seedtag.com/*',
    '*://*.nextmillmedia.com/*',
    '*://*.vidazoo.com/*'
];

// DNS Prefetch List
const prefetchDomains = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com',
    'amazon.com', 'wikipedia.org', 'reddit.com', 'netflix.com'
];

let mainWindow;
let views = {};
let activeViewId = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#1a1b1e',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: false,
            backgroundThrottling: false
        },
        titleBarStyle: 'hiddenInset'
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Ad-blocker: ONLY fires for ad URLs (C++ URL matching, zero overhead on benchmark traffic)
    session.defaultSession.webRequest.onBeforeRequest({ urls: adBlockPatterns }, (details, callback) => {
        callback({ cancel: true });
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('resize', () => {
        if (activeViewId && views[activeViewId]) {
            updateViewBounds(views[activeViewId]);
        }
    });

    mainWindow.webContents.once('did-finish-load', () => {
        createTab('https://www.google.com');
    });
}

function updateViewBounds(view) {
    const bounds = mainWindow.getContentBounds();
    view.setBounds({ x: 0, y: 80, width: bounds.width, height: bounds.height - 80 });
}

function createTab(url) {
    const view = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            spellcheck: false,
            backgroundThrottling: false,
            autoplayPolicy: 'no-user-gesture-required'
        }
    });

    mainWindow.setBrowserView(view);
    const id = Date.now().toString();
    views[id] = view;
    activeViewId = id;

    view.webContents.loadURL(url);
    updateViewBounds(view);

    view.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('update-url', { id, url: view.webContents.getURL() });
        mainWindow.webContents.send('update-title', { id, title: view.webContents.getTitle() });
        updateNavState(id);
    });

    view.webContents.on('did-navigate', (event, navUrl) => {
        mainWindow.webContents.send('update-url', { id, url: navUrl });
        updateNavState(id);
    });

    mainWindow.webContents.send('tab-created', { id, url });
    return id;
}

function updateNavState(id) {
    const view = views[id];
    if (view && id === activeViewId) {
        mainWindow.webContents.send('update-nav-state', {
            canGoBack: view.webContents.navigationHistory.canGoBack(),
            canGoForward: view.webContents.navigationHistory.canGoForward()
        });
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // DNS Preconnection
    prefetchDomains.forEach(domain => {
        session.defaultSession.preconnect({ url: `https://${domain}`, numSockets: 6 });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.on('create-tab', (event, url) => {
    createTab(url || 'https://www.google.com');
});

ipcMain.on('switch-tab', (event, id) => {
    if (views[id]) {
        activeViewId = id;
        mainWindow.setBrowserView(views[id]);
        updateViewBounds(views[id]);
        updateNavState(id);
        event.reply('update-url', { id, url: views[id].webContents.getURL() });
    }
});

ipcMain.on('close-tab', (event, id) => {
    if (views[id]) {
        if (activeViewId === id) {
            const viewIds = Object.keys(views);
            const index = viewIds.indexOf(id);
            if (viewIds.length > 1) {
                const newId = viewIds[index === 0 ? 1 : index - 1];
                mainWindow.setBrowserView(views[newId]);
                activeViewId = newId;
            } else {
                activeViewId = null;
                mainWindow.setBrowserView(null);
            }
        }
        delete views[id];
    }
});

ipcMain.on('navigate', (event, url) => {
    if (activeViewId && views[activeViewId]) {
        let targetUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            targetUrl = 'https://' + url;
        }
        views[activeViewId].webContents.loadURL(targetUrl);
    }
});

ipcMain.on('go-back', () => {
    if (activeViewId && views[activeViewId]) views[activeViewId].webContents.goBack();
});

ipcMain.on('go-forward', () => {
    if (activeViewId && views[activeViewId]) views[activeViewId].webContents.goForward();
});

ipcMain.on('reload', () => {
    if (activeViewId && views[activeViewId]) views[activeViewId].webContents.reload();
});
