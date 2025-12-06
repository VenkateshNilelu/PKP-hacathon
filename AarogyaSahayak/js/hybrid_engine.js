// =======================================================
// HYBRID DIAGNOSIS ENGINE (Rule-Based + ML Prediction)
// =======================================================

import { loadRuleEngineData, extractSymptomsFromText, calculateRuleDiagnosis } from "./rule_engine.js";
import { loadMLModel, mlPredict } from "./ml_engine.js";

// Load all datasets + ML model together
async function loadHybridResources() {
    const ruleData = await loadRuleEngineData();
    const mlModel = await loadMLModel();
    return { ruleData, mlModel };
}

/*
    INPUT:
        - freeText: symptoms typed by user
        - selectedSymptoms: array of checked symptoms
        - allSymptoms: list of all symptom names

    OUTPUT:
        - Final hybrid diagnosis object
*/
async function runHybridDiagnosis(freeText, selectedSymptoms, allSymptoms) {
    const { ruleData, mlModel } = await loadHybridResources();

    // ---------------------------------------------
    // 1. Extract symptoms from TEXT
    // ---------------------------------------------
    const textSymptoms = extractSymptomsFromText(freeText, allSymptoms);

    // ---------------------------------------------
    // 2. Merge text + checklist symptoms
    // ---------------------------------------------
    let userSymptoms = Array.from(new Set([...textSymptoms, ...selectedSymptoms]));

    if (userSymptoms.length === 0) {
        return { error: "No symptoms detected." };
    }

    // ---------------------------------------------
    // 3. RULE ENGINE PREDICTION
    // ---------------------------------------------
    const ruleResult = calculateRuleDiagnosis(userSymptoms, ruleData);

    let topRuleDisease = ruleResult.rankedDiseases[0]?.disease || null;
    let ruleConfidence = ruleResult.rankedDiseases[0]?.confidence || 0.0;

    // ---------------------------------------------
    // 4. ML ENGINE PREDICTION
    // ---------------------------------------------
    // Create vector for ML model (0/1 for each symptom)
    let vector = allSymptoms.map(sym => userSymptoms.includes(sym) ? 1 : 0);

    const mlResult = mlPredict(vector, mlModel);

    let mlDisease = mlResult.disease;
    let mlConfidence = mlResult.confidence;

    // ---------------------------------------------
    // 5. HYBRID PREDICTION
    // ---------------------------------------------
    const finalScore = (ruleConfidence * 0.6) + (mlConfidence * 0.4);

    // Select final disease = the one predicted by rule engine
    const finalDisease = topRuleDisease || mlDisease;

    // ---------------------------------------------
    // 6. Pull disease info (summary + description + precautions)
    // ---------------------------------------------
    const info = ruleData.diseaseInfo[finalDisease] || {
        summary: "No description available.",
        description: "No detailed description available.",
        precautions: []
    };

    // ---------------------------------------------
    // 7. Determine FINAL SEVERITY
    // ---------------------------------------------
    let highestSeverity = ruleResult.highestSeverity;

    const severityLevel = {
        1: "mild",
        2: "moderate",
        3: "concerning",
        4: "serious",
        5: "emergency"
    }[highestSeverity] || "unknown";

    let emergencyFlag = highestSeverity >= 4;

    // ---------------------------------------------
    // 8. BUILD FINAL DIAGNOSIS OBJECT
    // ---------------------------------------------
    return {
        finalDisease,
        finalScore: Number(finalScore.toFixed(2)),
        finalSeverity: severityLevel,
        emergency: emergencyFlag,

        summary: info.summary,
        description: info.description,
        precautions: info.precautions,

        matchedSymptoms: userSymptoms,
        ruleConfidence: Number(ruleConfidence.toFixed(2)),
        mlConfidence: Number(mlConfidence.toFixed(2))
    };
}

export { runHybridDiagnosis };
