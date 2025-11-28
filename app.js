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

document.addEventListener("DOMContentLoaded", () => {
  cargarTodos();
  cargarHistorial();

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
async function cargarHistorial() {
  const resp = await fetch("historial.json");
  const historial = await resp.json();

  const meses = Object.keys(historial);
  const equipos = Object.keys(historial[meses[0]]);

  // --- CREA DATASETS ---
  const datasets = equipos.map((equipo, i) => {
    const TEAM = equipo.toUpperCase();
    const color = teamColors[TEAM] || getColorForIndex(i);

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

  // --- CREA GRÁFICA ---
  const ctx = document.getElementById("chart-ranking").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: { labels: meses, datasets },

    options: {
      responsive: true,
      maintainAspectRatio: false, 
      plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",       // leyenda blanca
          font: { size: 12 },
        },
      },
      scales: {
        x: {
          ticks: { color: "#fff" },       // texto eje X blanco
          grid: { color: "#666" },        // líneas de la grilla gris oscuro
        },
        y: {
          ticks: { color: "#fff" },       // texto eje Y blanco
          grid: { color: "#666" },        // líneas de la grilla gris oscuro
        },
      },
      
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true, // circulitos de color
            pointStyleWidth: 12,
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12,
            },
            // mostramos el nombre del equipo
            generateLabels: (chart) => {
              return chart.data.datasets.map((ds, i) => ({
                text: ds.label,
                fillStyle: ds.borderColor,
                strokeStyle: ds.borderColor,
                lineWidth: ds.borderWidth,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              }));
            },
          },
        },
      },
    },
  }});
}

function getColorForIndex(i) {
  const paleta = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];
  return paleta[i % paleta.length];
}
