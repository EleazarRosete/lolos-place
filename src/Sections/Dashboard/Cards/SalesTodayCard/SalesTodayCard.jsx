import React, { useState, useEffect } from "react";
import styles from './SalesTodayCard.module.css';

function SalesTodayCard() { 
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState(0); // State to hold filtered sales data
    const [selectedDate, setSelectedDate] = useState(''); // State for selected date

    const getSales = async () => {
        try {
            const response = await fetch("http://localhost:5000/sales/get-sales", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setSales(jsonData); // Update sales state with fetched data
        } catch (err) {
            console.error('Error fetching sales:', err.message);
        }
    };

    const calculateSales = (salesData, dateFilter) => {
        const today = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
        const todayDate = new Date(today).toLocaleDateString('en-CA'); // Using 'en-CA' for YYYY-MM-DD format
        
        let totalSales = 0;
    
        salesData.forEach(sale => {
            const saleDate = sale.date; // Assuming sale.date is in YYYY-MM-DD format
            if ((dateFilter === 'today' && saleDate === todayDate) || 
                (dateFilter !== 'today' && saleDate === dateFilter)) {
                totalSales += parseFloat(sale.gross_sales); // Assuming the sales data has a `gross_sales` field
            }
        });
    
        setFilteredSales(totalSales); // Set the filtered sales
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

    // Handle date change from input field
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value); // Update the selected date
    };

    // Recalculate sales automatically when selectedDate changes
    useEffect(() => {
        if (sales.length > 0) {
            if (selectedDate) {
                calculateSales(sales, selectedDate); // Recalculate based on selected date
            } else {
                calculateSales(sales, 'today'); // Default to today's sales if no date is selected
            }
        }
    }, [selectedDate, sales]); // Dependency on selectedDate and sales to trigger recalculation

    useEffect(() => {
        getSales(); // Fetch sales data when the component mounts
    }, []);

    return (
        <div className={styles.card}>
            <h1 className={styles.cardHeaderTxt}>Sales</h1>
            
            <div className={styles.dateFilter}>
                <label htmlFor="dateFilter">Select Date: </label>
                <input 
                    type="date" 
                    id="dateFilter" 
                    value={selectedDate} 
                    onChange={handleDateChange} 
                />
            </div>
            
            <div className={styles.salesText}>
                {formatCurrency(filteredSales)}
            </div>
        </div>
    );
}

export default SalesTodayCard;
