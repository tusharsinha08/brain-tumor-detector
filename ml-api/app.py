from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import os
import base64
import tensorflow as tf
from tensorflow.keras.models import load_model

app = Flask(__name__)
# CORS(app)
CORS(app, supports_credentials=True)

class_labels = ['Glioma Tumor', 'No tumor', 'Meningioma Tumor', 'Pituitary Tumor']

#  Get absolute path (IMPORTANT FIX)
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_DIR = os.path.join(BASE_DIR, "../models")

# # Load only one model 
DEFAULT_MODEL = "efficientnetb0_model_1.h5"

# model_path = os.path.join(MODEL_DIR, DEFAULT_MODEL)
model = None;
try:
    model = load_model('efficientnetb0_model_1.h5', compile=False)
    # model = load_model(model_path, compile=False)
    print(f"Loaded model: {DEFAULT_MODEL}")
except Exception as e:
    print(f"❌ Failed to load model: {e}")


# MODEL_MAP = {
#     "efficientnet": "efficientnetb0_model.keras",
#     "resnet": "final_resnet50_model.keras",
#     "xception": "xception_model.keras",
#     "inception": "inceptionV3_model.keras",
#     "densenet": "densenet121_model.keras",
#     "vgg": "vgg16_model.keras",
#     "effnet_densenet": "final_effi_dense_model.keras",
#     "effnet_resnet": "hybrid_effi_resn_model.keras",
#     "baseline": "final_baseline_cnn_model.keras",
# }

# Load models safely
# models = {}

# print("\n🔄 Loading models...")
# for name, filename in MODEL_MAP.items():
#     path = os.path.join(MODEL_DIR, filename)
#     try:
#         models[name] = load_model(path)
#         print(f"✅ Loaded: {name}")
#     except Exception as e:
#         print(f"❌ Failed to load {name}: {e}")

print("🚀 Model loading complete\n")

def get_last_conv_layer(model):
    """
    Automatically find the last Conv2D layer
    """

    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name

    return None

def generate_gradcam(model, img_array, original_img):

    last_conv_layer_name = get_last_conv_layer(model)

    if last_conv_layer_name is None:
        return None

    # FIX input structure warning
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer(last_conv_layer_name).output,
            model.output
        ]
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(img_array, training=False)

        pred_index = tf.argmax(predictions[0])

        class_channel = predictions[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    # Convert tensor → numpy
    conv_outputs = conv_outputs.numpy()
    pooled_grads = pooled_grads.numpy()

    # Weight feature maps
    for i in range(pooled_grads.shape[-1]):
        conv_outputs[:, :, i] *= pooled_grads[i]

    # Create heatmap
    heatmap = np.mean(conv_outputs, axis=-1)

    # ReLU
    heatmap = np.maximum(heatmap, 0)

    # Normalize
    if np.max(heatmap) != 0:
        heatmap /= np.max(heatmap)

    # Resize heatmap
    heatmap = cv2.resize(
        heatmap,
        (original_img.shape[1], original_img.shape[0])
    )

    heatmap = np.uint8(255 * heatmap)

    # Apply colormap
    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    # Overlay heatmap on original image
    superimposed_img = cv2.addWeighted(
        original_img,
        0.6,
        heatmap,
        0.4,
        0
    )

    # Encode image
    _, buffer = cv2.imencode('.jpg', superimposed_img)

    gradcam_base64 = base64.b64encode(buffer).decode('utf-8')

    return gradcam_base64

@app.route('/')
def home():
    return {
        "status": "running", 
        "message": "Brain Tumor Detection API",
        "model": DEFAULT_MODEL,
        # "available_models": list(models.keys()),
        # "models_loaded": len([m for m in models if models[m] is not None])
    }

# def get_model(model_name):
#     """Load model only when needed"""
#     if model_name not in models:
#         model_path = os.path.join(MODEL_DIR, MODEL_MAP[model_name])
#         models[model_name] = load_model(model_path)
#     return models[model_name]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("\n📨 Request received", flush=True)

        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        model_name = request.form.get("model", "efficientnet")
        
        # print(f"📥 Model requested: {model_name}", flush=True)
        

        # # ✅ Validate model
        # if model_name not in models:
        #     return jsonify({"error": f"Invalid model: {model_name}"}), 400

        # model = get_model(model_name)

        # print(f"📁 File: {file.filename}", flush=True)
        # print(f"🤖 Model: {model_name}", flush=True)

        # Read image
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        original_img = img.copy()

        # Preprocess
        img = cv2.resize(img, (150, 150))
        img_array = np.expand_dims(img, axis=0)

        # Predict
        predictions = model.predict(img_array, verbose=0)

        idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][idx])

        if (class_labels[idx] == "No tumor") :
            gradcam_image = None
        else:
            gradcam_image = generate_gradcam(
                model,
                img_array,
                original_img
            )

        result = {
            "model": model_name,
            "class": class_labels[idx],
            "confidence": confidence,
            "gradcam": gradcam_image,
            "all_probabilities": {
                class_labels[i]: float(predictions[0][i])
                for i in range(len(class_labels))
            }
        }

        # print(f"✅ {model_name} → {result['class']} ({confidence*100:.2f}%)")

        return jsonify(result)

    except Exception as e:
        import traceback
        print(f"❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Flask Server Running")
    print("📍 http://localhost:10000")
    print("="*50 + "\n")

    app.run(host='0.0.0.0', port=10000, debug=True, use_reloader=False)