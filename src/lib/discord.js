const { app, ipcMain } = require('electron');
const DiscordRPC = require('discord-rpc');
const logger = require('./headsetLogger');

// Handle because RPC is weird
process.on('unhandledRejection', () => null);

let client = null;
let trackInfo = {
  title: '  ',
  artist: '  ',
  isPlaying: false,
}; // Needed to set an initial state on Discord. Saves the current track info.

// Set Discord presence to 'trackInfo'
function setPresence() {
  if (!client || !client.ready) return;

  const start = new Date(Date.now() - trackInfo.currentTime);
  const end = new Date(start.getTime() + (trackInfo.duration * 1e3));

  // See https://discord.com/developers/applications/712424004190732419/rich-presence/assets
  const presence = {
    state: trackInfo.title,
    details: trackInfo.artist || '  ',
    startTimestamp: start,
    endTimestamp: end,
    instance: false,
    largeImageKey: 'playing',
    largeImageText: 'Headset',
    buttons: [
      {
        label: 'Checkout Headset',
        url: 'https://headsetapp.co/',
      },
    ],
  };

  if (!trackInfo.isPlaying) {
    presence.smallImageKey = 'icon-pause';
    presence.smallImageText = 'Paused';
    delete presence.startTimestamp;
    delete presence.endTimestamp;
    presence.state += ' (Paused)';
  }

  // Run Event to update
  client.setActivity(presence);

  logger.discord(`Updating Discord presence ${JSON.stringify(presence, null, 2)}`);
}

// Attempt to connect to Discord if it hasn't done it already.
function tryConnecting() {
  if (client && client.ready) return;

  client = new DiscordRPC.Client({ transport: 'ipc' });

  client.on('ready', () => {
    logger.discord('Discord RPC: Ready');
    client.ready = true;
    setPresence(); // Set an initial presence upon connecting.
  });

  client.on('disconnected', () => {
    logger.discord('Discord RPC: Disconnected');
    client = null;
  });

  client.login({ clientId: '712424004190732419' }).catch(() => { client = null; });
}

// Deletes any instance of Discord.
function killDiscord() {
  if (client) {
    logger.discord('Killing Discord');
    client.destroy();
    client = null;
  }
}

// Receive any changes from the user settings.
ipcMain.on('discord', (event, isDiscordEnabled) => {
  logger.discord(`Discord settings changed to ${isDiscordEnabled}`);
  isDiscordEnabled ? tryConnecting() : killDiscord();
});

// Listen for any appropriate events to change Discord status.
ipcMain.on('win2Player', async (event, args) => {
  // Keep updating trackInfo even if Discord is not running.
  // If Discord is enabled while something was playing, it will pick up on the right track and time
  switch (args[0]) {
    case 'trackInfo':
      trackInfo = args[1];
      trackInfo.currentTime = 0;
      trackInfo.isPlaying = true;
      break;
    case 'pauseVideo':
      trackInfo.isPlaying = false;
      break;
    case 'playVideo':
      trackInfo.isPlaying = true;
      break;
    case 'seekTo':
      trackInfo.currentTime = args[1] * 1e3;
      break;
    default:
  }

  // only update Discord when a valid event triggers it and it's enabled
  if (['trackInfo', 'pauseVideo', 'playVideo', 'seekTo'].includes(args[0])
    && await event.sender.executeJavaScript("localStorage.getItem('discord')")) {
    client && client.ready ? setPresence() : tryConnecting();
  }
});

// Keep updating currentTime. Same logic as 'win2Player'.
ipcMain.on('player2Win', (event, args) => {
  if (args[0] === 'currentTime') trackInfo.currentTime = args[1] * 1e3;
});

// Start Discord, if enabled, when app starts.
app.on('web-contents-created', async (event, webContents) => {
  if (await webContents.executeJavaScript("localStorage.getItem('discord')")) tryConnecting();
});

// Kill Discord when app exits.
app.on('before-quit', killDiscord);
