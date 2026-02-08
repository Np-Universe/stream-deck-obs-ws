require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const OBSWebSocket = require('obs-websocket-js');
const readline = require('readline');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  serveClient: true,
  cookie: false
});

const obs = new OBSWebSocket();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let obsConnected = false;
let currentScene = '';
let scenes = [];
let audioSources = [];
let autoConnectAttempted = false;
let YOUTUBE_STREAM_ID = process.env.YOUTUBE_STREAM_ID || '';

function extractVideoId(url) {
  if (!url) return '';
  
  url = url.trim();
  
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  const liveChatMatch = url.match(/live_chat\?.*v=([^&]+)/);
  if (liveChatMatch) return liveChatMatch[1];
  
  const youtuBeMatch = url.match(/youtu\.be\/([^?]+)/);
  if (youtuBeMatch) return youtuBeMatch[1];
  
  if (!url.includes(' ') && !url.includes('/') && url.length > 5) {
    return url;
  }
  
  return '';
}

function getYouTubeStreamId() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Masukkan link YouTube live chat atau video ID: ', (input) => {
      const videoId = extractVideoId(input);
      
      if (videoId) {
        console.log(`Video ID ditemukan: ${videoId}`);
        console.log(`URL Chat: https://www.youtube.com/live_chat?v=${videoId}`);
        resolve(videoId);
      } else {
        console.log('Format link tidak dikenali. Gunakan format:');
        console.log('- https://www.youtube.com/watch?v=VIDEO_ID');
        console.log('- https://www.youtube.com/live_chat?is_popout=1&v=VIDEO_ID');
        console.log('- https://youtu.be/VIDEO_ID');
        console.log('- Atau langsung VIDEO_ID saja');
        console.log('Menggunakan default atau environment variable...');
        resolve(process.env.YOUTUBE_STREAM_ID || '');
      }
      
      rl.close();
    });
  });
}

async function initializeYouTubeId() {
  if (process.argv[2]) {
    const videoId = extractVideoId(process.argv[2]);
    if (videoId) {
      YOUTUBE_STREAM_ID = videoId;
      console.log(`Video ID dari argumen: ${YOUTUBE_STREAM_ID}`);
      return;
    }
  }
  
  if (!YOUTUBE_STREAM_ID) {
    YOUTUBE_STREAM_ID = await getYouTubeStreamId();
  }
  
  if (!YOUTUBE_STREAM_ID) {
    console.log('Peringatan: YouTube Stream ID tidak ditemukan. Fitur chat mungkin tidak berfungsi.');
    console.log('Anda bisa set environment variable YOUTUBE_STREAM_ID atau berikan sebagai argumen.');
  }
}

