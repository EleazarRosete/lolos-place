import React, { useState, useEffect } from "react";
import styles from './SalesTodayCard.module.css';

function SalesTodayCard() { 
    const [sales, setSales] = useState([]);
    const [salesToday, setSalesToday] = useState(0); 

    const getSales = async () => {
        try {
            const response = await fetch("http://localhost:5000/sales/get-sales", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setSales(jsonData); // Update sales state with fetched data
            calculateSalesToday(jsonData); // Calculate sales for today after fetching data

        } catch (err) {
            console.error('Error fetching sales:', err.message);
        }
    };

    const calculateSalesToday = (salesData) => {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        let totalSales = 0;
    
        // Loop through sales data to sum today's sales
        salesData.forEach(sale => {
            const saleDate = new Date(sale.date).toISOString().split('T')[0]; // Format the sale date to YYYY-MM-DD
            if (saleDate === today) {
                totalSales += parseFloat(sale.gross_sales); // Assuming the sales data has a `gross_sales` field and converting it to a number
            }
        });
    
        setSalesToday(totalSales); // Set the total sales for today
    };
    

    // Format the sales value to include commas and two decimal places
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    useEffect(() => {
        getSales();
    }, []); // Fetch sales data when the component mounts

    return (
        <div className={styles.card}>
            <h1 className={styles.cardHeaderTxt}>Sales Today:</h1>
            <button className={styles.salesButton}>
                {formatCurrency(salesToday)} 
            </button>
        </div>

    );
}

export default SalesTodayCard;
