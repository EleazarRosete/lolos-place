import React, { useState, useEffect } from "react";
import styles from './InventoryCard.module.css';

function InventoryCard() { 
    const [product, setProduct] = useState([]);  // Renamed state to product

    const getProduct = async () => {
        try {
            const response = await fetch("http://localhost:5000/menu/get-low-stocks", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            console.log("Fetched products:", jsonData); // Debug log
            setProduct(jsonData); // Update product state with fetched data

        } catch (err) {
            console.error('Error fetching products:', err.message);
        }
    };

    const stockLevel = () => {
        if (product.length > 0) {
            return "LOW STOCKS"; // If there are low stock items
        }
        return "HIGH STOCKS"; // If there are no low stock items
    };

    const numberOfLowStocks = () => {
        return product.length > 0 ? <span className={styles.lowStockCount}>{product.length}</span> : <span className={styles.lowStockCount}>0</span>; // Display count of low stock items
    };

    useEffect(() => {
        getProduct();
    }, []); // Fetch products when component mounts

    return (
            <div className={styles.card}>
                <h1 className={styles.cardHeaderTxt}>Stock Levels: <span>{stockLevel()}</span></h1>
                <button 
                    className={`${styles.stockButton} ${stockLevel() === "HIGH STOCKS" ? styles.highStocks : styles.lowStocks}`}
                disabled
                >
                    # of products
                    <span className={styles.stockButtonText}>{numberOfLowStocks()}</span>
                </button>
            </div>
    );
}

export default InventoryCard;
