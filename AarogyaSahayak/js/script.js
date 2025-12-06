console.log("Aarogya Sahayak Loaded");

// ------------------------------
// LOAD DATASETS
// ------------------------------
let symptomsData = {};
let costData = {};
let centersData = {};
let firstAidData = {};

// Load all datasets
fetch("../datasets/symptoms.json").then(res => res.json()).then(d => symptomsData = d);
fetch("../datasets/costs.json").then(res => res.json()).then(d => costData = d);
fetch("../datasets/centers.json").then(res => res.json()).then(d => centersData = d);
fetch("../datasets/firstaid.json").then(res => res.json()).then(d => firstAidData = d);

// ------------------------------
// DIAGNOSIS FORM HANDLER
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("diagnosisForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let symptoms = document.getElementById("symptoms").value.toLowerCase();

      let result = "Possible Conditions:<br>";
      for (let key in symptomsData) {
        if (symptoms.includes(key)) {
          result += `<b>${key}</b>: ${symptomsData[key].conditions.join(", ")}<br>`;
        }
      }

      document.getElementById("resultText").innerHTML = result;
      document.getElementById("resultBox").classList.remove("d-none");

      saveHistory(symptoms, result);
    });
  }

  loadHistory();
  loadCosts();
  loadCenters();
  loadFirstAid();
});

// ------------------------------
// SAVE HISTORY
// ------------------------------
function saveHistory(symptoms, result) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.push({
    date: new Date().toLocaleString(),
    symptoms,
    result
  });

  localStorage.setItem("history", JSON.stringify(history));
}

// ------------------------------
// LOAD HISTORY
// ------------------------------
function loadHistory() {
  let table = document.getElementById("historyTable");
  if (!table) return;

  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.forEach(h => {
    table.innerHTML += `
      <tr>
        <td>${h.date}</td>
        <td>${h.symptoms}</td>
        <td>${h.result}</td>
      </tr>
    `;
  });
}

// ------------------------------
// LOAD COSTS
// ------------------------------
function loadCosts() {
  let tb = document.getElementById("costTable");
  if (!tb) return;

  for (let test in costData) {
    tb.innerHTML += `
      <tr>
        <td>${test}</td>
        <td>${costData[test].rural}</td>
        <td>${costData[test].urban}</td>
      </tr>
    `;
  }
}

// ------------------------------
// LOAD CENTERS
// ------------------------------
function loadCenters() {
  let area = document.getElementById("centerList");
  if (!area) return;

  centersData.forEach(c => {
    area.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 shadow-sm rounded-4">
          <h5 class="fw-bold">${c.name}</h5>
          <p class="text-muted">${c.type}</p>
          <p><b>Services:</b> ${c.services.join(", ")}</p>
        </div>
      </div>
    `;
  });
}

// ------------------------------
// LOAD FIRST AID
// ------------------------------
function loadFirstAid() {
  let area = document.getElementById("firstAidList");
  if (!area) return;

  for (let key in firstAidData) {
    area.innerHTML += `
      <div class="col-md-6">
        <div class="card p-3 shadow-sm rounded-4">
          <h5 class="fw-bold text-primary">${key.toUpperCase()}</h5>
          <p>${firstAidData[key]}</p>
        </div>
      </div>
    `;
  }
}

