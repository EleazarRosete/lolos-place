const pool = require('../db');
const queries = require('./queries');

const addComment = (req, res) => {
    const { username, comment, feedback_date } = req.body;

    pool.query(queries.addComment, [username, comment, feedback_date], (error, results) => {
        if (error) {
            console.error('Error adding comment:', error);
            return res.status(500).json({ error: 'Error adding comment' });
        }
        res.status(200).json({ message: "Added successfully" }); // Send success message
    });
};


// const getComment = (req, res) => {
//     pool.query(queries.getComments, (error, results) => {
//         if (error) {
//             console.error('Error fetching comments:', error);
//             return res.status(500).json({ error: 'Error fetching comments' });
//         }
//         res.status(200).json(results.rows); // Ensure you return the rows
//     });
// };

const getComment = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM feedback'); // Adjust table name if needed
        res.status(200).json(rows); // Return the rows from the query
    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ error: 'Error fetching comments' });
    }
};


module.exports = {
    addComment,
    getComment,
};
