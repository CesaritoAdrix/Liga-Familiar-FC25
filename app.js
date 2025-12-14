
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPKtBEFLvSQBuVzR9nB0Nx0G55_Ap0XTk",
  authDomain: "liga-familiar-fc25.firebaseapp.com",
  projectId: "liga-familiar-fc25",
  storageBucket: "liga-familiar-fc25.firebasestorage.app",
  messagingSenderId: "871975941322",
  appId: "1:871975941322:web:1f48918810572b3974f033",
};

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Inicializar Messaging
const messaging = getMessaging(app);

async function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker no soportado");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  console.log("✅ Service Worker registrado");
  return registration;
}

// --- SOLICITAR PERMISO ---
const VAPID_KEY =
  "BEZOtufn8eAxW2lb9coj0dThyaclO01SzRU3sOHe1TuwMPCAT0yds14dQJFroGyQuXpfZqFQi3owa5RCsk2tWcU";

document
  .getElementById("btn-notificaciones")
  .addEventListener("click", async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Debes aceptar las notificaciones 🙏");
        return;
      }

      const registration = await registrarServiceWorker();

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("✅ TOKEN FCM:", token);
      alert("Notificaciones activadas ✅");

    } catch (err) {
      console.error("❌ Error al activar notificaciones", err);
    }
  });


const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen_K3YhSrxJHvTFntTcHTSr8m-nTS5KzgJyh7oAYSL2F0hfcRgYbQDD5PCcyrrg/pub?output=csv";

const columnas = [
  "equipo",
  "pj",
  "pg",
  "pe",
  "pp",
  "gf",
  "gc",
  "df",
  "ranking",
];

// Indices exactos en el CSV
const indicesCSV = {
  equipo: 0,
  pj: 1,
  pg: 2,
  pe: 3,
  pp: 4,
  gf: 10,
  gfpp: 11,
  gc: 12,
  gcpp: 13,
  df: 14,
  ranking: 21,
};

// Logos oficiales
const logos = {
  MADRID: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  BARCELONA:
    "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  BARCA:
    "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  LIVERPOOL: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  FRANCIA: "https://img.icons8.com/fluency/48/france-circular.png",
  INGLATERRA: "https://img.icons8.com/fluency/48/england-circular.png",
  PSG: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
};

// Colores asignados por equipo
const teamColors = {
  BARCELONA: "#ff0037ff",
  FRANCIA: "#0099ffb5",
  PSG: "#f20fdbff",
  LIVERPOOL: "#ffffffff",
  MADRID: "#9f10ffff",
  INGLATERRA: "#fbefa1ff",
};

let sortDirections = {};
let chartHistorial = null;
let modoHistorial = "ranking";

document.addEventListener("DOMContentLoaded", () => {
  cargarTodos();
  cargarHistorialSwitch();

  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const col = header.getAttribute("data-col");
      sortTable(col);
      resaltarColumna(col);
      sortDirections[col] = !sortDirections[col];
    });
  });
});

