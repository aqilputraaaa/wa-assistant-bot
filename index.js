const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const chrono = require('chrono-node');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Database Setup
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ tasks: [] }).write();

// Format Nomor WhatsApp Web (08xx -> 628xx@c.us)
const NUMBERS = {
  AQIL: '6282335544399@c.us',
  CINDY: '6281548812348@c.us'
};

const FOOTER = '\n\n- PUTRA BOT 🤖';

// Variasi Pesan Routine 7 Hari
const MESSAGES = {
  AQIL: {
    subuh: [
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Selamat menunaikan ibadah sholat Subuh. Selamat menikmati pagi, persiapkan dirimu dengan gembira! ☀️✨",
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Buka harimu dengan tenang dan penuh berkah ya! 🕌✨",
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Awali pagi dengan niat yang baik dan semangat baru! 🌅✨",
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Jangan lupa berdoa untuk kelancaran aktivitasmu hari ini ya! 🤲✨",
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Tetap konsisten dan semangat melangkah pagi ini! 💪✨",
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Jumat penuh berkah, semoga harimu dilancarkan ya! 🕌🌸",
      "🌙 *PENGINGAT SHOLAT SUBUH*\nHalo mas Aqil! Sudah (04.13 WIB). Pagi yang tenang, nikmati harimu dengan santai ya! ☕✨"
    ],
    dzuhur: [
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Selamat menunaikan ibadah sholat Dzuhur. Nikmati waktu istirahat siangmu hari ini! 🍱✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Selamat menunaikan ibadah sholat Dzuhur. Jangan lupa istirahat sejenak dan makan siang ya! 🕌🍱",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Rehat dulu sebentar, isi energimu untuk siang ini! 🥗✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Lepaskan penat pekerjaan sejenak, selamat makan siang! 🥪✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Dikit lagi menuju akhir pekan, jaga stamina dan rehat dulu! ☕✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Selamat menunaikan ibadah sholat Jumat & rehat siang! 🕌✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo mas Aqil! Sudah (11.28 WIB). Tetap ingat waktu ibadah di tengah aktivitas akhir pekan ya! 🕌"
    ],
    ashar: [
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Selamat menunaikan ibadah sholat Ashar. Kumpulkan tenaga untuk menyambut esok hari ya! ⛅✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Selamat menunaikan ibadah sholat Ashar. Sedikit lagi menuju sore, tetap semangat ya! 🕌☕",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Rehat sejenak dari rutinitas, jalani sore dengan tenang! ⛅✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Pekerjaan hampir selesai, jaga fokus sampai sore nanti! 💪✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Dikit lagi beres kerjaan hari ini, semangat! ☕✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Sore Jumat yang adem, selamat rehat sejenak! 🌸✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo mas Aqil! Sudah (14.49 WIB). Selamat menikmati waktu sore di akhir pekan! ☕✨"
    ],
    pulang: [
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB. Siapkan energi untuk esok hari, selamat beristirahat! 🛵✨",
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB, waktunya Pulang Kerja. Hati-hati di jalan dan selamat beristirahat! 🛵💨",
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB. Kerjaan hari ini beres! Hati-hati di jalan ya mas Aqil! 🛵✨",
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB, yuk rapi-rapi dan siap jalan pulang! 🛵💨",
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB. Hati-hati di jalan pulang, nikmati waktu rehat soremu! 🛵✨",
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB. Selamat menikmati libur akhir pekan! Hati-hati di jalan ya! 🛵🎉",
      "💼 *PENGINGAT PULANG KERJA*\nHalo mas Aqil! Sudah jam 16.30 WIB. Waktu aktivitas selesai, selamat rehat sore mas Aqil! 🛵✨"
    ],
    maghrib: [
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Tenangkan pikiran untuk menyambut esok hari! 🌆✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Selamat menunaikan ibadah sholat Maghrib. Lepaskan semua lelahmu hari ini ya! 🕌✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Nikmati waktu sore yang tenang bersama keluarga! 🌆✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Syukuri pencapaian harimu dan rehat dengan nyaman! 🕌✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Malam Jumat yang tenang, selamat beristirahat! 🕌✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Selamat menikmati malam akhir pekan yang damai! 🌆✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo mas Aqil! Sudah (17.24 WIB). Rehat santai di Sabtu malam, lepaskan penatmu! 🕌✨"
    ],
    isya: [
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Tidur yang cukup agar besok bangun dengan segar! 😴✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Selamat menunaikan ibadah sholat Isya. Selamat beristirahat dan sampai jumpa esok hari! 🕌🌙",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Sempurnakan ibadah malam ini dan tidur yang nyenyak ya! 🌙✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Evaluasi harimu dengan tenang dan selamat tidur! 😴✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Selamat rehat malam, rested well untuk esok hari! 🌙✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Selamat tidur nyenyak di malam Sabtu! 😴✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo mas Aqil! Sudah (18.35 WIB). Nikmati istirahat malam minggumu dengan nyaman! 🌙✨"
    ]
  },
  CINDY: {
    pagi: [
      "🌅 *PENGINGAT PAGI*\nHalo Cindy! Selamat pagi ✨",
      "🌅 *PENGINGAT PAGI*\nHalo Cindy! Selamat pagi ✨",
      "🌅 *PENGINGAT PAGI*\nPagi Cindy! Selamat beraktivitas hari ini yaa ✨",
      "🌅 *PENGINGAT PAGI*\nSelamat pagi Cindy! Buka harimu dengan senyuman ✨",
      "🌅 *PENGINGAT PAGI*\nPagi Cindy! Semangat untuk hari ini yaa ✨",
      "🌅 *PENGINGAT PAGI*\nSelamat pagi Cindy! Semoga harimu menyenangkan ✨",
      "🌅 *PENGINGAT PAGI*\nPagi Cindy! Selamat menikmati akhir pekan ✨"
    ],
    dzuhur: [
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Nikmati makan siang dan selalu ingat Aqil ya! 💕",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Jangan lupa tetep kangen sama Aqil ya! 💕",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Ingat makan siang dan kangenin Aqil terus yaa! ✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Rehat dulu sejenak dan ingat Aqil terus ya! 💕",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Jangan lupa makan siang dan tetep sayang sama Aqil! ✨",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Selamat rehat siang, tetap kangenin Aqil yaa! 💕",
      "☀️ *PENGINGAT SHOLAT DZUHUR*\nHalo Cindy! Sudah (11.28 WIB). Makan siang yang enak yaa, dan ingat Aqil terus! ✨"
    ],
    ashar: [
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Nikmati waktu sore, Aqil selalu sayang Cindy! ✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Ingat kalau Aqil selalu sayang sama Cindy! ✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Sedikit lagi sore, tetap semangat dan sayang Aqil yaa! 💕",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Rehat sejenak yaa, Aqil selalu bangga sama Cindy! ✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Jangan terlalu capek yaa, ingat ada Aqil di sini! 💕",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Sore yang adem, selalu ingat Aqil yaa! ✨",
      "⛅ *PENGINGAT SHOLAT ASHAR*\nHalo Cindy! Sudah (14.49 WIB). Santai sejenak di sore hari, tetep sayang Aqil ya! 💕"
    ],
    pulang: [
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Waktu istirahat sore tiba, Aqil bersiap pulang.",
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Sudah jam 16.30 WIB, sekarang sudah waktunya Aqil pulang kerja.",
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Aqil sudah waktunya jalan pulang kerja nih.",
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Jam kerja Aqil sudah selesai dan siap-siap pulang.",
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Aqil otw pulang kerja sekarang yaa.",
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Kerja keras Aqil minggu ini selesai, waktunya pulang!",
      "💼 *INFORMASI PULANG KERJA*\nHalo Cindy! Jam aktivitas Aqil sudah selesai dan siap pulang."
    ],
    maghrib: [
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Rehat yang nyaman yaa, tetap sayang Aqil selalu! 💕",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Jangan lupa kangenin Aqil malam ini ya! 💕",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Lepaskan lelah dan selalu kangen sama Aqil yaa! ✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Selamat menikmati waktu sore, tetep sayang Aqil ya! 💕",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Malam Jumat yang tenang, kangenin Aqil terus yaa! ✨",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Nikmati malam akhir pekan, selalu ingat Aqil ya! 💕",
      "🌆 *PENGINGAT SHOLAT MAGHRIB*\nHalo Cindy! Sudah (17.24 WIB). Selamat malam minggu, jangan lupa kangen Aqil! ✨"
    ],
    isya: [
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Sempurnakan hari dengan ibadah, besok semangat lagi bareng Aqil! ✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Istirahat yang cukup dan jangan lupa selalu sayang sama Aqil! ✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Rehat dulu dari aktivitas dan tetap kangen sama Aqil ya! 💕",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Selamat tidur nyenyak & mimpikan Aqil malam ini ya! ✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Selamat beristirahat, jangan pernah bosan sayang sama Aqil ya! 💕",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Lepaskan semua lelah, selalu ingat Aqil yaa! ✨",
      "🌙 *PENGINGAT SHOLAT ISYA*\nHalo Cindy! Sudah (18.35 WIB). Selamat malam minggu, selamat beristirahat yaa! 💕"
    ]
  }
};

