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

// Indices exactos en el CSV (A=0)
const indicesCSV = {
  equipo: 0,
  pj: 1,
  pg: 2,
  pe: 3,
  pp: 4,
  gf: 10,

  gc: 12,

  df: 14,
  ranking: 21,
};

// Iconos de logos
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

let sortDirections = {};

document.addEventListener("DOMContentLoaded", () => {
  cargarTodos();

  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const col = header.getAttribute("data-col");
      sortTable(col);
      resaltarColumna(col);
      sortDirections[col] = !sortDirections[col];
    });
  });
});

async function cargarTodos() {
  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  let filas = csvText.split("\n").map((r) => r.split(","));
  filas = filas.slice(2, 8); // filas 3-8 (equipos)

  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  filas.forEach((fila) => {
    const tr = document.createElement("tr");
    const teamName = fila[0].trim().toUpperCase();
    const logoURL =
      logos[teamName] ||
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

    // Columna del logo
    const tdLogo = document.createElement("td");
    tdLogo.innerHTML = `<img class="logo" src="${logoURL}">`;
    tr.appendChild(tdLogo);

    // Columnas exactas que queremos mostrar
    columnas.slice(1).forEach((col) => {
      const td = document.createElement("td");
      td.textContent = fila[indicesCSV[col]] || "";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
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

  rows.forEach((row) => tbody.appendChild(row));
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

