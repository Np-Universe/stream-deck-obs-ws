# stream-deck-obs-ws
OBS Web Remote Controller &amp; Live Chat Dashboard  A local web-based OBS Studio control panel for streamers. Features scene switching, audio mixing, and integrated YouTube Live Chat viewer. Mobile-responsive interface with real-time controls via obs-websocket-js. Runs on local network only.  *100% AI-assisted creation.*

OBS Controller with YouTube Live Chat

A web application to control OBS Studio and display YouTube Live chat in real-time. Designed to be used as a stream deck on mobile browsers.
Main Features

    OBS Scene Control: Switch OBS scenes with one click

    Audio Control: Mute/unmute and adjust volume for each audio source

    YouTube Live Chat: Display YouTube Live chat directly in the app

    Responsive Interface: Optimized for mobile browsers (use as stream deck)

    Real-time Updates: Changes appear instantly on all connected devices

Requirements

    Node.js (version 14 or newer)

    OBS Studio with OBS WebSocket plugin installed

    Internet connection for YouTube Live Chat

    PC and Mobile Device on the same network

OBS WebSocket Plugin Installation

    Download plugin from: https://github.com/obsproject/obs-websocket/releases

    Extract files to OBS Studio folder

        Windows: C:\Program Files\obs-studio\

        macOS: /Applications/OBS.app/Contents/

        Linux: /usr/share/obs/

    Restart OBS Studio

    Enable WebSocket in OBS: Tools → WebSocket Server Settings

        Enable WebSocket server

        Port: 4455 (default)

        Set password if needed

Application Installation

    Clone or download this repository

    Install dependencies:
    text

    npm install

    Copy .env.example to .env:
    text

    copy .env.example .env

    Edit .env file according to your OBS configuration:
    text

    PORT=3000
    OBS_HOST=localhost
    OBS_PORT=4455
    OBS_PASSWORD=your_password
    YOUTUBE_STREAM_ID=

How to Run
Option 1: Using environment variable
text

# Set YouTube Stream ID in .env
YOUTUBE_STREAM_ID=y-GrL132lic

# Run the application
node wsobs.js

Option 2: Using command line argument
text

node wsobs.js https://www.youtube.com/watch?v=y-GrL132lic
# or
node wsobs.js https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic
# or
node wsobs.js y-GrL132lic

Option 3: Interactive input
text

node wsobs.js
# Application will prompt for YouTube link

Access from Mobile Device (Stream Deck Mode)
Step 1: Find Your PC IP Address

For Windows:

    Open Command Prompt (cmd)

    Type: ipconfig

    Look for "IPv4 Address" under your active network adapter

        Example: 192.168.1.100

For macOS:

    Open Terminal

    Type: ifconfig | grep "inet "

    Look for IP address (usually starts with 192.168.x.x)

        Example: 192.168.1.150

For Linux:

    Open Terminal

    Type: ip addr show or ifconfig

    Look for "inet" address

        Example: 192.168.1.200

Step 2: Access from Mobile Browser

Once the application is running on your PC:

    Make sure your mobile device is connected to the SAME WiFi network as your PC

    Open mobile browser (Chrome, Safari, etc.)

    Type in the address bar:
    text

    http://[YOUR_PC_IP]:3000

    Example: http://192.168.1.100:3000

    The OBS controller interface will load on your mobile device

    Use it as a stream deck to control your OBS scenes and audio

Step 3: Access YouTube Chat

On your mobile device, click the 💬 chat icon in the bottom right corner to open the YouTube Live chat.
YouTube URL Input Formats

Application accepts various formats:

    Full URL: https://www.youtube.com/watch?v=y-GrL132lic

    Live Chat URL: https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic

    Short URL: https://youtu.be/y-GrL132lic

    Video ID only: y-GrL132lic