// -------- TABLA PRINCIPAL --------
async function cargarTodos() {
  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  let filas = csvText.split("\n").map((r) => r.split(","));
  filas = filas.slice(2, 8); // filas 3-8

  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  filas.forEach((fila) => {
    const tr = document.createElement("tr");
    const teamName = fila[0].trim().toUpperCase();
    const logoURL =
      logos[teamName] ||
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

    const tdLogo = document.createElement("td");
    tdLogo.innerHTML = `<img class="logo" src="${logoURL}">`;
    tr.appendChild(tdLogo);

    columnas.slice(1).forEach((col) => {
      const td = document.createElement("td");
      td.textContent = fila[indicesCSV[col]] || "";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  llenarTablasSecundarias(filas);
}

function sortTable(colName) {
  const table = document.getElementById("rankingTable");
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const colIndex = columnas.indexOf(colName);

  rows.sort((a, b) => {
    const A = parseFloat(a.cells[colIndex].innerText.replace("%", "")) || 0;
    const B = parseFloat(b.cells[colIndex].innerText.replace("%", "")) || 0;
    return sortDirections[colName] ? A - B : B - A;
  });

  rows.forEach((r) => tbody.appendChild(r));
}

function resaltarColumna(colName) {
  const colIndex = columnas.indexOf(colName);
  document
    .querySelectorAll("td, th")
    .forEach((c) => c.classList.remove("highlight"));
  document.querySelectorAll(`#rankingTable tr`).forEach((row) => {
    row.cells[colIndex].classList.add("highlight");
  });
}

// -------- TABLAS SECUNDARIAS --------
function llenarTablasSecundarias(filas) {
  const ofensivaOrdenada = [...filas].sort(
    (a, b) =>
      (parseFloat(b[indicesCSV.gfpp]) || 0) -
      (parseFloat(a[indicesCSV.gfpp]) || 0)
  );

  const defensivaOrdenada = [...filas].sort(
    (a, b) =>
      (parseFloat(a[indicesCSV.gcpp]) || 0) -
      (parseFloat(b[indicesCSV.gcpp]) || 0)
  );

  const contOf = document.getElementById("tabla-ofensiva");
  const contDef = document.getElementById("tabla-defensiva");

  contOf.innerHTML = "";
  contDef.innerHTML = "";

  ofensivaOrdenada.forEach((fila) => {
    const name = fila[0].trim().toUpperCase();
    const logo = logos[name];
    const gfpp = fila[indicesCSV.gfpp];

    contOf.innerHTML += `
      <tr>
        <td><img class="logo" src="${logo}"></td>
        <td>${gfpp}</td>
      </tr>`;
  });

  defensivaOrdenada.forEach((fila) => {
    const name = fila[0].trim().toUpperCase();
    const logo = logos[name];
    const gcpp = fila[indicesCSV.gcpp];

    contDef.innerHTML += `
      <tr>
        <td><img class="logo" src="${logo}"></td>
        <td>${gcpp}</td>
      </tr>`;
  });
}

// -------- GRÁFICA + LEYENDA --------
async function cargarHistorial(archivo = "historial.json", titulo = "RANKING") {
  const resp = await fetch(archivo);
  const historial = await resp.json();

  const meses = Object.keys(historial);
  const equipos = Object.keys(historial[meses[0]]);

  // Array de colores de respaldo si faltan equipos en teamColors
  const colorsArray = Object.values(teamColors);

  const datasets = equipos.map((equipo, i) => {
    const TEAM = equipo.toUpperCase();

    // 🔥 Nuevo: solo usamos teamColors o fallback con colorsArray
    const color = teamColors[TEAM] || colorsArray[i % colorsArray.length];

    return {
      label: equipo,
      data: meses.map((m) => historial[m][equipo] ?? null),
      borderColor: color,
      backgroundColor: color,
      borderWidth: 3,
      tension: 0.3,
      pointStyle: "circle",
      pointRadius: 5,
      pointHoverRadius: 7,
    };
  });

  const ctx = document.getElementById("chart-ranking").getContext("2d");

  // 🔥 Destruir gráfica anterior
  if (chartHistorial) {
    chartHistorial.destroy();
  }

  // 🔥 Crear nueva gráfica
  chartHistorial = new Chart(ctx, {
    type: "line",
    data: { labels: meses, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyleWidth: 12,
            boxWidth: 12,
            padding: 15,
            color: "#fff",
            font: { size: 12 },
          },
        },
        title: {
          display: true,
          text: titulo,
          color: "#fff",
          font: { size: 18, weight: "bold" },
          padding: { top: 10, bottom: 20 },
        },
      },
      scales: {
        x: {
          ticks: { color: "#fff" },
          grid: { color: "#666" },
        },
        y: {
          reverse: (titulo.includes("CONTRA")),
          ticks: { color: "#fff" },
          grid: { color: "#666" },
        },
      },
    },
  });
}

// --- ACTIVAR BOTÓN VISUALMENTE ---
function activarBoton(tab) {
  const botones = document.querySelectorAll(".historial-buttons button");

  botones.forEach((btn) => btn.classList.remove("active"));

  const seleccionado = document.querySelector(
    `.historial-buttons button[data-tab="${tab}"]`
  );
  if (seleccionado) seleccionado.classList.add("active");
}

// --- SWITCH PRINCIPAL ---
function cargarHistorialSwitch() {
  switch (modoHistorial) {
    case "ranking":
      cargarHistorial("historial.json", "RANKING");
      break;

    case "gfpp":
      cargarHistorial("historialgfpp.json", "GOLES A FAVOR POR PARTIDO");
      break;

    case "gcpp":
      cargarHistorial("historialgcpp.json", "GOLES EN CONTRA POR PARTIDO");
      break;
  }
}

// --- FUNCIÓN QUE CAMBIA EL HISTORIAL ---
function cambiarHistorial(tipo) {
  modoHistorial = tipo;
  activarBoton(tipo);
  cargarHistorialSwitch();
}