// Client Setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('\n--- SCAN QR CODE DI BAWAH DENGAN WA BOT ---');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ PUTRA Bot Aktif & Terhubung!');
});

// 1. CRON JOB: Cek DB Pengingat Kustom (Setiap 10 Detik)
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const tasks = db.get('tasks').value();

  for (const task of tasks) {
    const taskTime = new Date(task.time);
    
    if (taskTime <= now && !task.notified) {
      try {
        await client.sendMessage(
          task.targetNumber, 
          `🔔 *PENGINGAT TUGAS*\n\n📌 *Tugas:* ${task.title.toUpperCase()}\n⏰ *Waktu:* ${taskTime.toLocaleString('id-ID')}`
        );
        
        db.get('tasks')
          .find({ id: task.id })
          .assign({ notified: true })
          .write();

        console.log(`[PENGINGAT TERKIRIM] ${task.title} ke ${task.targetNumber}`);
      } catch (err) {
        console.error('Gagal mengirim pesan pengingat:', err);
      }
    }
  }
});

// 2. CRON JOB: Jadwal Routine Harian (Aqil & Cindy)
const sendScheduledMessage = async (type) => {
  const dayOfWeek = new Date().getDay();

  if (MESSAGES.AQIL[type]) {
    const msgAqil = MESSAGES.AQIL[type][dayOfWeek] + FOOTER;
    await client.sendMessage(NUMBERS.AQIL, msgAqil);
  }

  if (MESSAGES.CINDY[type]) {
    const msgCindy = MESSAGES.CINDY[type][dayOfWeek] + FOOTER;
    await client.sendMessage(NUMBERS.CINDY, msgCindy);
  }
};