async function autoConnectOBS() {
  if (autoConnectAttempted) return;
  
  autoConnectAttempted = true;
  
  const host = process.env.OBS_HOST || 'localhost';
  const port = process.env.OBS_PORT || '4455';
  const password = process.env.OBS_PASSWORD || '';
  
  try {
    await obs.connect({ 
      address: `${host}:${port}`,
      password: password || undefined,
      rpcVersion: 1
    });
    
    obsConnected = true;
    
    try {
      const sceneData = await obs.send('GetSceneList');
      scenes = sceneData.scenes.map(scene => ({
        name: scene.name,
        id: scene.sceneIndex,
        active: scene.name === sceneData.currentScene
      }));
      
      currentScene = sceneData.currentScene;
      
      io.emit('obs:scenes', { scenes, currentScene });
      io.emit('obs:status', { connected: true });
      io.emit('obs:currentScene', currentScene);
      
    } catch (sceneError) {}
    
    try {
      const sourcesData = await obs.send('GetSourcesList');
      audioSources = [];
      
      for (const source of sourcesData.sources) {
        try {
          const volumeInfo = await obs.send('GetVolume', { source: source.name });
          if (volumeInfo) {
            audioSources.push({
              name: source.name,
              muted: volumeInfo.muted,
              volume: Math.round(volumeInfo.volume * 100)
            });
          }
        } catch (e) {
          continue;
        }
      }
      
      io.emit('obs:audioSources', audioSources);
    } catch (audioError) {}
    
  } catch (error) {
    obsConnected = false;
    io.emit('obs:status', { connected: false });
    
    setTimeout(() => {
      autoConnectAttempted = false;
      autoConnectOBS();
    }, 5000);
  }
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>OBS Controller</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: white;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 20px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #4A9EFF;
      margin-bottom: 20px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(74, 158, 255, 0.3);
    }

    .scenes-section {
      margin-bottom: 40px;
    }

    .scenes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 15px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .scene-btn {
      background: #1a1a1a;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 20px 10px;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 120px;
      position: relative;
      overflow: hidden;
    }

    .scene-btn:active {
      transform: scale(0.97);
      background: #151515;
    }

    .scene-btn.active {
      border-color: #4A9EFF;
      background: rgba(74, 158, 255, 0.1);
      box-shadow: 0 0 25px rgba(74, 158, 255, 0.2);
    }

    .scene-btn.active::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #4A9EFF;
    }

    .scene-icon {
      width: 44px;
      height: 44px;
      background: rgba(74, 158, 255, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(74, 158, 255, 0.3);
      transition: all 0.15s ease;
    }

    .scene-btn.active .scene-icon {
      background: rgba(74, 158, 255, 0.2);
      transform: scale(1.1);
    }

    .scene-name {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    .audio-section {
      margin-bottom: 60px;
    }

    .audio-controls-container {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .audio-item {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      border: 1px solid #222;
      transition: all 0.15s ease;
    }

    .audio-item.muted {
      opacity: 0.7;
      border-color: #444;
    }

    .audio-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .audio-name {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .mute-btn {
      background: #2d2d2d;
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 10px 20px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      min-width: 100px;
      justify-content: center;
    }

    .mute-btn:active {
      transform: scale(0.97);
      background: #252525;
    }

    .mute-btn.unmuted {
      border-color: #4A9EFF;
      background: rgba(74, 158, 255, 0.1);
    }

    .mute-btn.muted {
      border-color: #ff4757;
      background: rgba(255, 71, 87, 0.1);
    }

    .mute-btn-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .volume-slider {
      flex: 1;
      -webkit-appearance: none;
      height: 6px;
      background: #2d2d2d;
      border-radius: 3px;
      outline: none;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4A9EFF;
      cursor: pointer;
      border: 2px solid #0a0a0a;
      box-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
    }

    .volume-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4A9EFF;
      cursor: pointer;
      border: 2px solid #0a0a0a;
      box-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
    }

    .volume-value {
      font-size: 14px;
      font-weight: 600;
      color: #4A9EFF;
      min-width: 40px;
      text-align: center;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
      grid-column: 1/-1;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(74, 158, 255, 0.1);
      border-radius: 50%;
      border-top-color: #4A9EFF;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .chat-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: #4A9EFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
      z-index: 100;
      transition: all 0.2s ease;
    }

    .chat-btn:active {
      transform: scale(0.95);
      box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(74, 158, 255, 0.3);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(74, 158, 255, 0.5);
    }

    @media (max-width: 768px) {
      .app-container {
        padding: 15px;
      }
      
      .scenes-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
      }
      
      .audio-controls-container {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .scene-btn {
        min-height: 110px;
        padding: 18px 8px;
      }
      
      .chat-btn {
        width: 52px;
        height: 52px;
        font-size: 22px;
        bottom: 15px;
        right: 15px;
      }
    }

    @media (max-width: 480px) {
      .scenes-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .audio-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      
      .mute-btn {
        width: 100%;
      }
    }

    @media (max-width: 360px) {
      .scenes-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="scenes-section">
      <div class="section-title">Scenes</div>
      <div class="scenes-grid" id="scenesGrid">
        <div class="loading" id="loading">
          <div class="spinner"></div>
          <div>Connecting to OBS...</div>
        </div>
      </div>
    </div>

    <div class="audio-section">
      <div class="section-title">Audio Controls</div>
      <div class="audio-controls-container" id="audioControls">
        <div class="loading" id="audioLoading">
          <div class="spinner"></div>
          <div>Loading audio sources...</div>
        </div>
      </div>
    </div>
  </div>

  <a href="/chat" class="chat-btn">💬</a>

  <script src="/socket.io/socket.io.js"></script>
  
  <script>
    const scenesGrid = document.getElementById('scenesGrid');
    const loading = document.getElementById('loading');
    const audioControls = document.getElementById('audioControls');
    const audioLoading = document.getElementById('audioLoading');

    let scenes = [];
    let currentScene = '';
    let audioSources = [];

    function renderScenes(scenesList) {
      if (scenesList.length === 0) {
        scenesGrid.innerHTML = '<div style="text-align:center;color:#666;grid-column:1/-1;">No scenes available</div>';
        return;
      }
      
      scenesGrid.innerHTML = '';
      
      scenesList.forEach(scene => {
        const button = document.createElement('button');
        button.className = 'scene-btn' + (scene.name === currentScene ? ' active' : '');
        button.innerHTML = '<div class="scene-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg></div><div class="scene-name">' + scene.name + '</div>';
        
        button.addEventListener('click', () => switchScene(scene.name));
        scenesGrid.appendChild(button);
      });
    }

    async function switchScene(sceneName) {
      try {
        const button = event.currentTarget;
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
        
        const response = await fetch('/api/switch-scene', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sceneName: sceneName })
        });
        
        const data = await response.json();
        if (data.success) {
          currentScene = sceneName;
          renderScenes(scenes);
        }
      } catch (error) {}
    }

    function renderAudioControls(audioSourcesList) {
      audioSources = audioSourcesList;
      
      if (audioSourcesList.length === 0) {
        audioControls.innerHTML = '<div style="color:#666;text-align:center;grid-column:1/-1;">No audio sources available</div>';
        return;
      }
      
      audioLoading.style.display = 'none';
      audioControls.innerHTML = '';
      
      audioSourcesList.forEach(source => {
        const audioItem = document.createElement('div');
        audioItem.className = 'audio-item' + (source.muted ? ' muted' : '');
        audioItem.innerHTML = \`
          <div class="audio-header">
            <div class="audio-name">\${source.name}</div>
            <button class="mute-btn \${source.muted ? 'muted' : 'unmuted'}" onclick="toggleAudio('\${source.name}')">
              <div class="mute-btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  \${source.muted ? 
                    '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>' : 
                    '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
                </svg>
              </div>
              <span>\${source.muted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>
          <div class="volume-control">
            <input type="range" 
                   class="volume-slider" 
                   min="0" 
                   max="100" 
                   value="\${source.volume}" 
                   oninput="updateVolume('\${source.name}', this.value)"
                   \${source.muted ? 'disabled style="opacity:0.5"' : ''}>
            <div class="volume-value">\${source.volume}%</div>
          </div>
        \`;
        
        audioControls.appendChild(audioItem);
      });
    }

    async function toggleAudio(sourceName) {
      try {
        const button = event.currentTarget;
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
        
        const response = await fetch('/api/toggle-audio', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sourceName: sourceName })
        });
        
        const data = await response.json();
        if (data.success) {
          const source = audioSources.find(s => s.name === sourceName);
          if (source) {
            source.muted = data.muted;
            renderAudioControls(audioSources);
          }
        }
      } catch (error) {}
    }

    async function updateVolume(sourceName, volume) {
      try {
        const response = await fetch('/api/set-volume', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            sourceName: sourceName,
            volume: parseInt(volume) / 100
          })
        });
        
        const data = await response.json();
        if (data.success) {
          const source = audioSources.find(s => s.name === sourceName);
          if (source) {
            source.volume = parseInt(volume);
            renderAudioControls(audioSources);
          }
        }
      } catch (error) {}
    }

    const socket = io({
      transports: ['polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      socket.emit('getInitialData');
    });

    socket.on('obs:scenes', (data) => {
      scenes = data.scenes;
      currentScene = data.currentScene;
      renderScenes(scenes);
      loading.style.display = 'none';
    });

    socket.on('obs:currentScene', (sceneName) => {
      currentScene = sceneName;
      renderScenes(scenes);
    });

    socket.on('obs:audioSources', (sources) => {
      renderAudioControls(sources);
    });

    socket.on('obs:audioUpdated', (data) => {
      const source = audioSources.find(s => s.name === data.name);
      if (source) {
        source.muted = data.muted;
        source.volume = Math.round(data.volume * 100);
        renderAudioControls(audioSources);
      }
    });

    renderScenes([]);
  </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(HTML_TEMPLATE);
});

app.get('/chat', (req, res) => {
  const chatUrl = YOUTUBE_STREAM_ID 
    ? `https://www.youtube.com/live_chat?v=${YOUTUBE_STREAM_ID}&embed_domain=${req.hostname}`
    : 'about:blank';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>YouTube Live Chat</title>
      <style>
        body { margin:0; padding:0; background:#000; }
        iframe { width:100vw; height:100vh; border:none; }
        .back-btn {
          position: fixed;
          top: 10px;
          left: 10px;
          background: #4A9EFF;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          z-index: 100;
          font-family: sans-serif;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
        }
        .back-btn:hover {
          background: #3a8eff;
        }
        .video-info {
          position: fixed;
          top: 10px;
          left: 120px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-family: sans-serif;
          font-size: 14px;
          z-index: 100;
          border-left: 3px solid #4A9EFF;
        }
      </style>
    </head>
    <body>
      <a href="/" class="back-btn">← Back to Controller</a>
      <iframe src="${chatUrl}" allowfullscreen></iframe>
    </body>
    </html>
  `);
});

app.post('/api/switch-scene', async (req, res) => {
  try {
    const { sceneName } = req.body;
    
    if (!sceneName) {
      return res.status(400).json({ success: false, error: 'sceneName required' });
    }
    
    if (!obsConnected) {
      return res.status(503).json({ success: false, error: 'OBS not connected' });
    }
    
    await obs.send('SetCurrentScene', { 'scene-name': sceneName });
    currentScene = sceneName;
    
    io.emit('obs:currentScene', sceneName);
    
    res.json({ success: true, scene: sceneName });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/toggle-audio', async (req, res) => {
  try {
    const { sourceName } = req.body;
    
    if (!sourceName) {
      return res.status(400).json({ success: false, error: 'sourceName required' });
    }
    
    if (!obsConnected) {
      return res.status(503).json({ success: false, error: 'OBS not connected' });
    }
    
    await obs.send('ToggleMute', { source: sourceName });
    
    const volumeInfo = await obs.send('GetVolume', { source: sourceName });
    
    const audioSource = audioSources.find(s => s.name === sourceName);
    if (audioSource) {
      audioSource.muted = volumeInfo.muted;
      audioSource.volume = Math.round(volumeInfo.volume * 100);
    }
    
    io.emit('obs:audioUpdated', { 
      name: sourceName, 
      muted: volumeInfo.muted,
      volume: volumeInfo.volume
    });
    
    res.json({ success: true, muted: volumeInfo.muted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/set-volume', async (req, res) => {
  try {
    const { sourceName, volume } = req.body;
    
    if (!sourceName || volume === undefined) {
      return res.status(400).json({ success: false, error: 'sourceName and volume required' });
    }
    
    if (!obsConnected) {
      return res.status(503).json({ success: false, error: 'OBS not connected' });
    }
    
    await obs.send('SetVolume', { 
      source: sourceName,
      volume: parseFloat(volume)
    });
    
    const audioSource = audioSources.find(s => s.name === sourceName);
    if (audioSource) {
      audioSource.volume = Math.round(volume * 100);
    }
    
    io.emit('obs:audioUpdated', { 
      name: sourceName, 
      muted: audioSource ? audioSource.muted : false,
      volume: parseFloat(volume)
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/toggle-all-audio', async (req, res) => {
  try {
    if (!obsConnected) {
      return res.status(503).json({ success: false, error: 'OBS not connected' });
    }
    
    let allMuted = true;
    
    for (const source of audioSources) {
      if (!source.muted) {
        allMuted = false;
        break;
      }
    }
    
    const muteState = !allMuted;
    
    for (const source of audioSources) {
      if (source.muted !== muteState) {
        await obs.send('SetMute', { source: source.name, mute: muteState });
        source.muted = muteState;
        io.emit('obs:audioUpdated', { 
          name: source.name, 
          muted: muteState,
          volume: source.volume / 100
        });
      }
    }
    
    res.json({ success: true, mutedState: muteState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scenes', async (req, res) => {
  try {
    if (!obsConnected) {
      return res.status(503).json({ success: false, error: 'OBS not connected' });
    }
    
    const data = await obs.send('GetSceneList');
    const scenes = data.scenes.map(s => ({ name: s.name }));
    
    res.json({ 
      success: true, 
      scenes, 
      currentScene: data.currentScene 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    obsConnected,
    currentScene,
    scenesCount: scenes.length,
    audioSourcesCount: audioSources.length,
    youtubeStreamId: YOUTUBE_STREAM_ID,
    serverTime: new Date().toISOString()
  });
});

obs.on('ConnectionOpened', () => {
  obsConnected = true;
  autoConnectAttempted = false;
  
  io.emit('obs:status', { connected: true });
  
  if (scenes.length > 0) {
    io.emit('obs:scenes', { scenes, currentScene });
  }
});

obs.on('ConnectionClosed', () => {
  obsConnected = false;
  io.emit('obs:status', { connected: false });
  
  setTimeout(() => {
    if (!obsConnected) {
      autoConnectAttempted = false;
      autoConnectOBS();
    }
  }, 3000);
});

obs.on('SwitchScenes', (data) => {
  currentScene = data['scene-name'];
  io.emit('obs:currentScene', currentScene);
});

obs.on('SourceMuteStateChanged', (data) => {
  const source = audioSources.find(s => s.name === data.sourceName);
  if (source) {
    source.muted = data.muted;
    io.emit('obs:audioUpdated', { 
      name: data.sourceName, 
      muted: data.muted,
      volume: source.volume / 100
    });
  }
});

obs.on('SourceVolumeChanged', (data) => {
  const source = audioSources.find(s => s.name === data.sourceName);
  if (source) {
    source.volume = Math.round(data.volume * 100);
    io.emit('obs:audioUpdated', { 
      name: data.sourceName, 
      muted: source.muted,
      volume: data.volume
    });
  }
});

io.on('connection', (socket) => {
  socket.emit('obs:status', { connected: obsConnected });
  
  if (obsConnected && scenes.length > 0) {
    socket.emit('obs:scenes', { scenes, currentScene });
  }
  
  if (obsConnected && audioSources.length > 0) {
    socket.emit('obs:audioSources', audioSources);
  }
  
  socket.on('getInitialData', () => {
    socket.emit('obs:status', { connected: obsConnected });
    if (obsConnected && scenes.length > 0) {
      socket.emit('obs:scenes', { scenes, currentScene });
    }
    if (obsConnected && audioSources.length > 0) {
      socket.emit('obs:audioSources', audioSources);
    }
  });
});

async function startServer() {
  await initializeYouTubeId();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`YouTube Chat: http://localhost:${PORT}/chat`);
    if (YOUTUBE_STREAM_ID) {
      console.log(`YouTube Video ID: ${YOUTUBE_STREAM_ID}`);
    }
    setTimeout(autoConnectOBS, 1000);
  });
}

startServer().catch(console.error);

process.on('SIGINT', async () => {
  if (obsConnected) {
    await obs.disconnect();
  }
  process.exit(0);
});