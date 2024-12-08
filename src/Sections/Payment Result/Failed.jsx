import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Failed.module.css";

function Failed() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/admin/pos");
        }, 1000); // Navigate after 1 second

        return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, [navigate]);

    return (
        <section className={styles.modalPOS}>
            <div className={styles.orderReceipt}>
                <h1>Failed!</h1>
            </div>
        </section>
    );
}

export default Failed;
