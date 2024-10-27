const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.post('/add-order', controller.addProduct);
router.get('/get-order', controller.getProduct);
router.get('/get-product/:id', controller.getProductById);
router.put('/edit-product/:id', controller.updateProduct);
router.delete('/delete-order/:id', controller.deleteProduct);
router.patch('/update-order-quantity/:id', controller.updateProductQuantity);
router.get('/get-categories',controller.getCategories);

module.exports = router;


//add, get, edit, delete