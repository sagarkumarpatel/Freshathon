// Global variables
let model, webcam, labelContainer, maxPredictions;
let capturedImageData = null;
const modelURL = "./my_model/model.json";
const metadataURL = "./my_model/metadata.json";

// Disease information database
const diseaseDatabase = {
    "Pepper_bell_healthy": {
        description: "The pepper plant appears healthy with no signs of disease.",
        treatment: {
            general: "Continue regular care including proper watering and fertilization.",
            specialized: "Monitor for common pepper pests like aphids and spider mites."
        }
    },
    "Potato_healthy": {
        description: "The potato plant shows no signs of disease or stress.",
        treatment: {
            general: "Maintain proper soil moisture and rotation practices.",
            specialized: "Watch for Colorado potato beetles and other common pests."
        }
    },
    "Tomato_healthy": {
        description: "The tomato plant is in good health with no visible issues.",
        treatment: {
            general: "Continue with regular watering and support for vines.",
            specialized: "Preventative measures against common tomato diseases recommended."
        }
    },
    "Pepper__bell___Bacterial_spot": {
        description: "Bacterial spot causes small, water-soaked lesions on leaves that may turn brown.",
        treatment: {
            general: "Remove and destroy infected plants. Avoid overhead watering.",
            specialized: "Apply copper-based bactericides early in the season."
        }
    },
    "Potato___Early_blight": {
        description: "Early blight causes concentric rings on leaves, leading to yellowing and death.",
        treatment: {
            general: "Remove infected leaves and improve air circulation.",
            specialized: "Apply chlorothalonil or copper-based fungicides every 7-10 days."
        }
    },
    "Potato___Late_blight": {
        description: "Late blight causes water-soaked lesions that spread rapidly in wet conditions.",
        treatment: {
            general: "Destroy infected plants immediately to prevent spread.",
            specialized: "Apply fungicides containing mancozeb or chlorothalonil preventatively."
        }
    },
    "Tomato__Target_Spot": {
        description: "Target spot causes circular spots with concentric rings on leaves and fruit.",
        treatment: {
            general: "Improve air circulation and avoid wetting foliage.",
            specialized: "Apply fungicides containing chlorothalonil or mancozeb."
        }
    },
    "Tomato__Tomato_mosaic_virus": {
        description: "Virus causing mottled leaves, stunted growth, and malformed fruit.",
        treatment: {
            general: "Remove and destroy infected plants. Disinfect tools.",
            specialized: "Use virus-resistant varieties. Control aphid vectors."
        }
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        description: "Virus causing upward leaf curling, yellowing, and stunted growth.",
        treatment: {
            general: "Remove infected plants immediately to prevent spread.",
            specialized: "Control whitefly populations with insecticides or reflective mulches."
        }
    },
    "Tomato_Bacterial_spot": {
        description: "Small, dark lesions on leaves and fruit that may ooze bacteria in wet conditions.",
        treatment: {
            general: "Avoid overhead watering and space plants for good air circulation.",
            specialized: "Apply copper-based bactericides early in infection cycle."
        }
    },
    "Tomato_Early_blight": {
        description: "Dark concentric rings on lower leaves that progress upward through the plant.",
        treatment: {
            general: "Remove infected leaves and use mulch to prevent soil splash.",
            specialized: "Apply chlorothalonil or copper fungicides at first signs."
        }
    },
    "Tomato_Late_blight": {
        description: "Water-soaked lesions that rapidly expand, causing plant collapse in humid weather.",
        treatment: {
            general: "Destroy infected plants immediately. Avoid overhead watering.",
            specialized: "Apply fungicides containing mancozeb or chlorothalonil preventatively."
        }
    },
    "Tomato_Leaf_Mold": {
        description: "Yellow patches on upper leaf surfaces with fuzzy gray mold underneath.",
        treatment: {
            general: "Improve air circulation and reduce humidity in greenhouse settings.",
            specialized: "Apply fungicides containing chlorothalonil or copper compounds."
        }
    },
    "Tomato_Septoria_leaf_spot": {
        description: "Small circular spots with dark margins and light centers on lower leaves.",
        treatment: {
            general: "Remove infected leaves and avoid overhead watering.",
            specialized: "Apply copper-based fungicides or chlorothalonil every 7-10 days."
        }
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        description: "Tiny mites causing stippling on leaves, webbing, and eventual leaf drop.",
        treatment: {
            general: "Spray plants with strong water jets to dislodge mites.",
            specialized: "Apply miticides or insecticidal soaps, targeting leaf undersides."
        }
    }
};