Important Notes for Mobile Usage

    Keep PC Running: The server must remain active on your PC

    Same Network: PC and mobile must be on same WiFi/LAN

    Firewall Settings: Windows/macOS firewall might block connection

        Windows: Allow Node.js through Windows Defender Firewall

        macOS: System Preferences → Security & Privacy → Firewall

    Port Access: Ensure port 3000 is accessible on your network

Troubleshooting
Cannot access from mobile:

    Check if PC and mobile are on same network

    Verify PC IP address is correct

    Disable Windows/macOS firewall temporarily to test

    Check if any antivirus is blocking Node.js

OBS not connecting:

    Ensure OBS WebSocket plugin is installed

    Ensure WebSocket server is active in OBS

    Check password in .env file

YouTube Chat not showing:

    Ensure YouTube Live stream is active

    Check entered Video ID

    Try direct access: http://[YOUR_PC_IP]:3000/chat

Audio controls not appearing:

    Ensure audio sources exist in OBS Scene

    Restart application and OBS

API Endpoints

    GET / - Main interface (stream deck)

    GET /chat - YouTube Live Chat

    POST /api/switch-scene - Switch OBS scene

    POST /api/toggle-audio - Mute/unmute audio

    POST /api/set-volume - Adjust volume

    GET /api/status - Connection status

Mobile Browser Tips

    Add to Home Screen (iOS/Android):

        Open the app in mobile browser

        Tap share icon → "Add to Home Screen"

        Now you have a stream deck app icon!

    Keep Screen On:

        Android: Developer options → Stay awake

        iOS: Settings → Display & Brightness → Auto-Lock → Never

    Landscape Mode:

        Rotate phone horizontally for better view of audio controls

License

This project is created for personal use.

This project is 100% AI-assisted
OBS Controller dengan YouTube Live Chat

Aplikasi web untuk mengontrol OBS Studio dan menampilkan chat YouTube Live secara real-time. Didesain untuk digunakan sebagai stream deck di browser mobile.
Fitur Utama

    Kontrol Scene OBS: Ganti scene OBS dengan satu klik

    Kontrol Audio: Mute/unmute dan atur volume untuk setiap sumber audio

    YouTube Live Chat: Tampilkan chat YouTube Live langsung di aplikasi

    Antarmuka Responsif: Dioptimalkan untuk browser mobile (gunakan sebagai stream deck)

    Real-time Updates: Perubahan langsung terlihat di semua perangkat yang terhubung

Persyaratan

    Node.js (versi 14 atau lebih baru)

    OBS Studio dengan plugin OBS WebSocket terinstal

    Koneksi internet untuk YouTube Live Chat

    PC dan Perangkat Mobile dalam jaringan yang sama

Instalasi Plugin OBS WebSocket

    Download plugin dari: https://github.com/obsproject/obs-websocket/releases

    Ekstrak file ke folder OBS Studio

        Windows: C:\Program Files\obs-studio\

        macOS: /Applications/OBS.app/Contents/

        Linux: /usr/share/obs/

    Restart OBS Studio

    Aktifkan WebSocket di OBS: Tools → WebSocket Server Settings

        Aktifkan server WebSocket

        Port: 4455 (default)

        Set password jika diperlukan

Instalasi Aplikasi

    Clone atau download repository ini

    Install dependencies:
    text

    npm install

    Copy file .env.example ke .env:
    text

    copy .env.example .env

    Edit file .env sesuai konfigurasi OBS Anda:
    text

    PORT=3000
    OBS_HOST=localhost
    OBS_PORT=4455
    OBS_PASSWORD=password_anda
    YOUTUBE_STREAM_ID=

Cara Menjalankan
Opsi 1: Dengan environment variable
text

# Set YouTube Stream ID di .env
YOUTUBE_STREAM_ID=y-GrL132lic

# Jalankan aplikasi
node wsobs.js

Opsi 2: Dengan argumen command line
text

node wsobs.js https://www.youtube.com/watch?v=y-GrL132lic
# atau
node wsobs.js https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic
# atau
node wsobs.js y-GrL132lic

Opsi 3: Input interaktif
text

