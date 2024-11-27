import React, { useState } from 'react';
import styles from './Product.module.css';

function Product({ menu_id, name, price, image, description, items, stock, onAddToOrder }) {   
    const [quantity, setQuantity] = useState();  // Default quantity to 1
    const [remainingStock, setRemainingStock] = useState(stock);  // Manage local stock state

    const handleAddToOrder = () => {
        if (quantity <= remainingStock) {
            onAddToOrder(menu_id, name, price, remainingStock, quantity);
            // Reduce stock by quantity after adding to order
            const newStock = remainingStock - quantity;
            setRemainingStock(newStock);  // Update local stock
            setQuantity("");
        } else {
            alert("Not enough stock available!");
        }
    };

    return (
        <div className={styles.productCard}>
            <img src={image} alt={name} className={styles.productImage} />
            <div className={styles.productDetails}>
                <h3 className={styles.productText}>{name}</h3>
                <p className={styles.productText}>{description}</p>
                <p className={styles.productText}>₱{price}</p>
                <p className={styles.productText}>Stock: {remainingStock}</p>
                
                {items && items.length > 0 && (
                    <div className={styles.items}>
                        <h4 className={styles.productText}>Items in this Bundle:</h4>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index} className={styles.itemsList}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    max={remainingStock}
                    placeholder="Quantity"
                    className={styles.productQuantity}
                />
                <button onClick={handleAddToOrder} className={styles.addToOrderBtn}>
                    Add to Order
                </button>
            </div>
        </div>
    );
}

export default Product;
