# 🧠 Brain Tumor Detection System

A deep learning-based web application for brain tumor classification from MRI images using multiple CNN and transfer learning architectures. The system allows users to upload MRI scans, select a trained model, generate predictions, and visualize model attention using Grad-CAM.

---

## 📌 Features

* Upload MRI brain scan images
* Predict tumor category from MRI images
* Multiple model selection support:

  * EfficientNetB0
  * ResNet50
  * Xception
  * InceptionV3
  * DenseNet121
  * VGG16
  * EfficientNet + DenseNet (Hybrid)
  * EfficientNet + ResNet (Hybrid)
  * Baseline CNN
* Confidence score output
* Grad-CAM heatmap visualization
* Responsive frontend UI
* Flask API backend
* React frontend
* Deployable on Render + Vercel

---

## 📷 Screenshots

Add your screenshots here after uploading them to GitHub.

### Home Page
<img width="557" height="772" alt="Screenshot 2026-05-15 004259" src="https://github.com/user-attachments/assets/28f2afe0-6fab-4568-b58d-a537bf2c2fd7" />

### Upload MRI Image
<img width="558" height="777" alt="Screenshot 2026-05-15 004329" src="https://github.com/user-attachments/assets/82ebb09c-17de-4378-a055-cb1292132807" />
<img width="552" height="775" alt="Screenshot 2026-05-15 004547" src="https://github.com/user-attachments/assets/6fb7ce03-0374-4b64-96a6-760c22d77ee4" />

### Model Selection
<img width="557" height="776" alt="Screenshot 2026-05-15 004347" src="https://github.com/user-attachments/assets/f81208e9-989d-4548-8b46-c58d61efd87b" />

### Prediction Result
<img width="560" height="801" alt="Screenshot 2026-05-15 004405" src="https://github.com/user-attachments/assets/7989df51-396a-4deb-9174-bb41bf8e03dd" />
<img width="542" height="796" alt="Screenshot 2026-05-15 004608" src="https://github.com/user-attachments/assets/3b2d29ef-79d8-422a-9ff4-67e16bba59ac" />

---

## 🧠 Tumor Classes

The model classifies MRI images into:

1. Glioma Tumor
2. Meningioma Tumor
3. Pituitary Tumor
4. No Tumor

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Axios
* Tailwind CSS

### Backend

* Flask
* Flask-CORS

### Machine Learning

* TensorFlow
* Keras
* OpenCV
* NumPy

### Deployment

* Vercel (Frontend)
* Render (ML API)

---

## 📂 Project Structure

```text
brain-tumor-website/
|── back-end/ -> node.js, mongodb (for future enhancement)
├── front-end/
│   ├── src/
│   ├── assets/
│   └── components/
│
├── ml-api/
│   ├── app.py
│   ├── models/
│   ├── uploads/
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/tusharsinha08/brain-tumor-detector.git

```

### Backend Setup

```bash
cd ml-api

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

Backend runs at:

```text
http://localhost:10000
```

### Frontend Setup

```bash
cd front-end
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 📊 Model Performance

| Model                   | Accuracy |
| ----------------------- | -------- |
| Xception                | 95%      |
| EfficientNet            | 94%      |
| InceptionV3             | 94%      |
| DenseNet121             | 94%      |
| ResNet50                | 92%      |
| VGG16                   | 88%      |
| EfficientNet + DenseNet | 88%      |
| EfficientNet + ResNet   | 88%      |
| Baseline CNN            | 52%      |

---

## 🔬 Future Improvements

* Tumor segmentation support
* Patient report generation
* DICOM support
* Doctor dashboard
* Model explainability improvements
* User authentication
* Database setup with mongodb, node.js

---

## 👨‍💻 Author

Tushar Sinha

Software Engineering Student

---

## ⭐ Support

If you found this project useful, consider giving it a star.
