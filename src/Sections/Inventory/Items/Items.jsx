import React from 'react';
import styles from './Items.module.css';

function Item({ item, onRemove, onEdit }) {
    if (!item) {
        return (
            <tr>
                <td colSpan={8} className={styles.emptyRow}>No item data available</td>
            </tr>
        );
    }

    const handleConfirmRemove = () => {
        onRemove(item.product_id);
    };

    // Format items with commas
    const formattedItems = item.items
        ? item.items.map((itm, index) => (
            <span key={index}>
                {itm}
                {index < item.items.length - 1 && ', '}
            </span>
        ))
        : 'no items available';

    return (
        <tr className={styles.itemRow}>
            <td>{item.name}</td>
            <td>{item.category}</td>
            <td>{parseFloat(item.price).toFixed(2)}</td>
            <td>
                {item.img ? (
                    <img src={item.img} alt={item.name} className={styles.itemImage} />
                ) : (
                    'no image'
                )}
            </td>
            <td>{item.description}</td>
            <td>{formattedItems}</td>
            <td>{item.stocks || 'no stocks'}</td>
            <td>
                <div className={styles.actionGroup}>
                    <button onClick={() => onEdit(item)} className={styles.editButton}>
                        Edit
                    </button>
                    <button onClick={handleConfirmRemove} className={styles.removeButton}>
                        Remove
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default Item;
