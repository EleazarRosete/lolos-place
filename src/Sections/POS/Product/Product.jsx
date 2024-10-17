import React, { useState } from 'react';
import styles from './Product.module.css';

function Product({ image, name, price, description, items, onAddToOrder }) {
    const [quantity, setQuantity] = useState(1); // State for quantity

    const handleAddToOrder = () => {
        if (quantity > 0) {
            onAddToOrder({ name, price, quantity }); // Pass the product with quantity to the order
            setQuantity(1); // Reset quantity to 1 after adding
        }
    };

    return (
        <div className={styles.productCard}>
            <img src={image} alt={name} className={styles.productImage} />
            <h4 className={styles.productDetails}>{name}</h4>
            <p className={styles.productDetails}>₱{price}</p>
            <p className={styles.productDetails}>{description}</p>
            <p className={styles.productDetails}>Items:</p>
            {items && items.length > 0 && (
                <ul className={styles.itemsList}>
                    {items.map((item, index) => (
                        <li key={index} className={styles.item}>{item}</li>
                    ))}
                </ul>
            )}
            <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} // Update quantity state
                className={styles.quantityInput}
            />
            <button className={styles.addToOrderButton} onClick={handleAddToOrder}>
                Add to Basket
            </button>
        </div>
    );
}

export default Product;
