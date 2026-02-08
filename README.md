# OBS Controller with YouTube Live Chat

A web application to control OBS Studio and display YouTube Live chat in real-time. Designed to be used as a stream deck on mobile browsers.

> 🤖 This project is 100% AI-assisted

## Main Features

- **OBS Scene Control**: Switch OBS scenes with one click
- **Audio Control**: Mute/unmute and adjust volume for each audio source
- **YouTube Live Chat**: Display YouTube Live chat directly in the app
- **Responsive Interface**: Optimized for mobile browsers (use as stream deck)
- **Real-time Updates**: Changes appear instantly on all connected devices

## Requirements

- Node.js (version 14 or newer)
- OBS Studio with OBS WebSocket plugin installed
- Internet connection for YouTube Live Chat
- PC and Mobile Device on the same network

## OBS WebSocket Plugin Installation

1. Download plugin from: https://github.com/obsproject/obs-websocket/releases
2. Extract files to OBS Studio folder:
   - **Windows**: `C:\Program Files\obs-studio\`
   - **macOS**: `/Applications/OBS.app/Contents/`
   - **Linux**: `/usr/share/obs/`
3. Restart OBS Studio
4. Enable WebSocket in OBS:
   - Go to **Tools** → **WebSocket Server Settings**
   - Enable WebSocket server
   - Port: `4455` (default)
   - Set password if needed

## Application Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
4. Edit `.env` file according to your OBS configuration:
   ```env
   PORT=3000
   OBS_HOST=localhost
   OBS_PORT=4455
   OBS_PASSWORD=your_password
   YOUTUBE_STREAM_ID=
   ```

## How to Run

### Option 1: Using environment variable

```bash
# Set YouTube Stream ID in .env
YOUTUBE_STREAM_ID=y-GrL132lic

# Run the application
node wsobs.js
```

### Option 2: Using command line argument

```bash
node wsobs.js https://www.youtube.com/watch?v=y-GrL132lic
# or
node wsobs.js https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic
# or
node wsobs.js y-GrL132lic
```

### Option 3: Interactive input

```bash
node wsobs.js
# Application will prompt for YouTube link
```

## Access from Mobile Device (Stream Deck Mode)

### Step 1: Find Your PC IP Address

**For Windows:**
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100`

**For macOS:**
1. Open Terminal
2. Type: `ifconfig | grep "inet "`
3. Look for IP address (usually starts with 192.168.x.x)
4. Example: `192.168.1.150`

**For Linux:**
1. Open Terminal
2. Type: `ip addr show` or `ifconfig`
3. Look for "inet" address
4. Example: `192.168.1.200`

### Step 2: Access from Mobile Browser

1. Make sure your mobile device is connected to the **SAME WiFi network** as your PC
2. Open mobile browser (Chrome, Safari, etc.)
3. Type in the address bar:
   ```
   http://[YOUR_PC_IP]:3000
   ```
   Example: `http://192.168.1.100:3000`
4. The OBS controller interface will load on your mobile device
5. Use it as a stream deck to control your OBS scenes and audio

### Step 3: Access YouTube Chat

On your mobile device, click the 💬 chat icon in the bottom right corner to open the YouTube Live chat.

## YouTube URL Input Formats

Application accepts various formats:

- **Full URL**: `https://www.youtube.com/watch?v=y-GrL132lic`
- **Live Chat URL**: `https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic`
- **Short URL**: `https://youtu.be/y-GrL132lic`
- **Video ID only**: `y-GrL132lic`

## Important Notes for Mobile Usage

- **Keep PC Running**: The server must remain active on your PC
- **Same Network**: PC and mobile must be on same WiFi/LAN
- **Firewall Settings**: Windows/macOS firewall might block connection
  - **Windows**: Allow Node.js through Windows Defender Firewall
  - **macOS**: System Preferences → Security & Privacy → Firewall
- **Port Access**: Ensure port 3000 is accessible on your network

## Troubleshooting

