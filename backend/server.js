const express = require('express');
const cors = require('cors'); 
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg'); // Import PostgreSQL pool

const menu = require('./menu/routes');
const feedback = require('./feedback/routes');

const app = express();
const port = 5000;

// PostgreSQL connection setup
const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'your_database_name',
    password: 'your_db_password',
    port: 5432,
});

app.use(cors()); 
app.use('/uploads', express.static('uploads'));
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // Directory where files will be stored

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = `http://localhost:5000/uploads/${req.file.filename}`; // Construct the URL
    res.json({ filePath }); // Send back the file path as JSON
});

// New endpoint to save the image URL to the database
app.post('/save-image-url', async (req, res) => {
    const { url } = req.body; // Get the URL from the request body

    try {
        // Insert the URL into the database
        const query = 'INSERT INTO your_table_name(image_url) VALUES($1) RETURNING *';
        const values = [url];
        const result = await pool.query(query, values);
        
        res.status(201).json({ message: 'Image URL saved successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving image URL:', error);
        res.status(500).json({ message: 'Error saving image URL' });
    }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/feedback', feedback);
app.use('/menu', menu);

app.listen(port, () => console.log(`App listening on port ${port}`));
