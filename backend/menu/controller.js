const pool = require('../db');
const queries = require('./queries');

const addProduct = async (req, res) => {
    const { name, description, category, price, items, img, stocks } = req.body;

    const product_price = parseFloat(price);  // Convert price to float
    const product_stock = parseInt(stocks, 10);  // Convert stocks to an integer

    // Ensure 'items' is in JSON format (an array of strings)
    const items_json = JSON.stringify(items);

    try {
        const [result] = await pool.execute(queries.addProduct, [
            name,
            description,
            category,
            product_price,
            items_json,  // Ensure items is properly stringified
            img,
            product_stock
        ]);

        // Use LAST_INSERT_ID() to get the last inserted menu_id for MySQL
        const productId = result.insertId;

        res.status(201).json({ message: 'Product added successfully', productId: productId });
    } catch (error) {
        console.error('Error adding product item:', error);
        res.status(500).json({ error: 'Error adding product item' });
    }
};





const getProduct = async (req, res) => {
    try {
        const [rows] = await pool.execute(queries.getProduct); // Adjust table name if needed
        res.status(200).json(rows); // Return the rows from the query
    } catch (error) {
        console.error('Error fetching Product:', error);
        return res.status(500).json({ error: 'Error fetching Product' });
    }
};

const getProductById = async (req, res) => {
    try {
        const menu_id = parseInt(req.params.menu_id);

        if (isNaN(menu_id)) {
            return res.status(400).json({ error: 'Invalid menu_id' });
        }

        // Log menu_id for debugging purposes
        console.log('Fetching product with menu_id:', menu_id);

        // Query the database
        const [results] = await pool.execute(queries.getProductById, [menu_id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching product by menu_id:', error);
        return res.status(500).json({ error: 'Error fetching product by menu_id' });
    }
};


const updateProduct = async (req, res) => {
    try {
        const menu_id = parseInt(req.params.menu_id, 10); // Converts menu_id to an integer
        const { name, description, category, price, items, img, stocks } = req.body;

        if (!menu_id) {
            return res.status(400).json({ error: 'menu_id is required in the URL' });
        }
        if (!name || !price || !stocks) {
            return res.status(400).json({ error: 'Name, price, and stocks are required fields' });
        }

        // Convert items to a JSON string if it's an array
        const itemsJson = Array.isArray(items) ? JSON.stringify(items) : items;

        // Check if product exists
        const [product] = await pool.query(queries.getProductById, [menu_id]);
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update product
        await pool.query(queries.updateProduct, [
            name,
            description || null,
            category || null,
            price,
            itemsJson || null,
            img || null,
            stocks,
            menu_id
        ]);
        console.log('Updating product with menu_id:', menu_id);

        return res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};







const deleteProduct = async (req, res) => {
    const { menu_id } = req.params;

    try {
        // Fetch product by menu_id
        const [results] = await pool.execute(queries.getProductById, [menu_id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete the product
        await pool.execute(queries.deleteProduct, [menu_id]);

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


const updateProductStock = async (req, res) => {
    const productId = parseInt(req.params.menu_id);
    const { quantity } = req.body;

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity provided.' });
    }

    try {
        const [currentProduct] = await pool.execute(queries.getStock, [productId]);

        if (currentProduct.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentStock = currentProduct[0].stocks;

        if (currentStock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        await pool.execute(queries.updateStock, [quantity, productId]);

        res.status(200).json({ message: 'Product stock updated successfully.' });
    } catch (error) {
        console.error('Error updating product stock:', error);
        res.status(500).json({ error: 'Error updating product stock' });
    }
};

const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.execute(queries.getCategories);
        res.json(categories.map(row => row.category));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getLowStocks = async (req, res) => {
    try {
        const [result] = await pool.execute(queries.getLowStocks);
        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


module.exports = {
    addProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getCategories,
    getLowStocks,
};
