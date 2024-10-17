const addProduct = 'INSERT INTO menutbl (product_name, product_category, product_price, product_img_path, product_description, product_items, product_quantity) VALUES ($1,$2,$3,$4,$5,$6,$7);';
const getProduct = "SELECT * FROM menutbl;";
const getProductById = "SELECT * FROM menutbl WHERE product_id = $1;";
const updateProduct = "UPDATE menutbl SET product_name = $1, product_category = $2, product_price = $3, product_img_path = $4, product_description = $5, product_items = $6, product_quantity = $7 WHERE product_id = $8;";
const deleteProduct = "DELETE FROM menutbl WHERE product_id = $1;"; // Changed to product_id

module.exports = {
    addProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
