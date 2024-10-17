import React, { useState, useEffect } from 'react';
import Item from './Items/Items.jsx';
import AddItemModal from './AddItemModal/AddItemModal.jsx';
import styles from './Inventory.module.css';

function Inventory() {
    const [product, setProduct] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState([]); // State for categories

    const getProduct = async () => {
        try {
            const response = await fetch("http://localhost:5000/menu/get-product", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setProduct(jsonData);
            setFilteredItems(jsonData);
            extractCategories(jsonData); // Extract categories after fetching products
        } catch (err) {
            console.error('Error fetching products:', err.message);
        }
    };

    // Function to extract unique categories
    const extractCategories = (products) => {
        const uniqueCategories = [...new Set(products.map(item => item.product_category))];
        setCategories(uniqueCategories);
    };

    useEffect(() => {
        getProduct();
    }, []);

    const handleAddItem = (newItem) => {
        const newItemsList = [...product, { product_id: Date.now(), ...newItem }];
        setProduct(newItemsList);
        setFilteredItems(newItemsList);
        extractCategories(newItemsList); // Update categories when adding new item
        setIsModalOpen(false);
    };

    const handleRemoveItem = async (id) => {
        try {
            await fetch(`http://localhost:5000/menu/delete-product/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const updatedItems = product.filter(item => item.product_id !== id);
            setProduct(updatedItems);
            setFilteredItems(updatedItems);
            extractCategories(updatedItems); // Update categories after removal
            setShowConfirmRemove(false);
            setItemToRemove(null);
        } catch (err) {
            console.error('Error removing item:', err.message);
        }
    };

    const handleEditItem = (id) => {
        const itemToEdit = product.find(item => item.product_id === id);
        setEditingItem(itemToEdit);
        setIsModalOpen(true);
    };

    const confirmRemoveItem = (id) => {
        setItemToRemove(id);
        setShowConfirmRemove(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmRemove(false);
        setItemToRemove(null);
    };

    const handleConfirmRemoval = () => {
        handleRemoveItem(itemToRemove);
    };

    const handleSortByName = () => {
        const sortedItems = [...filteredItems].sort((a, b) => a.product_name.localeCompare(b.product_name));
        setFilteredItems(sortedItems);
    };

    const handleSortByQuantity = () => {
        const sortedItems = [...filteredItems].sort((a, b) => a.product_quantity - b.product_quantity);
        setFilteredItems(sortedItems);
    };

    const handleSortByCategory = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category === "All" || category === "") {
            setFilteredItems(product);
        } else {
            const filtered = product.filter(item => item.product_category === category);
            setFilteredItems(filtered);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            const filtered = product.filter(item =>
                item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, product]);

    return (
        <section className={styles.inventorySection}>
            <div className={styles.inventoryContainer}>
                <h2 className={styles.h2}>Inventory Management</h2>
                <div className={styles.actions}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                            aria-label="Search items"
                        />
                    </div>
                    <div className={styles.topButtons}>
                        <button className={styles.buttons} onClick={handleSortByName}>Sort by Name</button>
                        <button className={styles.buttons} onClick={handleSortByQuantity}>Sort by Quantity</button>
                        <select
                            className={styles.category}
                            value={selectedCategory}
                            onChange={handleSortByCategory}
                        >
                            <option value="All">All</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>Add Item</button>
                    </div>
                </div>

                <div className={styles.itemList}>
                    <table className={styles.itemTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Image Path</th>
                                <th>Description</th>
                                <th>Items</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((p) => (
                                    <Item
                                        key={p.product_id}
                                        item={p}
                                        onEdit={() => handleEditItem(p.product_id)}
                                        onRemove={() => confirmRemoveItem(p.product_id)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className={styles.emptyRow}>No items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <AddItemModal
                        item={editingItem}
                        onAddItem={handleAddItem}
                        onUpdateItem={(updatedItem) => {
                            const updatedItems = product.map(item => 
                                (item.product_id === updatedItem.product_id ? updatedItem : item));
                            setProduct(updatedItems);
                            setFilteredItems(updatedItems);
                            extractCategories(updatedItems); // Update categories when updating item
                            setEditingItem(null);
                            setIsModalOpen(false);
                        }}
                        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                    />
                )}

                {showConfirmRemove && itemToRemove !== null && (
                    <div className={styles.remove}>
                        <div className={styles.removeContent}>
                            <p className={styles.text1}>Are you sure you want to remove this item?</p>
                            <div className={styles.buttonGroup}>
                                <button className={styles.confirmButton} onClick={handleConfirmRemoval}>
                                    Yes, Remove Item
                                </button>
                                <button className={styles.confirmButton} onClick={handleCloseConfirmModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Inventory;
