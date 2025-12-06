// ===============================
// RULE-BASED DIAGNOSIS ENGINE
// ===============================

async function loadRuleEngineData() {
    const symptomsMap = await fetch("/data/symptoms_map.json").then(r => r.json());
    const severityMap = await fetch("/data/severity.json").then(r => r.json());
    const diseaseInfo = await fetch("/data/disease_info.json").then(r => r.json());
    const diseasesSymptoms = await fetch("/data/diseases_symptoms.json").then(r => r.json());

    return { symptomsMap, severityMap, diseaseInfo, diseasesSymptoms };
}

// Extract symptoms from free text
function extractSymptomsFromText(text, allSymptoms) {
    text = text.toLowerCase();
    return allSymptoms.filter(sym => text.includes(sym.replace("_", " ")));
}

function calculateRuleDiagnosis(userSymptoms, datasets) {
    const { symptomsMap, severityMap, diseaseInfo, diseasesSymptoms } = datasets;

    let diseaseScore = {};
    let maxSeverity = 0;

    // Score each disease
    userSymptoms.forEach(sym => {
        const severity = severityMap[sym]?.raw || 1;
        if (severity > maxSeverity) maxSeverity = severity;

        const relatedDiseases = symptomsMap[sym] || [];
        relatedDiseases.forEach(dis => {
            diseaseScore[dis] = (diseaseScore[dis] || 0) + severity;
        });
    });

    // Convert scores to sorted disease list
    const rankedDiseases = Object.entries(diseaseScore)
        .sort((a, b) => b[1] - a[1])
        .map(([disease, score]) => ({ disease, score }));

    // Normalize rule-based confidence (0–1)
    const maxScore = rankedDiseases[0]?.score || 1;
    rankedDiseases.forEach(item => {
        item.confidence = item.score / maxScore;
    });

    return {
        rankedDiseases,
        highestSeverity: maxSeverity,
        diseaseInfo
    };
}

export { loadRuleEngineData, extractSymptomsFromText, calculateRuleDiagnosis };
