const pool = require('../../db'); 
const queries = require('./queries');

const addProduct = async (req, res) => {
    const { product_name, product_category, product_price, product_img_path, product_description, product_items, product_quantity } = req.body;

    const price = parseInt(product_price, 10);
    const quantity = parseInt(product_quantity, 10);

    try {
        const addResult = await pool.query(queries.addProduct, [
            product_name,
            product_category,
            price,
            product_img_path,
            product_description,
            product_items,
            quantity
        ]);

        res.status(201).json({ message: 'Product item added successfully', productId: addResult.rows[0].product_id });
    } catch (error) {
        console.error('Error adding product item:', error);
        res.status(500).json({ error: 'Error adding product item' });
    }
};






const getProduct = (req, res) => {
    pool.query(queries.getProduct, (error, results) => {
        if (error) {
            console.error('Error fetching Product:', error);
            return res.status(500).json({ error: 'Error fetching Product' });
        }
        res.status(200).json(results.rows);
    });
};

const getProductById = (req, res) => {
    const id = parseInt(req.params.id); // Correctly parse the id

    pool.query(queries.getProductById, [id], (error, results) => {
        if (error) {
            console.error('Error fetching Product by id:', error);
            return res.status(500).json({ error: 'Error fetching Product by id' });
        }
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(results.rows[0]); 
    });
};

const updateProduct = (req, res) => {
    const id = parseInt(req.params.id); // Correctly parse the id
    const { product_name, product_category, product_price, product_img_path, product_description, product_items, product_quantity } = req.body;

    if (!product_name) {
        return res.status(400).json({ error: 'Product name is required and cannot be null' });
    }

    // Fetch the product by ID first
    pool.query(queries.getProductById, [id], (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Error fetching product' });
        }

        // If no product found
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update the product
        pool.query(queries.updateProduct, [
            product_name, 
            product_category || null, 
            product_price || null, 
            product_img_path || null, 
            product_description || null, 
            product_items || null, 
            product_quantity || null, 
            id // Use id instead of product_name
        ], (error) => {
            if (error) {
                console.error('Error updating product:', error);
                return res.status(500).json({ error: 'Error updating product' });
            }

            // Respond with success message
            return res.status(200).json({ message: 'Product updated successfully' });
        });
    });
};


const deleteProduct = (req, res) => {
    const { id } = req.params; // Get the id from the URL params

    pool.query(queries.getProductById, [id], (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Error fetching product' });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        pool.query(queries.deleteProduct, [id], (error) => {
            if (error) {
                console.error('Error deleting product:', error);
                return res.status(500).json({ error: 'Error deleting product' });
            }
            return res.status(200).send("Product deleted successfully");
        });
    });
};

const updateProductQuantity = async (req, res) => {
    const productId = parseInt(req.params.id); // Get the product ID from the URL parameters
    const { quantity } = req.body; // Get the quantity from the request body

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity provided.' });
    }

    try {
        // Check the current product quantity
        const currentProduct = await pool.query(queries.getQuantity, [productId]);

        if (currentProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentQuantity = currentProduct.rows[0].product_quantity;

        // Ensure we don't reduce below zero
        if (currentQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Update the product quantity in the database
        await pool.query(queries.updateQuantity, [quantity, productId]);

        res.status(200).json({ message: 'Product quantity updated successfully.' });
    } catch (error) {
        console.error('Error updating product quantity:', error);
        res.status(500).json({ error: 'Error updating product quantity' });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await pool.query(queries.getCategories);
        res.json(categories.rows.map(row => row.product_category));
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
    updateProductQuantity,
    getCategories,
};
