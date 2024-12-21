require('dotenv').config({ path: './backend/.env' });

const express = require('express');
const cors = require('cors'); 
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const pool = require('./db'); // This will now be your MySQL connection
const admin = process.env.ADMIN_ID;
const app = express();

// Example of using pool to interact with MySQL database
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

const feedback = require('./feedback/routes');
const menu = require('./menu/routes');
const order = require('./order/routes');
const payment = require('./payment/routes');
const sales = require('./sales/routes');
const purchases = require('./purchases/routes');



const port = process.env.PORT;  // Now using the PORT from .env

// Use the PayMongo secret key from .env
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

app.use(cors()); 
app.use('/uploads', express.static('uploads'));
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // Directory where files will be stored

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = `http://localhost:5000/uploads/${req.file.filename}`; // Construct the URL
    res.json({ filePath }); // Send back the file path as JSON
});

// New endpoint to save the image URL to the database
app.post('/save-image-url', async (req, res) => {
    const { url } = req.body; // Get the URL from the request body

    try {
        // Insert the URL into the database
        const query = 'INSERT INTO your_table_name(image_url) VALUES(?) RETURNING *';
        const values = [url];
        const result = await pool.execute(query, values);
        
        res.status(201).json({ message: 'Image URL saved successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving image URL:', error);
        res.status(500).json({ message: 'Error saving image URL' });
    }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/feedback', feedback);
app.use('/menu', menu);
app.use('/order',order);
app.use('/payment',payment);
app.use('/sales',sales);
app.use('/purchases',purchases);



app.post('/api/feedback', async (req, res) => {
  const { name, comment, feedbackType, compound_score, sentiment } = req.body;

  // Validate required fields
  if (!name || !comment || !compound_score || !sentiment) {
    return res.status(400).json({ message: 'Name, comment, score, sentiment, and feedback type are required.' });
  }

  // Ensure feedbackType is a string if it's an array
  const feedbackTypeString = Array.isArray(feedbackType) ? feedbackType.join(', ') : feedbackType;

  try {
    // Insert feedback data into the database
    const query = `
      INSERT INTO feedback (name, comment, date, compound_score, sentiment, feedback_type)
      VALUES (?, ?, NOW(), ?, ?, ?)`;
    
    const values = [name, comment, compound_score, sentiment, feedbackTypeString];

    // Execute the query using MySQL pool
    const [result] = await pool.execute(query, values);

    // Send a response with the feedback data (including the auto-incremented id)
    res.status(201).json({
      message: 'Feedback submitted successfully!',
      feedback: {
        id: result.insertId,  // insertId will give the auto-incremented ID
        name,
        comment,
        compound_score,
        sentiment,
        feedbackType: feedbackTypeString
      }
    });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ message: 'Server error while submitting feedback', error: err.message });
  }
});



app.post('/api/create-gcash-checkout-session', async (req, res) => {
  const { user_id, lineItems } = req.body;

  const formattedLineItems = lineItems.map((product) => {
      return {
          currency: 'PHP',
          amount: Math.round(product.price * 100), 
          name: product.name,
          quantity: product.quantity,
      };
  });

  const randomId = generateRandomId(28);

  // Define URLs based on user_id
  const successUrl = user_id === 14 ? 'http://localhost:5173/admin/pos/successful' : `http://localhost:5173/successpage?session_id=${randomId}`;
  const cancelUrl = user_id === 14 ? 'http://localhost:5173/admin/pos/failed' : 'http://localhost:5173/';

  try {
      const response = await axios.post(
          'https://api.paymongo.com/v1/checkout_sessions',
          {
              data: {
                  attributes: {
                      send_email_receipt: false,
                      show_line_items: true,
                      line_items: formattedLineItems, 
                      payment_method_types: ['gcash'],
                      success_url: successUrl,
                      cancel_url: cancelUrl,
                  },
              },
          },
          {
              headers: {
                  accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`, 
              },
          }
      );

      const checkoutUrl = response.data.data.attributes.checkout_url;

      if (!checkoutUrl) {
          return res.status(500).json({ error: 'Checkout URL not found in response' });
      }

      // MySQL Client - connection pool
      const connection = await pool.getConnection();

      try {
          await connection.beginTransaction(); // Begin transaction

          // UPSERT query for MySQL
          const query = `
              INSERT INTO payment (user_id, session_id, payment_status)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE 
                  session_id = VALUES(session_id),
                  payment_status = VALUES(payment_status);
          `;
          const values = [user_id, randomId, 'pending'];

          await connection.query(query, values);
          await connection.commit(); // Commit the transaction
      } catch (error) {
          await connection.rollback(); // Rollback in case of error
          console.error('Error inserting/updating payment:', error.message);
          return res.status(500).json({ error: 'Failed to insert/update payment', details: error.message });
      } finally {
          connection.release(); // Release the connection back to the pool
      }

      res.status(200).json({ url: checkoutUrl });
  } catch (error) {
      console.error('Error creating checkout session:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to create checkout session', details: error.response ? error.response.data : error.message });
  }
});





  


// Test route

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Fetch the user from the users table by email or phone
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [identifier, identifier]
    );
    const user = rows[0]; // Get the first user from the result array

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Concatenate first name and last name using template literals
    const fullName = `${user.first_name} ${user.last_name}`;

    // Retrieve complete address and contact number
    const address = user.address;
    const phone = user.phone;
    const email = user.email;
    const id = user.user_id;

    // Create the result object
    const userResult = {
      fullName: fullName,
      address: address,
      phone: phone,
      email: email,
      id: id,
    };

    // If password is valid, respond with success and full user information
    return res.status(200).json({
      message: 'Login Successful',
      data: userResult,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});



app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, address, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const [newUser] = await pool.execute(
      'INSERT INTO users (first_name, last_name, address, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, address, email, phone, hashedPassword]
    );

    // Respond with the new user details (omit password)
    res.status(201).json({
      user: { id: newUser.insertId, firstName, lastName, email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/changeCustomerPassword', async (req, res) => {
  const { id, oldPassword, newPassword, confirmNewPassword } = req.body;

  // Validate input
  if (!id || !oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New and confirm password do not match.' });
  }

  try {
    // Fetch the current password hash from the database
    const [result] = await pool.execute(
      'SELECT password FROM users WHERE user_id = ?',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const user = result[0]; // Access the first row of the result set

    // Compare old password with the stored hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

    // Update the password in the database
    await pool.execute(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedNewPassword, id]
    );

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

app.post('/api/changeCustomerDetails', async (req, res) => {
  const { id, email, phone, address } = req.body;

  // Validate input
  if (!id || !email || !phone || !address) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Fetch the current details from the database
    const [result] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    } else {
      // Update the details in the database
      await pool.execute(
        'UPDATE users SET email = ?, phone = ?, address = ? WHERE user_id = ?',
        [email, phone, address, id]
      );
      res.status(200).json({ message: 'Changed successfully!' });
    }
  } catch (error) {
    console.error('Error changing details:', error);
    res.status(500).json({ message: 'Error changing details', error: error.message });
  }
});


  
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM menu_items');
    res.json(rows); // Send the rows as JSON
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

  // API endpoint to save the order
app.post('/api/web-orders', async (req, res) => {
  const { name, address, contact, totalAmount, items } = req.body;

  try {
    const query = `
      INSERT INTO orders (name, address, contact, total_amount, order_items)
      VALUES (?, ?, ?, ?, ?) RETURNING *;
    `;
    const values = [name, address, contact, totalAmount, JSON.stringify(items)];

    const result = await pool.execute(query, values);
    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.getConnection(); // Get a client from the pool
  try {
    // Start a transaction
    await client.beginTransaction();

    // Destructure order and delivery details from request body
    const { cart, userId, mop, totalAmount, deliveryLocation, deliveryStatus } = req.body;

    // Validate input
    if (!cart || !Array.isArray(cart) || !cart.length) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }
    if (!userId || !mop || !totalAmount || !deliveryLocation || !deliveryStatus) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get the current date and time in the correct format
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Update payment status
    const [paymentResult] = await client.execute(
      'UPDATE payment SET payment_status = ? WHERE user_id = ?',
      ['paid', userId]
    );
    if (paymentResult.affectedRows === 0) {
      return res.status(400).json({ message: 'No payment found for the customer' });
    }
    console.log('Payment Update Result:', paymentResult);

    // Insert order into orders table
    const orderQuery = `
      INSERT INTO orders (user_id, mop, total_amount, date, time, delivery)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const orderValues = [userId, mop, totalAmount, currentDate, currentTime, true]; // Assuming 'delivery' is true
    const [orderResult] = await client.execute(orderQuery, orderValues);
    console.log('Order Insert Result:', orderResult);

    // Retrieve the generated order_id (MySQL equivalent of LAST_INSERT_ID())
    const orderId = orderResult.insertId;

    // Insert order quantities into order_quantities table (from cart)
    const values = cart.map((item) => [orderId, item.menu_id, item.quantity]);
    const orderQuantitiesQuery = `
      INSERT INTO order_quantities (order_id, menu_id, order_quantity)
      VALUES ?;
    `;
    await client.query(orderQuantitiesQuery, [values]);
    console.log('Order Quantities Insert Result:', values);

    // Insert delivery details into deliveries table
    const deliveryQuery = `
      INSERT INTO deliveries (order_id, delivery_location, delivery_status)
      VALUES (?, ?, ?);
    `;
    const deliveryValues = [orderId, deliveryLocation, deliveryStatus];
    const [deliveryResult] = await client.execute(deliveryQuery, deliveryValues);
    console.log('Delivery Insert Result:', deliveryResult);

    // Commit the transaction
    await client.commit();

    // Return the new order and delivery details
    res.status(201).json({
      order: orderResult,
      delivery: deliveryResult,
    });
  } catch (err) {
    // Rollback transaction on error
    await client.rollback();
    console.error('SQL Error:', err.sqlMessage || err.message);
    res.status(500).send('Server Error');
  } finally {
    // Release the client back to the pool
    client.release();
  }
});


app.post('/api/reservations', async (req, res) => {
  const client = await pool.getConnection(); // Get a connection from the pool

  try {
    await client.beginTransaction(); // Start the transaction

    // Destructure reservation details from request body
    const { guestNumber, userId, reservationDate, reservationTime, advanceOrder, totalAmount, cart } = req.body;
    console.log(req.body);

    // Update the payment status
    const paymentResult = await client.execute(
      'UPDATE payment SET payment_status = ? WHERE user_id = ?',
      ['paid', userId]
    );

    if (paymentResult[0].affectedRows === 0) {
      return res.status(400).json({ message: 'No payment found for the customer' });
    }

    // Insert reservation into reservations table
    const reservationQuery = `
      INSERT INTO reservations (user_id, guest_number, reservation_date, reservation_time, advance_order)
      VALUES (?, ?, ?, ?, ?);
    `;
    const reservationValues = [userId, guestNumber, reservationDate, reservationTime, advanceOrder];
    const [reservationResult] = await client.execute(reservationQuery, reservationValues);
    const reservationId = reservationResult.insertId; // Get the inserted ID

    // Insert order associated with the reservation
    const orderQuery = `
      INSERT INTO orders (user_id, mop, total_amount, date, time, delivery, reservation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const currentTime = new Date().toTimeString().split(' ')[0]; // Format: HH:MM:SS
    const orderValues = [userId, 'GCash', totalAmount, currentDate, currentTime, false, reservationId];
    const [orderResult] = await client.execute(orderQuery, orderValues);
    const orderId = orderResult.insertId; // Get the inserted ID

    // Insert each item from the cart into order_quantities table
    const orderQuantitiesQuery = `
      INSERT INTO order_quantities (order_id, menu_id, order_quantity)
      VALUES (?, ?, ?);
    `;

    for (let item of cart) {
      await client.execute(orderQuantitiesQuery, [orderId, item.menu_id, item.quantity]);
    }

    // Commit the transaction
    await client.commit();

    // Return reservation and order details
    res.status(201).json({
      reservation: {
        id: reservationId,
        userId,
        guestNumber,
        reservationDate,
        reservationTime,
        advanceOrder,
      },
      order: {
        id: orderId,
        userId,
        totalAmount,
        date: currentDate,
        time: currentTime,
      },
    });
  } catch (err) {
    // Rollback the transaction on error
    await client.rollback();
    console.error('Transaction Error:', err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release(); // Release the connection back to the pool
  }
});


const generateRandomId = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
  }
  return result;
};



app.get('/api/check-payment-status/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const client = await pool.getConnection(); // Get connection from pool
    const query = 'SELECT session_id, payment_status FROM payment WHERE user_id = ?';
    
    const [rows] = await client.execute(query, [user_id]);

    if (rows.length > 0) {
      const { session_id, payment_status } = rows[0]; // Destructure the result
      res.status(200).json({ session_id, payment_status });
    } else {
      res.status(200).json({ exists: false });
    }

    client.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error checking payment status:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/top-best-sellers', async (req, res) => {
  try {
    // Query to fetch the top 3 best-selling products
    const [rows] = await pool.execute(
      `
      SELECT 
        product_name,
        SUM(quantity_sold) AS total_sold,
        SUM(amount) AS total_revenue
      FROM sales_data
      GROUP BY product_name
      ORDER BY total_sold DESC
      LIMIT 3;
      `
    );

    // Send the result as JSON
    res.status(200).json({
      message: 'Top 3 best-selling products retrieved successfully',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching best-sellers:', error.message);
    res.status(500).json({ message: 'Server error while fetching best sellers' });
  }
});


app.get('/api/order-history', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Query to fetch orders
    const ordersQuery = `
      SELECT o.order_id, o.user_id, o.mop, o.total_amount, o.date, o.time, o.delivery, o.reservation_id
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.date DESC;
    `;
    const orders = await pool.query(ordersQuery, [user_id]);

    if (!orders.length) {
      return res.status(200).json([]); // Return an empty array if no orders are found
    }

    // Extract order IDs
    const orderIds = orders.map((order) => order.order_id);

    // Query to fetch items for the orders
    const itemsQuery = `
      SELECT oq.order_id, oq.menu_id, oq.order_quantity, mi.name AS menu_name
      FROM order_quantities oq
      JOIN menu_items mi ON oq.menu_id = mi.menu_id
      WHERE oq.order_id IN (${orderIds.map(() => '?').join(',')});
    `;
    const items = await pool.query(itemsQuery, orderIds);

    // Extract reservation IDs
    const reservationIds = orders
      .filter((order) => order.reservation_id)
      .map((order) => order.reservation_id);

    // Query to fetch reservation details
    const reservations = reservationIds.length
      ? await pool.query(
          `
          SELECT r.reservation_id, r.reservation_date, r.reservation_time
          FROM reservations r
          WHERE r.reservation_id IN (${reservationIds.map(() => '?').join(',')});
          `,
          reservationIds
        )
      : [];

    // Combine orders, items, and reservations
    const combinedData = orders.map((order) => {
      const orderItems = items.filter((item) => item.order_id === order.order_id);
      const reservation = reservations.find(
        (res) => res.reservation_id === order.reservation_id
      );

      return {
        order_id: order.order_id,
        date: order.date,
        time: order.time,
        total_amount: parseFloat(order.total_amount),
        mop: order.mop,
        delivery: order.delivery,
        reservation_id: order.reservation_id,
        reservation_date: reservation?.reservation_date || null,
        reservation_time: reservation?.reservation_time || null,
        items: orderItems.map((item) => ({
          menu_id: item.menu_id,
          menu_name: item.menu_name,
          order_quantity: item.order_quantity,
        })),
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Failed to fetch order history. Please try again later.' });
  }
});



app.listen(port, () => console.log(`App listening on port ${port}`));