const tz = { scheduled: true, timezone: "Asia/Jakarta" };

cron.schedule('13 4 * * *', () => sendScheduledMessage('subuh'), tz);
cron.schedule('0 7 * * *', () => sendScheduledMessage('pagi'), tz);
cron.schedule('28 11 * * *', () => sendScheduledMessage('dzuhur'), tz);
cron.schedule('49 14 * * *', () => sendScheduledMessage('ashar'), tz);
cron.schedule('30 16 * * *', () => sendScheduledMessage('pulang'), tz);
cron.schedule('24 17 * * *', () => sendScheduledMessage('maghrib'), tz);
cron.schedule('35 18 * * *', () => sendScheduledMessage('isya'), tz);

// Contoh Random
const contohRandomList = [
  ["Ingatkan saya makan 10 menit lagi 🍕", "Ingatkan ganti oli 14 hari lagi 🛵"],
  ["Ingatkan saya sholat 5 menit lagi 🕌", "Ingatkan bayar kosan 30 hari lagi di jam ini 🏠"],
  ["Ingatkan meeting tim 2 jam lagi 💼", "Ingatkan jemput pacar jam 5 sore 🛵"],
  ["Ingatkan minum air putih 30 menit lagi 🥛", "Ingatkan beli tiket 7 hari lagi 🎟️"],
  ["Ingatkan istirahat 15 menit lagi ☕", "Ingatkan perpanjang SIM 100 hari lagi 📄"], 
  ["Ingatkan submit laporan 1 jam lagi 📄", "Ingatkan deadline tugas kampus 3 hari lagi 🎓"],
  ["Ingatkan kirim email ke klien 15 menit lagi 📧", "Ingatkan review kodingan 2 hari lagi 💻"],
  ["Ingatkan kumpul revisi desain 45 menit lagi 🎨", "Ingatkan presentasi project 5 hari lagi 📊"],
  ["Ingatkan evaluasi mingguan 2 jam lagi 📈", "Ingatkan bayar tagihan server 30 hari lagi 🖥️"],
  ["Ingatkan follow up vendor 30 menit lagi 📞", "Ingatkan ujian akhir semester 14 hari lagi 📚"]
];

