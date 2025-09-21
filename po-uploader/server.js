const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// LightRAG webhook configuration
const LIGHTRAG_WEBHOOK_URL = process.env.LIGHTRAG_WEBHOOK_URL;
if (!LIGHTRAG_WEBHOOK_URL) {
  console.error('LIGHTRAG_WEBHOOK_URL environment variable is required');
  process.exit(1);
}
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY || '';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
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
        ...(LIGHTRAG_API_KEY ? { Authorization: `Bearer ${LIGHTRAG_API_KEY}` } : {})
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
