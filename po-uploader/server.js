const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// LightRAG webhook configuration
const LIGHTRAG_WEBHOOK_URL = 'https://lightrag-production-6328.up.railway.app/webhook/426951f9-1936-44c3-83ae-8f52f0508acf';
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY; // Set this in your environment

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // Forward file to LightRAG webhook
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('documentType', 'purchase_order');
    formData.append('parameters', JSON.stringify({
      uploadedAt: new Date().toISOString(),
      originalName: req.file.originalname,
      size: req.file.size
    }));

    const webhookResponse = await axios.post(LIGHTRAG_WEBHOOK_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${LIGHTRAG_API_KEY}`
      }
    });

    // Compose download URL for local access
    const baseUrl = req.protocol + '://' + req.get('host');
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({ 
      success: true, 
      downloadUrl: fileUrl,
      lightragResponse: webhookResponse.data,
      message: 'File uploaded and forwarded to LightRAG successfully'
    });

  } catch (error) {
    console.error('Error forwarding to LightRAG:', error.response?.data || error.message);
    
    // Still return success for local upload even if LightRAG fails
    const baseUrl = req.protocol + '://' + req.get('host');
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      downloadUrl: fileUrl,
      warning: 'File uploaded locally but LightRAG forwarding failed',
      error: error.response?.data || error.message
    });
  }
});

// Serve the uploaded files
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Purchase Order Uploader' });
});

// Home for testing
app.get('/', (req, res) => {
  res.send(`
    <h1>Purchase Order Uploader</h1>
    <p>Server is running!</p>
    <p>Upload endpoint: POST /upload</p>
    <p>Health check: GET /health</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Purchase Order Uploader running at http://localhost:${PORT}`);
  console.log(`LightRAG webhook URL: ${LIGHTRAG_WEBHOOK_URL}`);
}); 