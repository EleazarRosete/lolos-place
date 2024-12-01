import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Purchases.module.css';

const Purchases = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('orders');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState(''); // New state for order type filter

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/order/get-order");
      const filteredOrders = response.data.filter(order => order.user_id === 14 && order.status === 'preparing');
      setOrders(filteredOrders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
    }
  };

  // Function to fetch order history
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/order/order-history");
      setAllOrders(response.data);
    } catch (err) {
      setError('Failed to fetch order history. Please try again later.');
    }
  };

  // Function to fetch deliveries
  const fetchDeliveries = async () => {
    try {
      const response = await fetch("http://localhost:5000/order/get-delivery", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const jsonData = await response.json();
      setDeliveries(jsonData);
    } catch (err) {
      setError('Failed to fetch deliveries. Please try again later.');
    }
  };

  // Initial data fetching on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchOrders();
        await fetchOrderHistory();
        await fetchDeliveries();
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter function for order type
  const filterOrderType = (order) => {
    const matchingOrder = allOrders.find((allOrder) => allOrder.order_id === order.order_id);
    if (!matchingOrder) return order.order_type;

    if (matchingOrder.reservation_id === null) {
      const matchingDelivery = deliveries.find((delivery) => delivery.order_id === order.order_id);
      if (matchingDelivery) return 'deliveries';
      return matchingOrder.orderType === 'Dine-in' ? 'dine-in' : 'take-out';
    } else {
      return 'reservation';
    }
  };

  // Sorting orders and order history
  const sortedOrders = orders.sort((a, b) => b.order_id - a.order_id);
  const sortedAllOrders = allOrders.sort((a, b) => b.order_id - a.order_id);

  // Toggle view between orders and order history
  const toggleView = () => {
    setView((prevView) => (prevView === 'orders' ? 'orderHistory' : 'orders'));
  };

  // Open modal to change order status
  const handleStatusClick = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
  };

  // Update order status to 'served'
  const handleServeOrder = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/order/order-served/${selectedOrderId}`);
      if (response.status === 200) {
        await fetchOrders();
        await fetchOrderHistory();
        handleCloseModal();
      }
    } catch (error) {
      alert('Failed to update order status. Please try again later.');
    }
  };

  // Filter orders based on search query and order type filter
  const filteredOrders = sortedOrders.filter((order) => {
    const ordertype = filterOrderType(order);
    return ordertype.toString().includes(searchQuery) && (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true);
  });

  // Filter all orders based on search query and order type filter
  const filteredAllOrders = sortedAllOrders.filter((order) => {
    const ordertype = filterOrderType(order);
    return ordertype.toString().includes(searchQuery) && (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true);
  });

  // Helper function to format date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date'; // Handle invalid date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (timeString) => {
    // Append a default date to the time string for parsing
    const time = new Date(`1970-01-01T${timeString}Z`);
  
    console.log("TIMEEEEEE", time); // Debugging
  
    if (isNaN(time)) return 'Invalid Time'; // Handle invalid time
  
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  
  

  return (
    <section className={styles.section}>

      <div className={styles.searchContainer}>

        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
                <button className={styles.buttonOrderHistory} onClick={toggleView}>
          {view === 'orders' ? 'View Order History' : 'View Pending Orders'}
        </button>
      </div>
      <div className={styles.navButtons}>
      {view === 'orderHistory' && (
        <div className={styles.filterContainer}>
          <button onClick={() => setOrderTypeFilter('')} className={styles.filterButton}>All</button>
          <button onClick={() => setOrderTypeFilter('dine-in')} className={styles.filterButton}>Dine In</button>
          <button onClick={() => setOrderTypeFilter('take-out')} className={styles.filterButton}>Take Out</button>
          <button onClick={() => setOrderTypeFilter('deliveries')} className={styles.filterButton}>Deliveries</button>
          <button onClick={() => setOrderTypeFilter('reservation')} className={styles.filterButton}>Reservation</button>
        </div>
      )}

      {view === 'orders' && (
        <div className={styles.filterContainer}>
          <button onClick={() => setOrderTypeFilter('')} className={styles.filterButton}>All</button>
          <button onClick={() => setOrderTypeFilter('dine-in')} className={styles.filterButton}>Dine In</button>
          <button onClick={() => setOrderTypeFilter('take-out')} className={styles.filterButton}>Take Out</button>
        </div>
      )}
      </div>












      <div className={styles.orderPurchasesContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : view === 'orders' ? (
          <div className={styles.pendingOrdersContainer}>
            <h1 className={styles.pendingOrdersHeader}>Pending Orders</h1>
            {
  filteredOrders.length > 0 ? (
    <ul className={styles.orderList}>
      {filteredOrders.map((order) => {
        const matchingOrder = allOrders.find(
          (allOrder) => allOrder.order_id === order.order_id
        );

        return (
          <li key={order.order_id} className={styles.orderItem}>
            <h3>Order #{order.order_id}</h3>
            <p>Date: {formatDate(order.date)}</p>
            <p>Time: {formatTime(order.time)}</p>
            <p>Items:</p>
            <ul>
              {(matchingOrder?.items || []).map((item, index) => (
                <li key={index}>
                  {item.menu_name} (Qty: {item.order_quantity})
                </li>
              ))}
            </ul>
            <p>Order Type: {order.order_type}</p>
            <p>Total: ₱{order.total_amount}</p>
            <button onClick={() => handleStatusClick(order.order_id)}>
              Preparing
            </button>
          </li>
        );
      })}
    </ul>
  ) : (
    <p className={styles.noOrdersTxt}>No Orders</p>
  )
}

          </div>
        ) :
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        (
          <div className={styles.historyOrdersContainer}>
            <h1 className={styles.historyOrdersHeader}>Order History</h1>
            <ul className={styles.orderList1}>
              {filteredAllOrders.map((order) => {
                const matchingDelivery = deliveries.find((delivery) => delivery.order_id === order.order_id);
                return (
                  <li key={order.order_id} className={styles.orderItem1}>
                    <h3>Order #{order.order_id}</h3>
                    <p>Date: {formatDate(order.date)}</p>
                    <p>Time: {formatTime(order.time)}</p>
                    <p>Items:</p>
                    <ul>
                      {(order.items || []).map((item, index) => (
                        <li key={index}>
                          {item.menu_name} (Qty: {item.order_quantity})
                        </li>
                      ))}
                    </ul>
                    <p>
                      Order Type:{" "}
                      {matchingDelivery
                        ? `Deliveries #${matchingDelivery.delivery_id}`
                        : order.reservation_id
                        ? `Reservation #${order.reservation_id}`
                        : order.orderType}
                    </p>
                    <p>Total: ₱{order.total_amount.toFixed(2)}</p>

                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className={styles.modalPurchase}>
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>Are you sure you want to mark this order as served?</p>
            <button onClick={handleCloseModal}>No</button>
            <button onClick={handleServeOrder}>Yes</button>
          </div>
        </div>
        </div>
      )}
    </section>
  );
};

export default Purchases;
