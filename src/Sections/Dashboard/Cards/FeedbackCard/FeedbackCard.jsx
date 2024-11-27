import React, { useState, useEffect } from "react";
import styles from './FeedbackCard.module.css';

function FeedbackCard() { 
    const [latestComment, setLatestComment] = useState("");
    const [sentiment, setCommentSentiment] = useState("");

    const getComments = async () => {
        try {
            const response = await fetch("http://localhost:5000/feedback/get-comment", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const jsonData = await response.json();
    
            // Debugging: log the response to check its structure
            console.log("Fetched comments:", jsonData);
    
            if (jsonData.length === 0) {
                setLatestComment("");
                setCommentSentiment("");
                return;
            }
    
            // Sort comments by ID in descending order (newest first)
            const sortedComments = jsonData.sort((a, b) => b.id - a.id);
    
            // Get the latest comment and sentiment
            const lastComment = sortedComments[0].comment || "";
            const commentSentiment = sortedComments[0].sentiment || "";
    
            setLatestComment(lastComment);
            setCommentSentiment(commentSentiment);
        } catch (err) {
            console.error("Error fetching comments:", err.message);
        }
    };
    
    
    useEffect(() => {
        getComments();
    }, []);

    // Determine the background class for the button based on sentiment
    const getSentimentButtonClass = () => {
        if (sentiment === "positive") {
            return styles.positiveButton;
        } else if (sentiment === "negative") {
            return styles.negativeButton;
        } else if (sentiment === "neutral") {
            return styles.neutralButton;
        }
        return ""; // Default (no sentiment)
    };

    return (
            <div className={styles.card}>
            <h1 className={styles.cardHeaderTxt}>Latest Feedback:</h1>
                <button className={`${styles.feedbackButton1} ${getSentimentButtonClass()}`} disabled>
                    <span className={styles.commentText1}>{latestComment}</span>
                </button>
                {!latestComment && (
                    <p className={styles.textStyle1}>No comments available.</p>
                )}
            </div>
    );
}

export default FeedbackCard;
