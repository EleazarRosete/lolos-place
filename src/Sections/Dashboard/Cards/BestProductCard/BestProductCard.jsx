import React, { useState, useEffect } from "react";
import styles from './BestProductCard.module.css';

function BestProductCard() { 
    const [products, setProducts] = useState([]);  

    const getBestProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/sales/get-top-products", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setProducts(jsonData);  
        } catch (err) {
            console.error('Error fetching top products:', err.message);
        }
    };

    useEffect(() => {
        getBestProducts();  
    }, []);

    return (
        <section className={styles.section}>
                <h2 className={styles.title}>Top 5 Products</h2>
                <ul className={styles.productList}>
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <li key={index} className={styles.productItem}>
                                {product.product_name}
                            </li>
                        ))
                    ) : (
                        <p className={styles.loading}>Loading products...</p>
                    )}
                </ul>
        </section>
    );
}

export default BestProductCard;
