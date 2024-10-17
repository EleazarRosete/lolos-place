import React, { useState, useEffect } from 'react';
import styles from './Feedback.module.css';
import Comment from './Comment/Comment';

function Feedback() {
    const [comments, setComments] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');

    const getComments = async () => {
        try {
            const response = await fetch("http://localhost:5000/feedback/get-comment", {
                method: "GET",
                headers: {"Content-Type": "application/json"},
            });            
            const jsonData = await response.json();
            console.log('Fetched Comments:', jsonData); // Log the fetched comments
            setComments(jsonData);
        } catch (err) {
            console.error('Error fetching comments:', err.message);
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    const sortByDate = () => {
        const sortedComments = [...comments].sort((a, b) => {
            const dateA = new Date(a.feedback_date);
            const dateB = new Date(b.feedback_date);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setComments(sortedComments);
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    return (
        <section className={styles.section}>
            <header className={styles.feedback}>
                <h1 className={styles.textStyle}>Feedback</h1>
                <button className={styles.sort} onClick={sortByDate}>
                    Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
                </button>
            </header>
            <div className={styles.feedbackContainer}>
                {comments.length > 0 ? (
                    comments.map((c, index) => (
                        <Comment
                            key={index} // Use index as a key for mapping
                            username={c.username}
                            comment={c.comment}
                            date={c.feedback_date}
                        />
                    ))
                ) : (
                    <p className={styles.textStyle1}>No comments available.</p>
                )}
            </div>
        </section>
    );
    
}

export default Feedback;
