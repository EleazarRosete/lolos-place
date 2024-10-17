const pool = require('../../db'); 
const queries = require('./queries');

const addProduct = async (req, res) => {
    const { product_name, product_category, product_price, product_img_path, product_description, product_items, product_quantity } = req.body;

    const price = parseInt(product_price, 10);
    const quantity = parseInt(product_quantity, 10);

    try {
        const addResult = await pool.query('INSERT INTO menutbl (product_name, product_category, product_price, product_img_path, product_description, product_items, product_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING product_id;', [
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

module.exports = {
    addProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
