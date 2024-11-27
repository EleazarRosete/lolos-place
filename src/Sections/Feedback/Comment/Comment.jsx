import styles from './Comment.module.css';

function Comment({ username, comment, date, sentiment }) {
    const sentimentColor = () => {
        if (sentiment.toLowerCase() === 'positive') return '#81d99e'; // Brighter soft green
        if (sentiment.toLowerCase() === 'negative') return '#f26b6b'; // Brighter soft red
        if (sentiment.toLowerCase() === 'neutral') return '#d0d0d0'; // Brighter soft grey
        return '#f2f2f2'; // Slightly brighter white-grey for undefined
    };

    return (
        <div className={styles.commentContainer}>
            <div className={styles.header}>
                <h1 className={styles.usernameStyle}>{username}</h1>
                <p className={styles.dateStyle}>{date}</p>
            </div>
            <div className={styles.txtBox}>
                <p className={styles.txtStyle}>{comment}</p>
            </div>
            <p
                className={styles.sentimentStyle}
                style={{ color: sentimentColor() }}
            >
                {sentiment}
            </p>
        </div>
    );
}

export default Comment;
