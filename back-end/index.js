const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const multer = require('multer')
const axios = require("axios");
const FormData = require("form-data");


// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage: multer.memoryStorage() })

const port = process.env.PORT || 5001

// middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n7fvplr.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post("/predict", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);
        console.log("File received:", req.file.originalname);
        console.log("File size:", req.file.size);
        formData.append("model", req.body.model);
        
        // FIXED: Changed port from 5002 to 5001 to match Flask app
        const response = await axios.post(
          "http://localhost:5002/predict",  // Changed from 5002 to 5001
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'Content-Length': formData.getLengthSync()
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          }
        );

        console.log("Prediction response:", response.data);
        res.json(response.data);
      } catch (err) {
        console.error("Prediction error:", err.message);
        if (err.response) {
          console.error("Flask error response:", err.response.data);
          res.status(err.response.status).json(err.response.data);
        } else {
          res.status(500).json({ error: "Prediction failed: " + err.message });
        }
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Server is online")
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})