// Initialize the model
async function loadModel() {
    try {
        const modelInfo = document.getElementById('model-status');
        modelInfo.textContent = "Loading model...";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = '';
        
        modelInfo.textContent = "Model loaded successfully!";
        document.getElementById('start-webcam').disabled = false;
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading model:", error);
        document.getElementById('model-status').textContent = "Error loading model";
    }
}

// Webcam functions
async function initWebcam() {
    try {
        if (!model) await loadModel();
        
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip);
        await webcam.setup();
        await webcam.play();
        
        document.getElementById("webcam-container").innerHTML = '';
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        
        document.getElementById("stop-webcam").style.display = 'inline-block';
        document.getElementById("start-webcam").disabled = true;
        document.getElementById("capture-btn").disabled = false;
        
        window.requestAnimationFrame(webcamLoop);
    } catch (error) {
        console.error("Error initializing webcam:", error);
        alert("Could not access the webcam. Please check permissions.");
    }
}

async function webcamLoop() {
    if (webcam) {
        webcam.update();
        await predictWebcam();
        window.requestAnimationFrame(webcamLoop);
    }
}

async function predictWebcam() {
    if (webcam && model) {
        const prediction = await model.predict(webcam.canvas);
        displayPredictions(prediction);
    }
}

function stopWebcam() {
    if (webcam) {
        webcam.stop();
        document.getElementById("webcam-container").innerHTML = '<p>Camera stopped</p>';
        document.getElementById("stop-webcam").style.display = 'none';
        document.getElementById("start-webcam").disabled = false;
        document.getElementById("capture-btn").disabled = true;
        document.getElementById("captured-container").style.display = 'none';
        webcam = null;
    }
}

// Image capture function
function captureImage() {
    if (!webcam) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = webcam.canvas.width;
    canvas.height = webcam.canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcam.canvas, 0, 0);
    
    capturedImageData = canvas.toDataURL('image/png');
    
    const capturedImg = document.getElementById('captured-image');
    capturedImg.src = capturedImageData;
    
    document.getElementById('captured-container').style.display = 'flex';
    document.getElementById('predict-upload').disabled = false;
    
    // Stop the webcam after capture
    stopWebcam();
}

// Image upload functions
document.getElementById('image-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.getElementById('uploaded-image');
            img.src = event.target.result;
            img.style.display = 'block';
            document.getElementById('upload-placeholder').style.display = 'none';
            document.getElementById('predict-upload').disabled = false;
            capturedImageData = null; // Reset captured image if exists
        };
        reader.readAsDataURL(file);
    }
});

async function predictUpload() {
    let image;
    if (capturedImageData) {
        image = document.getElementById('captured-image');
    } else {
        image = document.getElementById('uploaded-image');
    }
    
    if (image && model) {
        const prediction = await model.predict(image);
        displayPredictions(prediction);
    }
}

// Display predictions (only >75% confidence)
function displayPredictions(predictions) {
    labelContainer.innerHTML = '';
    
    // Filter predictions with >75% confidence
    const highConfidencePredictions = Array.from(predictions)
        .filter(pred => pred.probability > 0.75)
        .sort((a, b) => b.probability - a.probability);
    
    if (highConfidencePredictions.length === 0) {
        labelContainer.innerHTML = '<div class="prediction-item">No diseases detected with high confidence (75%+). Plant may be healthy.</div>';
        displayDiseaseInfo("healthy");
        return;
    }
    
    // Display high confidence predictions
    highConfidencePredictions.forEach(pred => {
        const confidencePercent = Math.round(pred.probability * 100);
        
        const predItem = document.createElement('div');
        predItem.className = 'prediction-item';
        predItem.innerHTML = `
            <div class="prediction-header">
                <strong>${formatLabel(pred.className)}</strong>
                <span class="confidence-value">${confidencePercent}%</span>
            </div>
            <div class="confidence-bar">
                <div class="confidence-level" style="width: ${confidencePercent}%"></div>
            </div>
        `;
        labelContainer.appendChild(predItem);
    });
    
    // Display disease info for top prediction
    displayDiseaseInfo(highConfidencePredictions[0].className);
}

// Format label for display
function formatLabel(label) {
    return label.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Display disease information
function displayDiseaseInfo(diseaseKey) {
    const diseaseInfo = document.getElementById('disease-info');
    const disease = diseaseDatabase[diseaseKey] || diseaseDatabase['healthy'];
    
    diseaseInfo.innerHTML = `
        <h3>About ${formatLabel(diseaseKey)}</h3>
        <p><strong>Description:</strong> ${disease.description}</p>
        <div class="treatment-section">
            <p><strong>General Treatment:</strong> ${disease.treatment.general}</p>
            <p><strong>Specialized Treatment:</strong> ${disease.treatment.specialized}</p>
        </div>
    `;
}

// Initialize the model when the page loads
window.onload = function() {
    loadModel();
};