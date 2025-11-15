// DOM
const promptEl = document.getElementById("prompt");
const tombolKirim = document.getElementById("kirim");
const cAtatanEls = document.getElementsByClassName("catatan");
const cAtatan = cAtatanEls[0]; // pakai elemen pertama
const respon = document.getElementById("respon");
const copy = document.getElementById("salin");

// API KEY
const GOOGLE_API_KEY = "YOUR_API_KEY";
const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

// Main (terima prompt sebagai parameter)
async function main(promptAsli) {
  try {
    const response = await fetch(API_REQUEST_URL + `?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: promptAsli }]
          }
        ]
      })
    });

    if (!response.ok) {
      // kembalikan pesan error HTTP
      return `HTTP Error: ${response.status} ${response.statusText}`;
    }

    const data = await response.json();

    // cek struktur sebelum akses
    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      typeof data.candidates[0].content.parts[0].text === "string"
    ) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Response format tidak terduga.";
    }
  } catch (err) {
    return `Fetch error: ${err.message}`;
  }
}

// Event listener async
tombolKirim.addEventListener("click", async function () {
  // ambil value saat klik
  const promptTeks = promptEl.value.trim();

  if (promptTeks === "") {
    if (cAtatan) cAtatan.style.display = "block";
    return;
  } else {
    if (cAtatan) cAtatan.style.display = "none";
  }

  // bentuk prompt asli dengan template literal yang valid
  const promptAsli = `Hai, kamu adalah seorang ahli penyempurnaan prompt!
Jadi aku akan berikan prompt nanti tapi kamu ikutin aturan ini!
Aturan:
1. Sempurnakan dan jelaskan kata demi kata dan tambahkan beberapa kata supaya lebih jelas dan lebih baik, tapi jika ada mau buat sesuatu kayak gambar atau web, nanti warnanya harus dijelaskan
2. Menggunakan bahasa inggris! Jangan menggunakan bahasa lain!
3. Output tidak boleh ada Kalimat pembukaan dan kalimat penutup, karena ini akan di copy paste!
Berikut adalah teksnya: "${promptTeks}".
Sekian terimakasih!`;

  // panggil API dan tampilkan hasil
  respon.textContent = "Memproses...";
  const output = await main(promptAsli);
  respon.innerHTML = marked.parse(output);
});

// Function wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function copyaPopup() {
  const elemenPopup = document.createElement("div");
  elemenPopup.textContent = "Berhasil disalin!";
  // styling cepat supaya terlihat dan center
  elemenPopup.style.position = "fixed";
  elemenPopup.style.top = "50%";
  elemenPopup.style.left = "50%";
  elemenPopup.style.transform = "translate(-50%, -50%)";
  elemenPopup.style.padding = "10px 14px";
  elemenPopup.style.borderRadius = "8px";
  elemenPopup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  elemenPopup.style.background = "white";
  elemenPopup.style.zIndex = "9999";
  // tambahkan ke body supaya muncul
  document.body.appendChild(elemenPopup);

  // tunggu lalu hapus
  await wait(1500);
  // bisa pakai fade out jika mau, tapi simpel remove
  elemenPopup.remove();
}

copy.addEventListener("click", async function () {
  try {
    const responText = respon.textContent || respon.innerText || "";
    // pastikan context secure (https). tunggu clipboard selesai lalu panggil popup
    await navigator.clipboard.writeText(responText);
    await copyaPopup();
  } catch (error) {
    console.log("Clipboard error:", error);
  }
});
