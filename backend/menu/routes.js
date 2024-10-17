const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.post('/add-product', controller.addProduct);
router.get('/get-product', controller.getProduct);
router.get('/get-product/:id', controller.getProductById);
router.put('/edit-product/:id', controller.updateProduct);
router.delete('/delete-product/:id', controller.deleteProduct);

module.exports = router;