function getRandomContoh() {
  const randomIndex = Math.floor(Math.random() * contohRandomList.length);
  const [contoh1, contoh2] = contohRandomList[randomIndex];
  
  return (
    `Hai! 🖐️🤖\n\n` +
    `Asisten pengingat setia kamu! Ada jadwal penting yang takut kelupaan? ⏰\n\n` +
    `Kamu bisa minta diingetin bebas kapan saja:\n` +
    `⏱️ Bebas hitungan menit / jam / hari\n` +
    `📅 Mau buat nanti, besok, atau bulan depan? BISA!\n\n` +
    `*Contoh simpel:*\n` +
    `📌 \`${contoh1}\`\n` +
    `📌 \`${contoh2}\`\n\n` +
    `📌 Ketik *"JADWAL"* untuk cek semua jadwal kamu.\n\n` +
    `Yuk, catat jadwalmu sekarang! 📝👍`
  );
}

function parseWaktuIndo(text) {
  const now = new Date();
  let targetTime = null;
  let cleanTitle = text;

  const matchHari = text.match(/(\d+)\s*hari(\s*lagi)?/i);
  if (matchHari) {
    const hari = parseInt(matchHari[1]);
    targetTime = new Date(now.getTime() + hari * 24 * 60 * 60 * 1000);
    cleanTitle = text.replace(/(\d+)\s*hari(\s*lagi)?(\s*di\s*jam\s*ini)?/gi, '');
  }

  const matchMenit = text.match(/(\d+)\s*menit(\s*lagi)?/i);
  if (matchMenit && !targetTime) {
    const menit = parseInt(matchMenit[1]);
    targetTime = new Date(now.getTime() + menit * 60000);
    cleanTitle = text.replace(/(\d+)\s*menit(\s*lagi)?/gi, '');
  }

  const matchJam = text.match(/(\d+)\s*jam(\s*lagi)?/i);
  if (matchJam && !targetTime) {
    const jam = parseInt(matchJam[1]);
    targetTime = new Date(now.getTime() + jam * 3600000);
    cleanTitle = text.replace(/(\d+)\s*jam(\s*lagi)?/gi, '');
  }

  if (!targetTime) {
    targetTime = chrono.parseDate(text, now, { forwardDate: true });
  }

  cleanTitle = cleanTitle
    .replace(/\b(saya|aku|tolong|untuk|agar|soalnya|karena|di jam ini|jam ini)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { targetTime, cleanTitle };
}

// Respon Pesan Masuk
client.on('message', async (msg) => {
  const text = msg.body.trim();
  const lowerText = text.toLowerCase();
  const sender = msg.from;

  const kataSapaan = ['hai', 'hi', 'hello', 'halo', 'p', 'bot', 'spada', 'ping', 'siapa kamu', 'siapa kamu?'];
  if (kataSapaan.includes(lowerText)) {
    return msg.reply(getRandomContoh());
  }

  if (lowerText === 'jadwal') {
    const tasks = db.get('tasks').filter({ targetNumber: sender, notified: false }).value();
    
    if (tasks.length === 0) {
      return msg.reply('🎉 Tidak ada jadwal pengingat aktif saat ini!');
    }

    let listMessage = '📋 *DAFTAR TUGAS AKTIF (PUTRA BOT):*\n\n';
    tasks.forEach((t, i) => {
      listMessage += `${i + 1}. *${t.title.toUpperCase()}*\n   🕒 ${new Date(t.time).toLocaleString('id-ID')}\n\n`;
    });

    return msg.reply(listMessage);
  }

  if (lowerText.startsWith('ingatkan ') || lowerText.startsWith('!ingatkan ')) {
    const commandText = text.replace(/^(!?ingatkan\s+)/i, '');
    const { targetTime, cleanTitle } = parseWaktuIndo(commandText);

    if (targetTime) {
      const finalTitle = cleanTitle || commandText;

      db.get('tasks')
        .push({
          id: Date.now(),
          targetNumber: sender,
          title: finalTitle,
          time: targetTime.toISOString(),
          notified: false
        })
        .write();

      return msg.reply(`Siap, dicatat oleh *PUTRA*! 📝\n\n📌 *Pengingat:* ${finalTitle.toUpperCase()}\n📅 *Jadwal:* ${targetTime.toLocaleString('id-ID')}`);
    } else {
      return msg.reply('❌ Waktu tidak terdeteksi.\nContoh: `Ingatkan saya sholat 5 menit lagi`');
    }
  }

  return msg.reply(getRandomContoh());
});

client.initialize();
