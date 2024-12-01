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
            return `LOW STOCKS - ${product.length} Products`; // If there are low stock items
        }
        return "HIGH STOCKS"; // If there are no low stock items
    };

    useEffect(() => {
        getProduct();
    }, []); // Fetch products when component mounts

    return (
        <div className={styles.card}>
            <h1 className={styles.cardHeaderTxt}>Stock Levels:</h1>
            <div 
                className={`${styles.stockIndicator} ${product.length === 0 ? styles.highStocks : styles.lowStocks}`}
            >
                {stockLevel()}
            </div>
        </div>
    );
}

export default InventoryCard;
