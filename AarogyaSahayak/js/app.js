// ======================================================
// APP.JS — FRONTEND CONTROLLER FOR AAROGYA SAHAYAK
// ======================================================

import { runHybridDiagnosis } from "./hybrid_engine.js";
import { loadRuleEngineData } from "./rule_engine.js";

let allSymptoms = [];

// --------------------------------------------
// 1. LOAD ALL SYMPTOMS FROM DATASET
// --------------------------------------------
async function loadAllSymptoms() {
    const ruleData = await loadRuleEngineData();
    allSymptoms = Object.keys(ruleData.symptomsMap);
    generateSymptomChecklist(allSymptoms); // AUTO-GENERATE CHECKLIST
}

// --------------------------------------------
// 2. HANDLE DIAGNOSIS FORM SUBMISSION
// --------------------------------------------
async function handleDiagnosisSubmit(event) {
    event.preventDefault();

    const freeText = document.getElementById("symptomText").value.trim();
    const selectedSymptoms = Array.from(
        document.querySelectorAll(".symptom-checkbox:checked")
    ).map(cb => cb.value);

    const result = await runHybridDiagnosis(freeText, selectedSymptoms, allSymptoms);

    if (result.error) {
        alert(result.error);
        return;
    }

    displayResult(result);
    saveToHistory(result);
}

// --------------------------------------------
// 3. DISPLAY RESULT ON UI
// --------------------------------------------
function displayResult(result) {
    const box = document.getElementById("resultBox");
    const diseaseEl = document.getElementById("finalDisease");
    const severityEl = document.getElementById("severityBadge");
    const confidenceEl = document.getElementById("confidenceValue");
    const summaryEl = document.getElementById("summaryText");
    const descEl = document.getElementById("fullDescription");
    const precautionsEl = document.getElementById("precautionsList");

    // Disease
    diseaseEl.innerText = result.finalDisease;

    // Severity Badge
    severityEl.innerText = result.finalSeverity.toUpperCase();
    severityEl.className = "badge px-3 py-2 text-white";

    const severityColors = {
        mild: "bg-success",
        moderate: "bg-primary",
        concerning: "bg-warning text-dark",
        serious: "bg-orange",
        emergency: "bg-danger"
    };
    severityEl.classList.add(severityColors[result.finalSeverity] || "bg-secondary");

    // Confidence
    confidenceEl.innerText = (result.finalScore * 100).toFixed(1) + "%";

    // Summary + Description
    summaryEl.innerText = result.summary;
    descEl.innerText = result.description;

    // Precautions List
    precautionsEl.innerHTML = "";
    result.precautions.forEach(p => {
        let li = document.createElement("li");
        li.innerText = p;
        precautionsEl.appendChild(li);
    });

    // Show result box
    box.classList.remove("d-none");

    // Emergency alert
    if (result.emergency) {
        document.getElementById("emergencyAlert").classList.remove("d-none");
    } else {
        document.getElementById("emergencyAlert").classList.add("d-none");
    }
}

// --------------------------------------------
// 4. SAVE TO HISTORY (LOCAL STORAGE)
// --------------------------------------------
function saveToHistory(result) {
    let history = JSON.parse(localStorage.getItem("asa_history") || "[]");

    history.push({
        disease: result.finalDisease,
        score: result.finalScore,
        severity: result.finalSeverity,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("asa_history", JSON.stringify(history));
}

// --------------------------------------------
// 5. LOAD HISTORY FOR HISTORY PAGE
// --------------------------------------------
function loadHistoryPage() {
    if (!document.getElementById("historyTable")) return;

    let history = JSON.parse(localStorage.getItem("asa_history") || "[]");

    const table = document.getElementById("historyTable");
    table.innerHTML = "";

    history.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.disease}</td>
            <td>${(row.score * 100).toFixed(1)}%</td>
            <td>${row.severity.toUpperCase()}</td>
        `;
        table.appendChild(tr);
    });
}

// --------------------------------------------
// 6. AUTO-GENERATE SYMPTOM CHECKLIST
// --------------------------------------------
function generateSymptomChecklist(allSymptoms) {
    const container = document.getElementById("symptomChecklist");
    if (!container) return;

    container.innerHTML = "";

    allSymptoms.forEach(sym => {
        let div = document.createElement("div");
        div.className = "col-6";

        div.innerHTML = `
            <label>
                <input type="checkbox" class="symptom-checkbox" value="${sym}">
                ${sym.replaceAll("_", " ")}
            </label>
        `;

        container.appendChild(div);
    });
}

// --------------------------------------------
// 7. INIT APP WHEN PAGE LOADS
// --------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadAllSymptoms();

    const diagnosisForm = document.getElementById("diagnosisForm");
    if (diagnosisForm) {
        diagnosisForm.addEventListener("submit", handleDiagnosisSubmit);
    }

    loadHistoryPage();
});
