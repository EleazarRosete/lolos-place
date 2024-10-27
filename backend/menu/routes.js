const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.post('/add-product', controller.addProduct);
router.get('/get-product', controller.getProduct);
router.get('/get-product/:menu_id', controller.getProductById);
router.put('/edit-product/:menu_id', controller.updateProduct);
router.delete('/delete-product/:menu_id', controller.deleteProduct);
router.patch('/update-product-stock/:menu_id', controller.updateProductStock);
router.get('/get-categories',controller.getCategories);

module.exports = router;
