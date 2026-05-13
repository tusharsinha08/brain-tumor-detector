import { useState } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 second timeout

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [model, setModel] = useState("efficientnet");
  const [gradcam, setGradcam] = useState("");
  const upload_img = '../src/assets/image/upload_img.png';


  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setGradcam("");
      setPreview(URL.createObjectURL(selected));
      setError("");
      setResult("");
    } else {
      alert("Please select an image file");
    }
  };

  const upload = async () => {
    // const currentModel = model;
    const currentModel = "efficientnet";

    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", currentModel);

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await axios.post("http://localhost:5002/predict", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });


      if (res.data.class && res.data.confidence !== undefined) {
        setGradcam(res.data.gradcam);
        const className = res.data.class;
        const confidence = (res.data.confidence * 100).toFixed(2);

        setResult({
          class: className,
          confidence: confidence
        });
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response) {
        setError(`Server error: ${err.response.data.error || err.response.statusText}`);
      } else if (err.request) {
        setError("No response from server. Make sure both servers are running.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-white">
          🧠 Brain Tumor Detector
        </h1>

        {/* Preview */}
        {
          gradcam ?
            <img
              src={`data:image/jpeg;base64,${gradcam}`}
              alt="Grad-CAM"
              className="w-72 h-72 object-cover mx-auto rounded-t-lg border border-gray-600"
            /> :
          preview ?
            <img
              src={preview}
              alt="preview"
              className="w-72 h-72 object-cover mx-auto rounded-t-lg border border-gray-600"
            />
            : (
              <img
                src={upload_img}
                alt="upload mri"
                className="w-72 h-72 object-cover mx-auto rounded-t-lg  border border-gray-600"
              />
            )
        }

        {/* Result */}
        {result.class && result.confidence ?
          <div className="mb-4 p-2 mx-auto w-72 bg-green-700 rounded-b-lg">
            <p className="text-lg font-semibold text-white">{result.class} </p>
            <p className="text-sm text-gray-300">(Confidence: {result.confidence}%)</p>
          </div>
          :
          <div className="mb-4 p-2 mx-auto w-72 bg-gray-700 rounded-b-lg">
            <p className="text-lg font-semibold text-gray-300 cursor-not-allowed">
              {loading ? "Detecting..." : "Result"}
            </p>
          </div>
        }

        {/* Error */}
        {error && (

          <p className="text-lg font-semibold text-red-500">{error}</p>

        )}

        <div className="flex flex-col items-center gap-1">
          {/* Upload */}
          <input
            type="file"
            onChange={handleFile}
            accept="image/*"
            className="mb-4 text-sm text-white border border-gray-500 rounded-sm p-2 w-72 cursor-pointer"
          />

          {/* <select
            value={model}
            // onChange={(e) => setModel(e.target.value)}
            onChange={(e) => {
              const selectedModel = e.target.value;
              setModel(selectedModel);
            }}
            className="w-72 mb-4 text-sm text-white 
             border border-gray-500 rounded-sm p-2 
             bg-gray-800 truncate"
          >
            <option value="efficientnet">EfficientNet - Accuracy: 94%</option>
            <option value="xception">Xception - Accuracy: 95%</option>
            <option value="inception">Inception - Accuracy: 94%</option>
            <option value="densenet">DenseNet - Accuracy: 94%</option>
            <option value="vgg">VGG - Accuracy: 88%</option>
            <option value="resnet">ResNet - Accuracy: 88%</option>
            <option value="effnet_densenet">EfficientNet + DenseNet - Accuracy: 88%</option>
            <option value="effnet_resnet">EfficientNet + ResNet - Accuracy: 88%</option>
            <option value="baseline">Baseline CNN - Accuracy: 52%</option>
          </select> */}

          {/* Button */}
          <button
            onClick={upload}
            disabled={loading || !file}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition text-white cursor-pointer w-72"
          >
            {loading ? "Processing..." : "Predict"}
          </button>
        </div>


      </div>
    </div>
  );
}

export default App;