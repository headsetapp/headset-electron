const { app, ipcMain } = require('electron');
const DiscordRPC = require('discord-rpc');
const logger = require('./headsetLogger');

// Handle because RPC is weird
process.on('unhandledRejection', () => null);

let client;
let track;

async function tryConnecting(win) {
  if (!await win.webContents.executeJavaScript("localStorage.getItem('discord')")) return;

  if (client && client.ready) return;

  client = new DiscordRPC.Client({ transport: 'ipc' });
  client.on('ready', () => {
    client.ready = true;
    logger.discord('[Discord RPC] Ready');
  });
  client.on('disconnected', () => {
    logger.discord('[Discord RPC] Disconnected');
    client = null;
  });
  client.login({ clientId: '712424004190732419' });
}

async function setPresence(trackInfo, isPlaying, win) {
  if (!await win.webContents.executeJavaScript("localStorage.getItem('discord')")) {
    if (client) {
      client.destroy();
      client = null;
    }
    return;
  }

  if (!client || !client.ready) return;

  const start = new Date(Date.now() - trackInfo.currentTime);
  const end = new Date(start.getTime() + (trackInfo.duration * 1e3));

  const presence = {
    state: trackInfo.title,
    details: trackInfo.artist,
    startTimestamp: start,
    endTimestamp: end,
    instance: false,
  };

  if (!isPlaying) {
    delete presence.startTimestamp;
    delete presence.endTimestamp;
    presence.state += ' (Paused)';
  }

  // Run Event to update
  client.setActivity(presence);
}

function discord(win) {
  ipcMain.on('win2Player', async (e, args) => {
    if (args[0] === 'trackInfo') {
      track = args[1];
      track.currentTime = 0;
      await tryConnecting(win);
      await setPresence(track, true, win);
    }
  });

  ipcMain.on('player2Win', async (e, args) => {
    switch (args[0]) {
      case 'currentTime':
        track.currentTime = args[1] * 1e3;
        await setPresence(track, true, win);
        break;
      case 'onStateChange':
        await tryConnecting(win);
        if (args[1] === 1) await setPresence(track, true, win);
        if (args[1] === 2) await setPresence(track, false, win);
        break;
      default:
    }
  });

  app.on('before-quit', () => {
    if (client) client.destroy();
  });
}

module.exports = discord;
