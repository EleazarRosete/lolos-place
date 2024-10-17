import React, { useState } from 'react';
import styles from './Items.module.css';

function Item({ item, onRemove, onEdit }) {
    const [isConfirming, setIsConfirming] = useState(false);

    if (!item) {
        return (
            <tr>
                <td colSpan={8} className={styles.emptyRow}>No item data available</td>
            </tr>
        );
    }

    const handleRemoveClick = () => {
        setIsConfirming(true);
    };

    const handleConfirmRemove = () => {
        onRemove();
        setIsConfirming(false);
    };

    const handleCancelRemove = () => {
        setIsConfirming(false);
    };

    return (
        <tr className={styles.itemRow}>
            <td>{item.product_name}</td>
            <td>{item.product_category}</td>
            <td>{parseFloat(item.product_price).toFixed(2)}</td>
            <td>
                {item.product_img_path ? (
                    <img src={item.product_img_path} alt={item.product_name} className={styles.itemImage} />
                ) : (
                    'No Image'
                )}
            </td>
            <td>{item.product_description || 'No description available'}</td>
            <td>{item.product_items || 'No items available'}</td>
            <td>{item.product_quantity}</td>
            <td>
                <div className={styles.actionGroup}>
                    <button onClick={onEdit} className={styles.editButton}>
                        Edit
                    </button>
                    <button onClick={handleRemoveClick} className={styles.removeButton}>
                        Remove
                    </button>
                </div>
                {isConfirming && (
                    <div className={styles.confirmation}>
                        <p>Are you sure you want to remove this item?</p>
                        <button onClick={handleConfirmRemove} className={styles.confirmButton}>
                            Yes
                        </button>
                        <button onClick={handleCancelRemove} className={styles.cancelButton}>
                            No
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

export default Item;
