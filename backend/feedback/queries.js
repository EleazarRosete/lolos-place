const addComment = "INSERT INTO feedbacktbl (username, comment, feedback_date) VALUES ($1, $2, $3)";
const getComments = "SELECT * FROM feedbacktbl";


module.exports = {
    addComment,
    getComments,
};