### Cannot access from mobile:
- Check if PC and mobile are on same network
- Verify PC IP address is correct
- Disable Windows/macOS firewall temporarily to test
- Check if any antivirus is blocking Node.js

### OBS not connecting:
- Ensure OBS WebSocket plugin is installed
- Ensure WebSocket server is active in OBS
- Check password in `.env` file

### YouTube Chat not showing:
- Ensure YouTube Live stream is active
- Check entered Video ID
- Try direct access: `http://[YOUR_PC_IP]:3000/chat`

### Audio controls not appearing:
- Ensure audio sources exist in OBS Scene
- Restart application and OBS

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main interface (stream deck) |
| GET | `/chat` | YouTube Live Chat |
| POST | `/api/switch-scene` | Switch OBS scene |
| POST | `/api/toggle-audio` | Mute/unmute audio |
| POST | `/api/set-volume` | Adjust volume |
| GET | `/api/status` | Connection status |

## Mobile Browser Tips

### Add to Home Screen (iOS/Android):
1. Open the app in mobile browser
2. Tap share icon → "Add to Home Screen"
3. Now you have a stream deck app icon!

### Keep Screen On:
- **Android**: Developer options → Stay awake
- **iOS**: Settings → Display & Brightness → Auto-Lock → Never

### Landscape Mode:
Rotate phone horizontally for better view of audio controls

## License

This project is created for personal use.

---

## Bahasa Indonesia

### OBS Controller dengan YouTube Live Chat

Aplikasi web untuk mengontrol OBS Studio dan menampilkan chat YouTube Live secara real-time. Didesain untuk digunakan sebagai stream deck di browser mobile.

> 🤖 Project ini 100% bantuan AI

### Fitur Utama

- **Kontrol Scene OBS**: Ganti scene OBS dengan satu klik
- **Kontrol Audio**: Mute/unmute dan atur volume untuk setiap sumber audio
- **YouTube Live Chat**: Tampilkan chat YouTube Live langsung di aplikasi
- **Antarmuka Responsif**: Dioptimalkan untuk browser mobile (gunakan sebagai stream deck)
- **Real-time Updates**: Perubahan langsung terlihat di semua perangkat yang terhubung

### Persyaratan

- Node.js (versi 14 atau lebih baru)
- OBS Studio dengan plugin OBS WebSocket terinstal
- Koneksi internet untuk YouTube Live Chat
- PC dan Perangkat Mobile dalam jaringan yang sama

### Instalasi Plugin OBS WebSocket

1. Download plugin dari: https://github.com/obsproject/obs-websocket/releases
2. Ekstrak file ke folder OBS Studio:
   - **Windows**: `C:\Program Files\obs-studio\`
   - **macOS**: `/Applications/OBS.app/Contents/`
   - **Linux**: `/usr/share/obs/`
3. Restart OBS Studio
4. Aktifkan WebSocket di OBS:
   - Buka **Tools** → **WebSocket Server Settings**
   - Aktifkan server WebSocket
   - Port: `4455` (default)
   - Set password jika diperlukan

### Instalasi Aplikasi

1. Clone atau download repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy file `.env.example` ke `.env`:
   ```bash
   copy .env.example .env
   ```
4. Edit file `.env` sesuai konfigurasi OBS Anda:
   ```env
   PORT=3000
   OBS_HOST=localhost
   OBS_PORT=4455
   OBS_PASSWORD=password_anda
   YOUTUBE_STREAM_ID=
   ```

### Cara Menjalankan

#### Opsi 1: Dengan environment variable

```bash
# Set YouTube Stream ID di .env
YOUTUBE_STREAM_ID=y-GrL132lic

