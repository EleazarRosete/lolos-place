import React, { useState } from 'react';
import styles from './Order.module.css';

function Order(props) {
  const [quantity, setQuantity] = useState(Number(props.quantity)); 
  const [showRemove, setShowRemove] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false); 
  const [showDetails, setShowDetails] = useState(false);

  const handleRemoveClick = () => {
    if (quantity > 0) {
      setShowRemove(true); 
    }
  };

  const handleCloseModal = () => {
    setShowRemove(false); 
  };

  const handleToggleDetails = () => {
    setShowDetails(prevState => !prevState); 
  };

  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1); 
  };

  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity(prevQuantity => {
        const newQuantity = prevQuantity - 1;
        if (newQuantity === 0) {
          props.onRemove(); // Automatically remove the order if quantity is 0
        }
        return newQuantity;
      });
    }
  };

  const handleConfirmRemoval = () => {
    props.onRemove(); 
    setShowConfirmRemove(false); 
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmRemove(false); 
  };

  const handleChangeQuantity = () => {
    setShowRemove(false); 
  };

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
          <p className={styles.text}>Price: {props.price}</p>
          <button className={styles.removeButton} onClick={handleRemoveClick}>
            Change Quantity
          </button>
        </div>
      )}

      {showRemove && (
        <div className={styles.remove}>
          <div className={styles.removeContent}>
            <p className={styles.text1}>Are you sure you want to change the quantity?</p>
            <div className={styles.quantityControlInModal}>
              <button className={styles.decrementButton} onClick={decrementQuantity}>-</button>
              <span className={styles.quantityText}>{quantity}</span>
              <button className={styles.incrementButton} onClick={incrementQuantity}>+</button>
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.confirmButton} onClick={handleChangeQuantity}>
                Remove Order
              </button>
              <button className={styles.confirmButton} onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmRemove && (
        <div className={styles.remove}>
          <div className={styles.removeContent}>
            <p className={styles.text1}>The quantity is 0. Do you want to remove this order?</p>
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
  