import styles from './Comment.module.css';

function Comment({ username, comment, date }) {
    return (
        <div className={styles.commentContainer}>
            <div className={styles.header}>
                <h1 className={styles.usernameStyle}>{username}</h1>
                <p className={styles.dateStyle}>{date}</p>
            </div>
            <div className={styles.txtBox}>
                <p className={styles.txtStyle}>{comment}</p>
            </div> 
        </div>
    );
}

export default Comment;
