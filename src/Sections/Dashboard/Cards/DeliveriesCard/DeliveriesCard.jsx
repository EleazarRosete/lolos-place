    import React, { useState, useEffect } from "react";
    import styles from './DeliveriesCard.module.css';

    function DeliveriesCard() {
        const [deliveries, setDeliveries] = useState([]);
        const [orders, setOrders] = useState({});
        const [showModal, setShowModal] = useState(false);
        const [selectedDelivery, setSelectedDelivery] = useState(null);

        const getDeliveries = async () => {
            try {
                const response = await fetch("http://localhost:5000/order/get-delivery", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await response.json();
                const pendingDeliveries = jsonData.filter(delivery => delivery.delivery_status === "Pending");
                setDeliveries(pendingDeliveries);
            } catch (err) {
                console.error('Error fetching deliveries:', err.message);
            }
        };

        const getOrderHistory = async () => {
            try {
                const response = await fetch("http://localhost:5000/order/order-history", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await response.json();

                // Transform order data into a lookup object
                const orderMap = jsonData.reduce((map, order) => {
                    map[order.order_id] = order; // Use order_id as the key
                    return map;
                }, {});
                setOrders(orderMap);
            } catch (err) {
                console.error('Error fetching order history:', err.message);
            }
        };

        const updateDeliveryStatus = async (id) => {
            try {
                const response = await fetch(`http://localhost:5000/order/update-delivery/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Delivered" }),
                });
                if (response.ok) {
                    setDeliveries(prev =>
                        prev.filter(delivery => delivery.delivery_id !== id)
                    );
                    closeModal();
                } else {
                    console.error("Failed to update delivery status.");
                }
            } catch (err) {
                console.error('Error updating delivery status:', err.message);
            }
        };

        const openModal = (delivery) => {
            setSelectedDelivery(delivery);
            setShowModal(true);
        };

        const closeModal = () => {
            setSelectedDelivery(null);
            setShowModal(false);
        };

        useEffect(() => {
            getDeliveries();
            getOrderHistory();
        }, []);

        return (
            <section className={styles.section}>
                <h1 className={styles.txtSyles}>Deliveries</h1>
                {deliveries.length > 0 ? (
                    deliveries.map(({ delivery_id, order_id, delivery_location, delivery_status }) => {
                        const order = orders[order_id] || {}; // Get the order details for the current delivery
                        return (
                            <div key={order_id} className={styles.deliveryItem}>
                                <p><strong>Delivery ID:</strong> {delivery_id}</p>
                                <p><strong>Order ID:</strong> {order_id}</p>
                                <p><strong>Order Items:</strong></p>
                                {order.items ? (
                                    <ul className={styles.itemList}>
                                        {order.items.map(item => (
                                            <li key={item.menu_name} className={styles.item}>
                                                {item.menu_name} - {item.order_quantity}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No items found</p>
                                )}
                                <p><strong>Location:</strong> {delivery_location}</p>
                                <p><strong>Status:</strong> {delivery_status}</p>

                                <button
                                    className={`${styles.deliveryButton} ${styles.pending}`}
                                    onClick={() => openModal({ delivery_id, order_id, delivery_location })}
                                >
                                    Mark as Delivered
                                </button>
                            </div>


                        );
                    })
                ) : (
                    <p>No pending deliveries found.</p>
                )}

                {/* Modal */}
                {showModal && selectedDelivery && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Confirm Delivery</h3>
                            <p>Are you sure you want to mark this delivery as delivered?</p>
                            <p><strong>Delivery ID:</strong> {selectedDelivery.delivery_id}</p>
                            <p><strong>Order ID:</strong> {selectedDelivery.order_id}</p>
                            <p><strong>Location:</strong> {selectedDelivery.delivery_location}</p>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.confirmButton}
                                    onClick={() => updateDeliveryStatus(selectedDelivery.delivery_id)}
                                >
                                    Yes, Delivered
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        );
    }

    export default DeliveriesCard;
