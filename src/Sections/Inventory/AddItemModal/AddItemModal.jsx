import React, { useState, useEffect } from 'react';
import styles from './AddItemModal.module.css';

function AddItemModal({ item, onAddItem, onUpdateItem, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category:'',
        price: '',
        items: [''],
        img: '',
        stocks: '',
    });

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            resetFormData();
        }
    }, [item]);

    const resetFormData = () => {
        setFormData({
            name: '',
            description: '',
            category:'',
            price: '',
            items: [''],
            img: '',
            stocks: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file); // Append the file to the form data

        try {
            const response = await fetch('http://localhost:5000/upload', { // Corrected URL
                method: 'POST',
                body: uploadFormData, // Send the FormData directly
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            setFormData((prevData) => ({ ...prevData, img: data.filePath })); // Update form data with the permanent URL
        } catch (err) {
            console.error('Error uploading file:', err.message);
        }
    }
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (item) {
                await handleUpdateItem(formData);
                onUpdateItem(formData);
            } else {
                await handleAddItem(formData);
                onAddItem(formData);
            }
            onClose(); // Close the modal after successful submission
        } catch (err) {
            console.error('Error submitting form:', err.message);
            // You can add more user feedback here, such as showing an alert
        }
    };

    const handleUpdateItem = async (updatedItem) => {
        console.log(updatedItem);
        try {
            const response = await fetch(`http://localhost:5000/menu/edit-product/${updatedItem.id}`, {
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

    const handleAddItem = async (newItem) => {
        try {
            const response = await fetch('http://localhost:5000/menu/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to add item: ${response.statusText}`);
            }
    
            const addedProduct = await response.json();
            return addedProduct;
        } catch (err) {
            console.error('Error adding item:', err.message);
            // Set error message state here to display to the user
        }
    };
    
    
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>{item ? 'Edit Item' : 'Add Item'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="file"
                        name="img"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="items"
                        placeholder="Items"
                        value={formData.items}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="stocks"
                        placeholder="Stocks"
                        value={formData.stocks}
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
