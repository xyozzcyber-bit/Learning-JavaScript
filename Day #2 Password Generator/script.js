// DOM
const btnHistory = document.getElementById("history_btn");
const selectSusah = document.getElementById("kesusahan");
const slinder_text = document.getElementById("angka_slinder");
const angkaKarakter = document.getElementById("angka_karakter");
const generate_btn = document.getElementById("btn_gene");
const hAsil = document.getElementsByClassName("hasil")[0];
const oUtput = document.getElementById("output");
const sImpan = document.getElementById("simpan");
const sAlin = document.getElementById("salin");
const cArd2 = document.getElementsByClassName("card2")[0];
const back = document.getElementById("kembali");
const lIst = document.getElementById("list");

// state
var nilaiYangDipilih = selectSusah.value || "";
const STORAGE_KEY = "saved_passwords_v1";

// UI: open/close history
btnHistory.addEventListener("click", function() {
    cArd2.style.display = "block";
    console.log("Dibuka");
});
back.addEventListener("click", function() {
    cArd2.style.display = "none";
    console.log("Ditutup");
});

// slider ui
angkaKarakter.addEventListener("input", function() {
    const valueText = angkaKarakter.value;
    slinder_text.textContent = valueText;
});

// select difficulty
selectSusah.addEventListener("change", function() {
    nilaiYangDipilih = this.value;
    console.log("Nilai baru yang dipilih: " + nilaiYangDipilih);
});

// random helper
function randomFrom(chars, length) {
    let result = "";
    const n = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * n));
    }
    return result;
}
function easyGenerate(length) {
    const characters = "abc0123+-/*";
    return randomFrom(characters, length);
}
function mediumGenerate(length) {
    const characters = "abcdefghijklmnopqrstuvwxyz12345@#+-/*";
    return randomFrom(characters, length);
}
function hardGenerate(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    return randomFrom(characters, length);
}

// generate
generate_btn.addEventListener("click", function() {
    const angkaBeberapaKali = Number(angkaKarakter.value);
    let result = "";
    if (nilaiYangDipilih === "mudah") {
        result = easyGenerate(angkaBeberapaKali);
    } else if (nilaiYangDipilih === "sedang") {
        result = mediumGenerate(angkaBeberapaKali);
    } else if (nilaiYangDipilih === "susah") {
        result = hardGenerate(angkaBeberapaKali);
    } else {
        hAsil.style.display = "block";
        hAsil.style.backgroundColor = "#ffcbcb";
        oUtput.textContent = "Pls select the difficulty level";
        return;
    }

    hAsil.style.display = "block";
    hAsil.style.backgroundColor = "transparent";
    oUtput.textContent = result;
    console.log(result);
});

// copy output
sAlin.addEventListener("click", function() {
    const outputText = oUtput.textContent;
    if (outputText === "Pls select the difficulty level" || !outputText) {
        sAlin.textContent = "x";
        setTimeout(function() {
            sAlin.textContent = "Copy";
        }, 1300);
        return;
    }

    navigator.clipboard.writeText(outputText).then(function() {
        sAlin.textContent = "Copied";
        setTimeout(function() {
            sAlin.textContent = "Copy";
        }, 1300);
    }).catch(function(err) {
        console.error("Clipboard error:", err);
        sAlin.textContent = "Err";
        setTimeout(function() {
            sAlin.textContent = "Copy";
        }, 1300);
    });
});

// storage helpers
function loadSavedArray() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        console.error("Parse saved list error:", e);
        return [];
    }
}
function saveArrayToStorage(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// list item tools
function createListItemObj(text) {
    return {
        id: Date.now().toString() + "-" + Math.floor(Math.random() * 1000),
        text: text,
        createdAt: new Date().toISOString()
    };
}
function renderListItem(item) {
    const li = document.createElement("li");
    li.className = "isi";
    li.dataset.id = item.id;

    const span = document.createElement("span");
    span.className = "password-text";
    span.textContent = item.text;
    li.appendChild(span);

    const btnCopy = document.createElement("button");
    btnCopy.className = "btn-copy";
    btnCopy.type = "button";
    btnCopy.title = "Copy";
    btnCopy.innerHTML = "<i class='bx bx-copy'></i>";
    li.appendChild(btnCopy);

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.type = "button";
    btnDelete.title = "Hapus";
    btnDelete.innerHTML = "<i class='bx bx-trash'></i>";
    li.appendChild(btnDelete);

    return li;
}

// add item to storage + UI
function addSavedItem(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;

    const arr = loadSavedArray();
    const obj = createListItemObj(trimmed);
    arr.push(obj);
    saveArrayToStorage(arr);

    const li = renderListItem(obj);
    lIst.appendChild(li);
}

// load all saved to DOM
function loadSavedListToDOM() {
    lIst.innerHTML = "";
    const arr = loadSavedArray();
    for (let item of arr) {
        const li = renderListItem(item);
        lIst.appendChild(li);
    }
}

// event delegation for copy and delete (trash)
lIst.addEventListener("click", function(e) {
    const target = e.target;
    const btn = target.closest("button");
    if (!btn) return;

    const li = btn.closest("li");
    if (!li) return;

    const id = li.dataset.id;
    // copy action
    if (btn.classList.contains("btn-copy")) {
        const text = li.querySelector(".password-text").textContent;
        navigator.clipboard.writeText(text).then(function() {
            btn.textContent = "Copied";
            setTimeout(function() {
                btn.innerHTML = "<i class='bx bx-copy'></i>";
            }, 900);
        }).catch(function(err) {
            console.error("Clipboard error:", err);
        });
        return;
    }

    // delete action = remove from localStorage and UI
    if (btn.classList.contains("btn-delete")) {
        let arr = loadSavedArray();
        arr = arr.filter(function(it) {
            return it.id !== id;
        });
        saveArrayToStorage(arr);
        li.remove();
        return;
    }
});

// simpan tombol
sImpan.addEventListener("click", function() {
    const outputText2 = oUtput.textContent;
    if (outputText2 === "Pls select the difficulty level" || !outputText2) {
        sImpan.textContent = "x";
        setTimeout(function() {
            sImpan.textContent = "Save";
        }, 1300);
        console.log("Pls select the difficulty level");
        return;
    }

    addSavedItem(outputText2);
    sImpan.textContent = "Saved";
    setTimeout(function() {
        sImpan.textContent = "Save";
    }, 900);
});

// init
document.addEventListener("DOMContentLoaded", function() {
    // pastikan pilihan awal sync dengan select
    nilaiYangDipilih = selectSusah.value || "";
    loadSavedListToDOM();
});