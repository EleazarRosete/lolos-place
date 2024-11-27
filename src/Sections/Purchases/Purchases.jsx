import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Purchases.module.css';

const Purchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch Order History
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/order-history?user_id=${14}` // Replace 14 with dynamic user_id if necessary
        );
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching order history:', err.message);
        setError('Failed to fetch order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []); // Dependency array: empty to fetch on component mount

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-PH', options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Sort orders by date (earliest first)
  const sortedOrders = orders.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <section className={styles.section}>
      {loading ? (
        <p>Loading order history...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : sortedOrders.length > 0 ? (
        <ul className={styles.orderList}>
          {sortedOrders.map((order) => (
            <li key={order.order_id} className={styles.orderItem}>
              <h3>Order #{order.order_id}</h3>
              <p>Date: {formatDate(order.date)}</p>
              <p>Time: {formatTime(order.time)}</p>
              
              {/* Map through orderItems */}
              <p>Items:</p>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.menu_name} (Qty: {item.order_quantity})
                  </li>
                ))}
              </ul>

              <p>Order Type: {order.orderType}</p>
              <p>Total: ₱{order.total_amount}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found.</p>
      )}
    </section>
  );
};

export default Purchases;
