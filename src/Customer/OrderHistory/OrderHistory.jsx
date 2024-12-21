import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCustomer } from "../../api/CustomerProvider";
import "./OrderHistory.css";
import MainLayout from "../../components/MainLayout";

const OrderHistory = () => {
  const { customer } = useCustomer(); // Access customer data from context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) {
      setError("You need to be logged in to view your order history.");
      setLoading(false);
      return;
    }

    // Fetch Order History
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/order-history?user_id=${customer.id}`
        );

        console.log("Fetched Order History:", response.data);
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching order history:", err.message);
        setError("Failed to fetch order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [customer]);

  // Format date function to display it in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "No Date Available"; // Handle missing or invalid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "No Date Available"; // Handle invalid date formats
    return date.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <MainLayout>
      <div className="order-history-page">
        <h1>{customer?.fullName}'s Order History</h1>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <div className="order-card" key={order.order_id}>
                {/* Display Order Date */}
                <p><strong>Date:</strong> {formatDate(order.date)}</p>

                {/* Display Items */}
                <h3>Items:</h3>
                <ul>
                  {order.items && order.items.length > 0 ? (
                    order.items
                      .filter((item) => item.order_quantity > 0) // Only show items with quantity > 0
                      .map((item, index) => (
                        <li key={index}>
                          <p><strong>Item:</strong> {item.menu_name || "No Item Name"}</p>
                          <p><strong>Quantity:</strong> {item.order_quantity}</p>
                        </li>
                      ))
                  ) : (
                    <li>No items available</li>
                  )}
                </ul>

                {/* Display Order Type */}
                <p><strong>Order Type:</strong> {order.delivery ? "Delivery" : "Reservation"}</p>

                {/* Display Total Amount */}
                <p>
                  <strong>Total Amount:</strong> ₱
                  {typeof order.total_amount === "number" && !isNaN(order.total_amount)
                    ? order.total_amount.toFixed(2)
                    : "0.00"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderHistory;
