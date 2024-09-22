const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const mime = require('mime-types'); 
const fs = require('fs'); 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(cors()); // Use cors

const USER_ID = "aditya_vardhan";
const EMAIL = "Pallapotu Aditya Vardhan";
const ROLL_NUMBER = "AP21110010341";

// Helper function to decode base64 file
const decodeBase64File = (base64String) => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return null; 
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const fileSizeKB = (buffer.length / 1024).toFixed(2); 

    return {
        is_valid_file: true,
        mime_type: mimeType,
        file_size_kb: fileSizeKB
    };
};

// POST /bfhl endpoint
app.post('/bfhl', (req, res) => {
    const data = req.body.data || [];
    const fileB64 = req.body.file_b64 || null;

    const numbers = data.filter(item => !isNaN(item) && typeof item === 'string' && item.trim() !== '');
    const alphabets = data.filter(item => /^[a-zA-Z]$/.test(item));

    // Filter only lowercase alphabets
    const lowercaseAlphabets = alphabets.filter(a => /^[a-z]$/.test(a));
    const highestLowercaseAlphabet = lowercaseAlphabets.length > 0 ? [lowercaseAlphabets.sort().pop()] : null;

    let fileInfo = {
        is_valid_file: false,
        mime_type: null,
        file_size_kb: null
    };

    // Decode base64 file if it exists
    if (fileB64) {
        const decodedFile = decodeBase64File(fileB64);
        if (decodedFile) {
            fileInfo = decodedFile;
        }
    }

    res.json({
        is_success: true,
        user_id: USER_ID,
        email: EMAIL,
        roll_number: ROLL_NUMBER,
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowercaseAlphabet,  // null if no lowercase letters
        file_valid: fileInfo.is_valid_file, 
        file_mime_type: fileInfo.mime_type, 
        file_size_kb: fileInfo.file_size_kb 
    });
});

app.get('/bfhl', (req, res) => {
    res.json({
        operation_code: 1
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
