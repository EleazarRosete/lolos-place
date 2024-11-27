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
    const [categories, setCategories] = useState([]);
    const [sortByQuantityAsc, setSortByQuantityAsc] = useState(true);
    const [sortByNameAsc, setSortByNameAsc] = useState(true);      

    const getProduct = async () => {
        try {
            const response = await fetch("http://localhost:5000/menu/get-product", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            console.log("Fetched products:", jsonData); // Debug log
            setProduct(jsonData);
            setFilteredItems(jsonData);
            extractCategories(jsonData);
        } catch (err) {
            console.error('Error fetching products:', err.message);
        }
    };

    const extractCategories = (products) => {
        const uniqueCategories = [...new Set(products.map(item => item.category))];
        setCategories(uniqueCategories);
    };

    useEffect(() => {
        getProduct();
    }, []);

    const handleAddItem = (newItem) => {
        const newItemsList = [...product, { menu_id: Date.now(), ...newItem }];
        console.log("Added new item:", newItem); // Debug log
        setProduct(newItemsList);
        setFilteredItems(newItemsList);
        extractCategories(newItemsList);
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

            const updatedItems = product.filter(item => item.menu_id !== id);
            console.log("Removed item with ID:", id); // Debug log
            setProduct(updatedItems);
            setFilteredItems(updatedItems);
            extractCategories(updatedItems);
            setShowConfirmRemove(false);
            setItemToRemove(null);
        } catch (err) {
            console.error('Error removing item:', err.message);
        }
    };

    const handleEditItem = (id) => {
        const itemToEdit = product.find(item => item.menu_id === id);
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
        const sortedItems = [...filteredItems].sort((a, b) => {
            return sortByNameAsc
                ? a.name.localeCompare(b.name) // A-Z
                : b.name.localeCompare(a.name); // Z-A
        });
        setFilteredItems(sortedItems);
        setSortByNameAsc(!sortByNameAsc); // Toggle sorting direction
    };

    const handleSortByQuantity = () => {
        const sortedItems = [...filteredItems].sort((a, b) => {
            return sortByQuantityAsc
                ? a.stocks - b.stocks // Lowest to Highest
                : b.stocks - a.stocks; // Highest to Lowest
        });
        setFilteredItems(sortedItems);
        setSortByQuantityAsc(!sortByQuantityAsc); // Toggle sorting direction
    };

    const handleSortByCategory = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category === "All" || category === "") {
            setFilteredItems(product);
        } else {
            const filtered = product.filter(item => item.category === category);
            setFilteredItems(filtered);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            const filtered = product.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered.length > 0 ? filtered : product);
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
                                <th>Image</th>
                                <th>Description</th>
                                <th>Items</th>
                                <th>Stocks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((p) => (
                                    <Item
                                        key={p.menu_id}
                                        item={p}
                                        onEdit={() => handleEditItem(p.menu_id)}
                                        onRemove={() => confirmRemoveItem(p.menu_id)}
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
                                (item.menu_id === updatedItem.menu_id ? updatedItem : item));
                            setProduct(updatedItems);
                            setFilteredItems(updatedItems);
                            extractCategories(updatedItems);
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
