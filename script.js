// 1. Tambahkan SMOKE di dalam KEYS agar fungsi reset bisa bekerja otomatis
const KEYS = {
    SLEEP: "sleepHistory",
    SPORT: "exerciseHistory",
    GAME: "gameHistory",
    STUDY: "studyHistory",
    SAVING: "savingHistory",
    SMOKE: "smokeHistory" // Tambahkan ini
};

const TARGET_SLEEP = 7 * 60;

// --- FUNGSI LOGIN ---
window.addEventListener("load", () => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
        showApp();
    }
});

function handleLogin() {
    const user = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;

    if (user.trim() !== "" && pin === "1234") {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("currentUser", user);
        showApp();
    } else {
        alert("Nama tidak boleh kosong atau PIN salah (Coba: 1234)");
    }
}

function showApp() {
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    
    const user = sessionStorage.getItem("currentUser");
    // Pastikan selector ".main-header h1" ada di HTML kamu
    const headerTitle = document.querySelector(".main-header h1");
    if(headerTitle) headerTitle.innerHTML = `Halo, <span>${user}</span>!`;
    
    renderSummary();
    if (typeof renderChart === "function") renderChart(); // Cek jika fungsi chart ada
    if (typeof renderSmoke === "function") {
        const smokeH = JSON.parse(localStorage.getItem(KEYS.SMOKE));
        if (smokeH) renderSmoke(smokeH);
    }
}

// --- FUNGSI SIMPAN DATA (REUSABLE) ---
function saveData(key, data) {
    const today = new Date().toLocaleDateString();
    let history = JSON.parse(localStorage.getItem(key)) || [];
    history = history.filter(d => d.date !== today);
    history.push({ ...data, date: today });
    if (history.length > 7) history.shift();
    localStorage.setItem(key, JSON.stringify(history));
    renderSummary();
    return history;
}

// --- FUNGSI ROKOK (CIGARETTE TRACKER) ---
function addSmoke(val) {
    const input = document.getElementById("smokeAmount");
    input.value = parseInt(input.value || 0) + val;
}

function saveSmoke() {
    const amount = parseInt(document.getElementById("smokeAmount").value);
    if (isNaN(amount) || amount < 0) return alert("Masukkan jumlah yang valid");

    let status = "Aman";
    if (amount > 10) status = "Bahaya";
    else if (amount > 5) status = "Waspada";

    saveData(KEYS.SMOKE, { amount, status });
    alert("Data rokok disimpan!");
    location.reload();
}

// --- FUNGSI RESET ---
function resetAllData() {
    const yakin = confirm("Apakah kamu yakin ingin menghapus semua data tracker?");
    if (yakin) {
        // Ini akan menghapus SEMUA yang ada di daftar KEYS termasuk SMOKE
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        alert("Semua data telah dibersihkan!");
        location.reload();
    }
}

// --- RENDER SUMMARY ---
function renderSummary() {
    const sleep = JSON.parse(localStorage.getItem(KEYS.SLEEP))?.slice(-1)[0];
    const sport = JSON.parse(localStorage.getItem(KEYS.SPORT))?.slice(-1)[0];
    const game = JSON.parse(localStorage.getItem(KEYS.GAME))?.slice(-1)[0];
    const study = JSON.parse(localStorage.getItem(KEYS.STUDY))?.slice(-1)[0];
    const saving = JSON.parse(localStorage.getItem(KEYS.SAVING))?.slice(-1)[0];
    const smoke = JSON.parse(localStorage.getItem(KEYS.SMOKE))?.slice(-1)[0]; // Gunakan KEYS.SMOKE

    let html = `<div class="summary-content">
        <p>🌙 Tidur: ${sleep ? sleep.status : 'Belum Terisi'}</p>
        <p>💪 Olahraga: ${sport ? sport.amount + ' (' + sport.status + ')' : 'Belum Terisi'}</p>
        <p>🎮 Game: ${game ? game.hours + ' jam' : 'Belum Terisi'}</p>
        <p>📚 Belajar: ${study ? study.topic : 'Belum Terisi'}</p>
        <p>💰 Tabungan: ${saving ? 'Rp' + saving.amount.toLocaleString() : 'Belum Terisi'}</p>
        <p>🚬 Rokok: ${smoke ? smoke.amount + ' Batang (' + smoke.status + ')' : 'Belum Terisi'}</p>
    </div>`;

    const summaryDiv = document.getElementById("summary");
    if(summaryDiv) summaryDiv.innerHTML = html;
}

function downloadReport() {
    // Ambil semua data terakhir dari localStorage
    const user = sessionStorage.getItem("currentUser") || "User";
    const sleep = JSON.parse(localStorage.getItem(KEYS.SLEEP))?.slice(-1)[0];
    const sport = JSON.parse(localStorage.getItem(KEYS.SPORT))?.slice(-1)[0];
    const game = JSON.parse(localStorage.getItem(KEYS.GAME))?.slice(-1)[0];
    const study = JSON.parse(localStorage.getItem(KEYS.STUDY))?.slice(-1)[0];
    const saving = JSON.parse(localStorage.getItem(KEYS.SAVING))?.slice(-1)[0];
    const smoke = JSON.parse(localStorage.getItem(KEYS.SMOKE))?.slice(-1)[0];

    const today = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Susun isi teks laporan
    let reportText = `====================================\n`;
    reportText += `   LAPORAN HARIAN HEALTH TRACKER    \n`;
    reportText += `====================================\n\n`;
    reportText += `Nama Pengguna : ${user}\n`;
    reportText += `Tanggal       : ${today}\n\n`;
    
    reportText += `[1] TIDUR\n`;
    reportText += `    Status   : ${sleep ? sleep.status : 'Belum ada data'}\n`;
    reportText += `    Durasi   : ${sleep ? Math.floor(sleep.durationMinutes/60) + ' Jam ' + (sleep.durationMinutes%60) + ' Menit' : '-'}\n\n`;

    reportText += `[2] OLAHRAGA\n`;
    reportText += `    Jenis    : ${sport ? sport.type : '-'}\n`;
    reportText += `    Jumlah   : ${sport ? sport.amount : '0'}\n\n`;

    reportText += `[3] PRODUKTIVITAS & GAME\n`;
    reportText += `    Belajar  : ${study ? study.topic + ' (' + study.minutes + ' mnt)' : '-'}\n`;
    reportText += `    Main Game: ${game ? game.hours + ' Jam' : '-'}\n\n`;

    reportText += `[4] KEUANGAN\n`;
    reportText += `    Tabungan : ${saving ? 'Rp' + saving.amount.toLocaleString() : 'Rp0'}\n\n`;

    reportText += `[5] KONSUMSI ROKOK\n`;
    reportText += `    Jumlah   : ${smoke ? smoke.amount + ' Batang' : '0'}\n`;
    reportText += `    Status   : ${smoke ? smoke.status : '-'}\n\n`;

    reportText += `====================================\n`;
    reportText += `Tetap konsisten dan jaga kesehatan!\n`;
    reportText += `Generated by DailyTracker Pro 2026\n`;

    // Proses download file
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_HealthTracker_${user}_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
