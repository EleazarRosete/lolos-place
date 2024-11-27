import React, { useState, useEffect } from "react";
import styles from './DeliveriesCard.module.css';

function DeliveriesCard() { 
    const [deliveries, setDeliveries] = useState([]);  
    const [showModal, setShowModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    const getDeliveries = async () => {
        try {
            const response = await fetch("http://localhost:5000/order/get-delivery", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setDeliveries(jsonData.filter(delivery => delivery.delivery_status === "Pending")); // Only keep pending deliveries
        } catch (err) {
            console.error('Error fetching deliveries:', err.message);
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
                    prev.filter(delivery => delivery.delivery_id !== id) // Remove delivered deliveries from the list
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
    }, []);

    return (
        <section className={styles.section}>

                <h1 className={styles.txtSyles}>Deliveries</h1>
                {deliveries.length > 0 ? (
                    deliveries.map(({delivery_id, order_id, delivery_location, delivery_status }) => (
                        <div key={order_id} className={styles.deliveryItem}>
                            <p><strong>Order ID:</strong> {order_id}</p>
                            <p><strong>Location:</strong> {delivery_location}</p>
                            <p><strong>Status:</strong> {delivery_status}</p>

                            <button 
                                className={`${styles.deliveryButton} ${styles.pending}`}
                                onClick={() => openModal({ order_id, delivery_location })}
                            >
                                Mark as Delivered
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No pending deliveries found.</p>
                )}

            {/* Modal */}
            {showModal && selectedDelivery && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Delivery</h3>
                        <p>Are you sure you want to mark this delivery as delivered?</p>
                        <p><strong>Order ID:</strong> {selectedDelivery.order_id}</p>
                        <p><strong>Location:</strong> {selectedDelivery.delivery_location}</p>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.confirmButton} 
                                onClick={() => updateDeliveryStatus(selectedDelivery.order_id)}
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
