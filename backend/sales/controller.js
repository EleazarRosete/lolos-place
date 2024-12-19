const pool = require('../db');
const queries = require('./queries');


const addSales = async (req, res) => {
    const {
        amount, service_charge, gross_sales, product_name, category,
        quantity_sold, price_per_unit, mode_of_payment, order_type
    } = req.body;

    try {
        const [addResult] = await pool.execute(
            `INSERT INTO sales_data (date, amount, service_charge, gross_sales, product_name, category, 
                        quantity_sold, price_per_unit, mode_of_payment, order_type) 
            VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                amount, service_charge, gross_sales, product_name, category,
                quantity_sold, price_per_unit, mode_of_payment, order_type
            ]
        );

        res.status(201).json({
            message: 'Sales added successfully',
        });
    } catch (error) {
        console.error('Error adding sales:', error.message);
        res.status(500).json({ error: `Error adding sales: ${error.message}` });
    }
};


// Get sales data
const getSales = async (req, res) => {
    try {
        const [results] = await pool.execute(`SELECT * FROM sales_data`);

        if (!results.length) {
            return res.status(404).json({ message: 'No sales data found' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching Sales:', error);
        res.status(500).json({
            error: 'Error fetching Sales',
            details: error.message
        });
    }
};

// Get best products
const getBestProducts = async (req, res) => {
    try {
        const [results] = await pool.execute(`SELECT product_name, SUM(quantity_sold) as total_sold 
                                              FROM sales 
                                              GROUP BY product_name 
                                              ORDER BY total_sold DESC`);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching best products:', error);
        res.status(500).json({ error: 'Error fetching best products' });
    }
};

module.exports = {
    addSales,
    getSales,
    getBestProducts,
};
