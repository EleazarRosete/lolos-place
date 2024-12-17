const addProduct = `
  INSERT INTO menu_items (name, description, category, price, items, img, stocks)
  VALUES (?, ?, ?, ?, ?, ?, ?);
`;
const getProduct = "SELECT * FROM menu_items;";
const getProductById = "SELECT * FROM menu_items WHERE menu_id = ?"; 
const updateProduct = "UPDATE menu_items SET name = ?, description = ?, category = ?, price = ?, items = ?, img = ?, stocks = ? WHERE menu_id = ?;";
const deleteProduct = "DELETE FROM menu_items WHERE menu_id = ?"; 
const getCategories = 'SELECT category FROM menu_items'; 
const getStock = 'SELECT stocks FROM menu_items WHERE menu_id = ?'; 
const updateStock = "UPDATE menu_items SET stocks = stocks - ? WHERE menu_id = ?"; 
const getLowStocks = 'SELECT * FROM menu_items WHERE stocks < 21';


module.exports = {
    addProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    getCategories,
    getStock,
    updateStock,
    getLowStocks,
};
