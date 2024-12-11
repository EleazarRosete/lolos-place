import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from './BestProductCard.module.css';

function BestProductCard() {
    const [productSummary, setProductSummary] = useState({});
    const [error, setError] = useState('');

    const getOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/order/order-history');
            const currentDate = new Date().toLocaleDateString('en-US');  // Get today's date in 'MM/DD/YYYY' format (local time)

            // Filter orders where the date (converted to local time) matches today's date
            const filteredOrders = response.data.filter((order) => {
                const orderDate = new Date(order.date); // Convert the order date to a Date object
                const localDate = orderDate.toLocaleDateString('en-US'); // Convert it to local date format
                return localDate === currentDate;
            });

            // Summarize sold items
            const summary = {};
            filteredOrders.forEach((order) => {
                order.items.forEach((item) => {
                    // Add item quantity to the summary
                    const productName = item.menu_name; // Use the menu_name for the product name
                    const quantity = item.order_quantity; // Use the order_quantity for the quantity
                    summary[productName] = (summary[productName] || 0) + quantity;
                });
            });
            
            setProductSummary(summary); // Update the product summary
            
        } catch (err) {
            setError('Failed to fetch orders. Please try again later.');
        }
    };
    
    useEffect(() => {
        getOrders(); // Fetch orders when the component mounts
    }, []);

    return (
        <section className={styles.section}>
            <h1>Sold Product Items Today</h1>
            {error && <p className={styles.error}>{error}</p>}
            {Object.keys(productSummary).length > 0 ? (
                <ul>
                    {/* Sort the products by quantity in descending order */}
                    {Object.entries(productSummary)
                        .sort((a, b) => b[1] - a[1]) // Sort by the second element (quantity)
                        .map(([productName, quantity]) => (
                            <li key={productName}>
                                <p>{productName} - {quantity} sold</p>
                            </li>
                    ))}
                </ul>
            ) : (
                <p>No products sold today yet.</p>
            )}
        </section>
    );
}

export default BestProductCard;
