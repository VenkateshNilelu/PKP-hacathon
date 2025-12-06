// =============================================
// ML ENGINE - Decision Tree Inference (Browser)
// =============================================

// Load the trained ML model JSON
async function loadMLModel() {
    const model = await fetch("/data/ml_model.json").then(r => r.json());
    return model;
}

// Recursively walk the decision tree
function traverseTree(node, vector) {
    // Leaf node -> return prediction index
    if (node.leaf) {
        return node.prediction_index;
    }

    // Check symptom feature value
    const featureValue = vector[node.feature];

    if (featureValue <= node.threshold) {
        return traverseTree(node.left, vector);
    } else {
        return traverseTree(node.right, vector);
    }
}

/*
    vector = array of 0/1 representing symptoms
    model = loaded ml_model.json
*/
function mlPredict(vector, model) {
    const tree = model.tree;
    const predIndex = traverseTree(tree, vector);

    const predictedDisease = model.classes[predIndex];

    // ML confidence = very rough approximation for hackathon
    // (Better weighting happens in hybrid engine)
    let mlConfidence = 0.75; // Default confidence
    // You can customize based on tree depth or rule alignment later.

    return {
        disease: predictedDisease,
        confidence: mlConfidence
    };
}

export { loadMLModel, mlPredict };
