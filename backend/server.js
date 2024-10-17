const express = require('express');
const cors = require('cors'); 
const menu = require('./menu/routes');
const feedback = require('./feedback/routes');

const app = express();
const port = 5000;

app.use(cors()); 
app.use(express.json());

app.use('/feedback', feedback);
app.use('/menu', menu);

app.listen(port, () => console.log(`App listening on port ${port}`));
