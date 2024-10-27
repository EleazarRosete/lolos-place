import React, { useState } from 'react';
import styles from './Order.module.css';

function Order(props) {

  return (
    <div className={styles.orderContainer}>
      <div className={styles.orderHeader}>
        <p className={styles.text}>{props.name}</p>
        <button className={styles.toggleButton} onClick={handleToggleDetails}>
          {showDetails ? '-' : '+'}
        </button>
      </div>

      {showDetails && (
        <div className={styles.orderDetails}>
          <p className={styles.text}>Quantity: {quantity}</p>
          <p className={styles.text}>Price: ₱{props.price}</p>
          <button className={styles.removeButton} onClick={handleRemoveClick}>
            Change Quantity
          </button>
        </div>
      )}

      {/* Remove Quantity Modal */}
      {showRemoveModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p className={styles.text1}>Change the quantity:</p>
            <div className={styles.quantityControl}>
              <button className={styles.decrementButton} onClick={decrementStock}>-</button>
              <span className={styles.stock}>{stock}</span>
              <button className={styles.incrementButton} onClick={incrementStock}>+</button>
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.confirmButton} onClick={handleCloseRemoveModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Removal Modal */}
      {showConfirmRemoveModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p className={styles.text1}>The stock is 0. Do you want to remove this order?</p>
            <div className={styles.buttonGroup}>
              <button className={styles.confirmButton} onClick={handleConfirmRemoval}>
                Yes, Remove Order
              </button>
              <button className={styles.confirmButton} onClick={handleCloseConfirmModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;
