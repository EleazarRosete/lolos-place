import React, { useState, useEffect } from 'react';
import styles from './AddItemModal.module.css';

function AddItemModal({ item, onAddItem, onUpdateItem, onClose }) {
    const [formData, setFormData] = useState({
        product_name: '',
        product_category: '',
        product_price: '',
        product_image: '',
        product_description: '',
        product_item: '', // Verify this column name matches your DB schema
        product_quantity: '',
    });

    useEffect(() => {
        if (item) {
            setFormData(item); // Assuming item contains all keys
        } else {
            setFormData({
                product_name: '',
                product_category: '',
                product_price: '',
                product_image: '',
                product_description: '',
                product_item: '', // Verify this field
                product_quantity: '',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (item) {
            await handleUpdateItem(formData);
            onUpdateItem(formData);
        } else {
            await handleAddItem(formData);
            onAddItem(formData);
        }
    };

    const handleUpdateItem = async (updatedItem) => {
        try {
            const response = await fetch(`http://localhost:5000/menu/edit-product/${updatedItem.product_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedItem),
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }
        } catch (err) {
            console.error('Error updating item:', err.message);
        }
    };

    // New function to handle adding the new product
    const handleAddItem = async (newItem) => {
        const response = await fetch('http://localhost:5000/menu/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem),
        });
    
        if (response.ok) {
            const addedProduct = await response.json();
            const newItemsList = [...product, { product_id: addedProduct.productId, ...newItem }];
            setProduct(newItemsList);
            setFilteredItems(newItemsList);
            setIsModalOpen(false);
        } else {
            // Handle error (e.g., show an alert)
        }
    };
    

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>{item ? 'Edit Item' : 'Add Item'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="product_name"
                        placeholder="Product Name"
                        value={formData.product_name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="product_category"
                        placeholder="Category"
                        value={formData.product_category}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="product_price"
                        placeholder="Price"
                        value={formData.product_price}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="product_image"
                        placeholder="Image Path"
                        value={formData.product_image}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="product_description"
                        placeholder="Description"
                        value={formData.product_description}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="product_item"
                        placeholder="Items"
                        value={formData.product_item}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="product_quantity"
                        placeholder="Quantity"
                        value={formData.product_quantity}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className={styles.submitButton}>
                        {item ? 'Update Item' : 'Add Item'}
                    </button>
                </form>
                <button className={styles.closeButton} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default AddItemModal;
