const pool = require('../db');
const queries = require('./queries');





const addOrder = async (req, res) => {
    const {
        mop,
        total_amount,
        delivery,
        reservation_id,
        order_type,
        items,
        customer_name,
        number_of_people
    } = req.body;

    const sum = parseInt(total_amount, 10); // Parse total_amount to integer

    try {
        // Insert the new order into the database
        const [addResult] = await pool.execute(
            queries.addOrder,
            [mop, sum, delivery, reservation_id, order_type, customer_name, number_of_people]
        );

        const orderId = addResult.insertId; // Get the generated order_id from MySQL

        // Insert items after the order is successfully created
        const orderQuantityQuery = `
INSERT INTO order_quantities (order_id, menu_id, order_quantity) 
VALUES (?, ?, ?);
`;
        for (let item of items) {
            await pool.execute(orderQuantityQuery, [orderId, item.menu_id, item.quantity]);
        }

        // Return the order_id of the newly inserted order after all operations
        res.status(201).json({
            message: 'Order added successfully',
            orderId: orderId, // Returning the order_id
        });

    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Error adding order' });
    }
};



const getOrder = async (req, res) => {
    try {
        const [results] = await pool.execute(queries.getOrder);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching Product:', error);
        res.status(500).json({ error: 'Error fetching Product' });
    }
};


const addReservation = async (req, res) => {
    const { guest_number, reservation_date, reservation_time, advance_order } = req.body;

    try {
        const [addResult] = await pool.execute(queries.addReservation, [
            guest_number,
            reservation_date,
            reservation_time,
            advance_order,
        ]);

        res.status(201).json({
            message: 'Reservation added successfully',
            reservationId: addResult.insertId,
        });
    } catch (error) {
        console.error('Error adding reservation:', error);
        res.status(500).json({ error: 'Error adding reservation' });
    }
};

const getReservation = async (req, res) => {
    try {
        const [results] = await pool.execute(queries.getReservation);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Error fetching reservations' });
    }
};

const addDelivery = async (req, res) => {
    const { order_id, delivery_location, delivery_status } = req.body;

    try {
        const [addResult] = await pool.execute(queries.addDelivery, [
            order_id,
            delivery_location,
            delivery_status,
        ]);

        res.status(201).json({
            message: 'Delivery added successfully',
            deliveryId: addResult.insertId,
        });
    } catch (error) {
        console.error('Error adding delivery:', error);
        res.status(500).json({ error: `Error adding delivery: ${error.message}` });
    }
};

const cancelReservation = async (req, res) => {
    const { reservation_id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM reservations WHERE reservation_id = ?;', [reservation_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        res.status(200).send('Reservation canceled successfully');
    } catch (err) {
        console.error('Error during DELETE operation:', err);
        res.status(500).json({ error: 'Error deleting reservation', details: err.message });
    }
};

const getDelivery = async (req, res) => {
    try {
        const [results] = await pool.execute(queries.getDelivery);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ error: 'Error fetching deliveries' });
    }
};

const getPayment = async (req, res) => {
    try {
        const [results] = await pool.execute(queries.getPayment);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Error fetching payments' });
    }
};

const updateDeliveryStatus = async (req, res) => {
    const { delivery_id } = req.params;

    try {
        const [results] = await pool.execute(queries.updateDeliveryStatus, [delivery_id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        res.status(200).json({
            message: 'Delivery status updated successfully',
        });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
};

const getUsers = async (req, res) => {
    try {
        const [results] = await pool.execute(queries.getUsers);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

const orderServed = async (req, res) => {
    const { order_id } = req.params;

    try {
        const [results] = await pool.execute(queries.orderServed, [order_id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order ID not found' });
        }

        res.status(200).json({
            message: 'Order status updated successfully',
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

const addTempData = async (req, res) => {
    const { order, salesdata, paidorder } = req.body;

    try {
        const [addResult] = await pool.execute(
            `INSERT INTO temp_data (\`order\`, salesdata, paidorder) VALUES (?, ?, ?);`,
            [order, salesdata, paidorder]
        );

        res.status(201).json({
            message: 'Temporary data added successfully',
            tempDataId: addResult.insertId,
        });
    } catch (error) {
        console.error('Error adding temporary data:', error);
        res.status(500).json({ error: 'Error adding temporary data' });
    }
};


const getTempData = async (req, res) => {
    try {
        const [results] = await pool.execute(queries.getTempData);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching temporary data:', error);
        res.status(500).json({ error: 'Error fetching temporary data' });
    }
};

const deleteTempData = async (req, res) => {
    const { purchases_id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM temp_data WHERE purchases_id = ?;', [purchases_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Temporary Data not found' });
        }

        res.status(200).json({ success: 'Success' });
    } catch (err) {
        console.error('Error during DELETE operation:', err);
        res.status(500).json({ error: 'Error deleting temporary data', details: err.message });
    }
};




module.exports = {
    addOrder,
    getOrder,
    addReservation,
    getReservation,
    addDelivery,
    getDelivery,
    getPayment,
    updateDeliveryStatus,
    cancelReservation,
    getUsers,
    orderServed,
    addTempData,
    getTempData,
    deleteTempData,
};