# Jalankan aplikasi
node wsobs.js
```

#### Opsi 2: Dengan argumen command line

```bash
node wsobs.js https://www.youtube.com/watch?v=y-GrL132lic
# atau
node wsobs.js https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic
# atau
node wsobs.js y-GrL132lic
```

#### Opsi 3: Input interaktif

```bash
node wsobs.js
# Aplikasi akan meminta input link YouTube
```

### Akses dari Perangkat Mobile (Mode Stream Deck)

#### Langkah 1: Cari IP Address PC Anda

**Untuk Windows:**
1. Buka Command Prompt (cmd)
2. Ketik: `ipconfig`
3. Cari "IPv4 Address" di adapter jaringan aktif
4. Contoh: `192.168.1.100`

**Untuk macOS:**
1. Buka Terminal
2. Ketik: `ifconfig | grep "inet "`
3. Cari alamat IP (biasanya dimulai dengan 192.168.x.x)
4. Contoh: `192.168.1.150`

**Untuk Linux:**
1. Buka Terminal
2. Ketik: `ip addr show` atau `ifconfig`
3. Cari alamat "inet"
4. Contoh: `192.168.1.200`

#### Langkah 2: Akses dari Browser Mobile

1. Pastikan perangkat mobile terhubung ke jaringan WiFi yang **SAMA** dengan PC
2. Buka browser mobile (Chrome, Safari, dll.)
3. Ketik di address bar:
   ```
   http://[IP_PC_ANDA]:3000
   ```
   Contoh: `http://192.168.1.100:3000`
4. Interface controller OBS akan terbuka di perangkat mobile Anda
5. Gunakan sebagai stream deck untuk mengontrol scene dan audio OBS

#### Langkah 3: Akses YouTube Chat

Di perangkat mobile, klik ikon 💬 di pojok kanan bawah untuk membuka chat YouTube Live.

### Format Input YouTube URL

Aplikasi menerima berbagai format:

- **Full URL**: `https://www.youtube.com/watch?v=y-GrL132lic`
- **Live Chat URL**: `https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic`
- **Short URL**: `https://youtu.be/y-GrL132lic`
- **Video ID saja**: `y-GrL132lic`

### Catatan Penting untuk Penggunaan Mobile

- **PC Harus Menyala**: Server harus tetap aktif di PC Anda
- **Jaringan Sama**: PC dan mobile harus dalam WiFi/LAN yang sama
- **Pengaturan Firewall**: Firewall Windows/macOS mungkin memblokir koneksi
  - **Windows**: Izinkan Node.js melalui Windows Defender Firewall
  - **macOS**: System Preferences → Security & Privacy → Firewall
- **Akses Port**: Pastikan port 3000 dapat diakses di jaringan Anda

### Troubleshooting

#### Tidak bisa akses dari mobile:
- Cek apakah PC dan mobile dalam jaringan yang sama
- Verifikasi IP address PC benar
- Nonaktifkan firewall Windows/macOS sementara untuk testing
- Cek apakah antivirus memblokir Node.js

#### OBS tidak terhubung:
- Pastikan OBS WebSocket plugin terinstal
- Pastikan WebSocket server aktif di OBS
- Periksa password di file `.env`

#### Chat YouTube tidak muncul:
- Pastikan stream YouTube Live sedang berlangsung
- Periksa Video ID yang dimasukkan
- Coba akses langsung: `http://[IP_PC_ANDA]:3000/chat`

#### Audio controls tidak muncul:
- Pastikan ada sumber audio di OBS Scene
- Restart aplikasi dan OBS

### API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Interface utama (stream deck) |
| GET | `/chat` | YouTube Live Chat |
| POST | `/api/switch-scene` | Ganti scene OBS |
| POST | `/api/toggle-audio` | Mute/unmute audio |
| POST | `/api/set-volume` | Atur volume |
| GET | `/api/status` | Status koneksi |

### Tips Browser Mobile

#### Tambahkan ke Home Screen (iOS/Android):
1. Buka aplikasi di browser mobile
2. Tap icon share → "Add to Home Screen"
3. Sekarang Anda punya icon aplikasi stream deck!

#### Jaga Layar Tetap Menyala:
- **Android**: Developer options → Stay awake
- **iOS**: Settings → Display & Brightness → Auto-Lock → Never

#### Mode Landscape:
Putar phone horizontal untuk view audio controls yang lebih baik

### Lisensi

Proyek ini dibuat untuk penggunaan pribadi.
