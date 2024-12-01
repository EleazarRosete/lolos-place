const { Router } = require('express');
const controller = require('./controller');

const router = Router();


router.post('/add-order', controller.addOrder);
router.get('/get-order', controller.getOrder);
router.put('/order-served/:order_id', controller.orderServed);




router.post('/add-reservation', controller.addReservation);
router.get('/get-reservation', controller.getReservation);
router.delete('/cancel-reservation/:reservation_id', controller.cancelReservation);

router.post('/add-delivery', controller.addDelivery);
router.get('/get-delivery', controller.getDelivery);
router.put('/update-delivery/:delivery_id', controller.updateDeliveryStatus);


router.get('/get-payment', controller.getPayment);

router.get('/get-users', controller.getUsers);


module.exports = router;
