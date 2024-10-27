import React, { useState } from 'react';
import styles from './Product.module.css';

function Product({ menu_id, name, price, image, description, items, stock, onAddToOrder }) {
    const [quantity, setQuantity] = useState(1);

    const handleAddToOrder = () => {
        if (quantity > 0 && quantity <= stock) {
            onAddToOrder(menu_id, name, price, quantity); 
            stock = stock - quantity;
            setQuantity(1); 

        } else {
            alert('Please select a valid stock amount.');
        }
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.imageContainer}>
                <img src={image} alt={name} className={styles.productImage} />
            </div>
            <h4 className={styles.productDetails}>{name}</h4>
            <p className={styles.productDetails}>₱{price}</p>
            <p className={styles.productDetails}>{description}</p>
            <p className={styles.productDetails}>{items}</p>
            <input 
                type="number" 
                min='1'
                placeholder='Quantity'
                max={stock} 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={styles.stockInput}
            />
            <button 
                className={styles.addToOrderButton} 
                onClick={handleAddToOrder} 
                disabled={quantity < 1 || quantity > stock}
            >
                Add to Basket
            </button>
            <p className={styles.stockInfo}>Available stock: {stock}</p>
        </div>
    );
}

export default Product;
