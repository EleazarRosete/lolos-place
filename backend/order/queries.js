
const addOrder = `INSERT INTO orders (user_id, mop, total_amount, date, time, delivery, reservation_id, order_type, customer_name, number_of_people) VALUES (14, ?, ?, CURRENT_DATE, CURRENT_TIME, ?, ?, ?, ?, ?)`;
const getOrder = "SELECT * FROM orders";

const addReservation = `INSERT INTO reservations (user_id, guest_number, reservation_date, reservation_time, advance_order) 
                       VALUES (13, ?, ?, ?, ?)`;
const getReservation = `SELECT 
    r.reservation_id,
    u.first_name,
    u.last_name,
    r.guest_number,
    r.reservation_date,
    r.reservation_time
FROM 
    reservations r
JOIN 
    users u
ON 
    r.user_id = u.user_id`;

const cancelReservation = "DELETE FROM reservations WHERE reservation_id = ?";

const addDelivery = `INSERT INTO deliveries (order_id, delivery_location, delivery_status) VALUES (?, ?, ?)`;
const getDelivery = "SELECT * FROM deliveries";
const getDeliveryByID = "SELECT * FROM deliveries WHERE order_id = ?";

const getPayment = "SELECT * FROM payment";

const updateDeliveryStatus = "UPDATE deliveries SET delivery_status = 'Delivered' WHERE delivery_id = ?";

const getUsers = "SELECT * FROM users";

const orderServed = "UPDATE orders SET status = 'served' WHERE order_id = ?";

const getTempData = "SELECT * FROM temp_data";

module.exports = {
    addOrder,
    getOrder,
    addReservation,
    getReservation,
    addDelivery,
    getDelivery,
    getDeliveryByID,
    getPayment,
    updateDeliveryStatus,
    cancelReservation,
    getUsers,
    orderServed,
    getTempData,
};