node wsobs.js
# Aplikasi akan meminta input link YouTube

Akses dari Perangkat Mobile (Mode Stream Deck)
Langkah 1: Cari IP Address PC Anda

Untuk Windows:

    Buka Command Prompt (cmd)

    Ketik: ipconfig

    Cari "IPv4 Address" di adapter jaringan aktif

        Contoh: 192.168.1.100

Untuk macOS:

    Buka Terminal

    Ketik: ifconfig | grep "inet "

    Cari alamat IP (biasanya dimulai dengan 192.168.x.x)

        Contoh: 192.168.1.150

Untuk Linux:

    Buka Terminal

    Ketik: ip addr show atau ifconfig

    Cari alamat "inet"

        Contoh: 192.168.1.200

Langkah 2: Akses dari Browser Mobile

Setelah aplikasi berjalan di PC Anda:

    Pastikan perangkat mobile terhubung ke jaringan WiFi yang SAMA dengan PC

    Buka browser mobile (Chrome, Safari, dll.)

    Ketik di address bar:
    text

    http://[IP_PC_ANDA]:3000

    Contoh: http://192.168.1.100:3000

    Interface controller OBS akan terbuka di perangkat mobile Anda

    Gunakan sebagai stream deck untuk mengontrol scene dan audio OBS

Langkah 3: Akses YouTube Chat

Di perangkat mobile, klik ikon 💬 di pojok kanan bawah untuk membuka chat YouTube Live.
Format Input YouTube URL

Aplikasi menerima berbagai format:

    Full URL: https://www.youtube.com/watch?v=y-GrL132lic

    Live Chat URL: https://www.youtube.com/live_chat?is_popout=1&v=y-GrL132lic

    Short URL: https://youtu.be/y-GrL132lic

    Video ID saja: y-GrL132lic

Catatan Penting untuk Penggunaan Mobile

    PC Harus Menyala: Server harus tetap aktif di PC Anda

    Jaringan Sama: PC dan mobile harus dalam WiFi/LAN yang sama

    Pengaturan Firewall: Firewall Windows/macOS mungkin memblokir koneksi

        Windows: Izinkan Node.js melalui Windows Defender Firewall

        macOS: System Preferences → Security & Privacy → Firewall

    Akses Port: Pastikan port 3000 dapat diakses di jaringan Anda

Troubleshooting
Tidak bisa akses dari mobile:

    Cek apakah PC dan mobile dalam jaringan yang sama

    Verifikasi IP address PC benar

    Nonaktifkan firewall Windows/macOS sementara untuk testing

    Cek apakah antivirus memblokir Node.js

OBS tidak terhubung:

    Pastikan OBS WebSocket plugin terinstal

    Pastikan WebSocket server aktif di OBS

    Periksa password di file .env

Chat YouTube tidak muncul:

    Pastikan stream YouTube Live sedang berlangsung

    Periksa Video ID yang dimasukkan

    Coba akses langsung: http://[IP_PC_ANDA]:3000/chat

Audio controls tidak muncul:

    Pastikan ada sumber audio di OBS Scene

    Restart aplikasi dan OBS

API Endpoints

    GET / - Interface utama (stream deck)

    GET /chat - YouTube Live Chat

    POST /api/switch-scene - Ganti scene OBS

    POST /api/toggle-audio - Mute/unmute audio

    POST /api/set-volume - Atur volume

    GET /api/status - Status koneksi

Tips Browser Mobile

    Tambahkan ke Home Screen (iOS/Android):

        Buka aplikasi di browser mobile

        Tap icon share → "Add to Home Screen"

        Sekarang Anda punya icon aplikasi stream deck!

    Jaga Layar Tetap Menyala:

        Android: Developer options → Stay awake

        iOS: Settings → Display & Brightness → Auto-Lock → Never

    Mode Landscape:

        Putar phone horizontal untuk view audio controls yang lebih baik

Lisensi

Proyek ini dibuat untuk penggunaan pribadi.

Project ini 100% bantuan AI
