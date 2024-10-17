import React, { useState, useEffect } from 'react';
import styles from './POS.module.css';
import Product from './Product/Product.jsx';

// Food Image
import narutoPic from '../../assets/Food Images/Naruto_newshot.png';

function POS() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('1'); // default to 'All'
    const [products] = useState([
        { 
            id: 1, 
            name: "Naruto Ramen -Naruto Shippuden x2 x2 x2 x2 efwqef wqef wqe fwq", 
            category: "Main", 
            image: narutoPic, 
            price: 300, 
            description: "Good for 2 people", 
            items: null
        },
        { 
            id: 2, 
            name: "Adobong Manok", 
            category: "Main", 
            image: narutoPic, 
            price: 400, 
            description: "Good for 3 people", 
            items: null 
        },
        { 
            id: 3, 
            name: "Set A", 
            category: "Soup", 
            image: narutoPic, 
            price: 700, 
            description: "Good for 5 people", 
            items: ["Nilaga", "Rice - x2", "Sinigang", "Nilaga", "Rice - x2", "Sinigang","Nilaga", "Rice - x2", "Sinigang","Nilaga", "Rice - x2", "Sinigang"]
        },
        { 
            id: 4, 
            name: "Sinigang", 
            category: "Soup", 
            image: narutoPic, 
            price: 250, 
            description: "Good for 1 person", 
            items: null
        },
        { 
            id: 5, 
            name: "Pancit Canton", 
            category: "Main", 
            image: narutoPic, 
            price: 150, 
            description: "Good for 1 person", 
            items: null 
        }
    ]);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [order, setOrder] = useState([]); // State to manage the order

    // Function to filter by category and search term
    const filterProducts = () => {
        let filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedCategory !== '1') {
            filtered = filtered.filter(product => product.category === getCategoryName(selectedCategory));
        }

        setFilteredProducts(filtered);
    };

    // Helper function to get category name from value
    const getCategoryName = (value) => {
        switch (value) {
            case '2': return 'Main';
            case '3': return 'Soup';
            case '4': return 'Drinks';
            default: return 'All';
        }
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Reapply filter whenever search term or category changes
    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedCategory]);

    // Separate individual products and bundles
    const individualProducts = filteredProducts.filter(product => !product.items); // No items means it's an individual product
    const bundles = filteredProducts.filter(product => product.items); // If items array exists, it's a bundle/set

    // Function to add product to the order
    const addToOrder = (product) => {
        const existingOrderItem = order.find(item => item.name === product.name);

        if (existingOrderItem) {
            // Update quantity if item already exists in the order
            setOrder(order.map(item => 
                item.name === product.name 
                    ? { ...item, quantity: item.quantity + product.quantity } 
                    : item
            ));
        } else {
            // Add new item to the order
            setOrder([...order, { ...product }]);
        }
    };

    // Function to handle placing the order (e.g., reset the order or send it to a backend)
    const placeOrder = () => {
        if (order.length > 0) {
            console.log('Order placed:', order);
            alert('Order placed successfully!');
            setOrder([]); // Reset the order after placing it
        } else {
            alert('No items in the order!');
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.posContainer}>
                <div className={styles.navbar}>
                    <form action="#" className={styles.forms}>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                className={styles.searchBar} 
                                placeholder="Search..." 
                                name="search"
                                value={searchTerm} // Bind input to search term state
                                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                            />
                        </div>
                        <div className={styles.filterContainer}>
                            <select value={selectedCategory} onChange={handleCategoryChange}>
                                <option value="1">All</option>
                                <option value="2">Main</option>
                                <option value="3">Soup</option>
                                <option value="4">Drinks</option>
                            </select>
                        </div>
                    </form>
                </div>
                
                <div className={styles.menuContainer}>
                    <h3 className={styles.categoryTitle}>Individual Products</h3>
                    <div className={styles.individualProductsContainer}>
                        {individualProducts.length > 0 ? (
                            individualProducts
                                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
                                .map(product => (
                                    <Product 
                                        key={product.id} 
                                        image={product.image} 
                                        name={product.name}
                                        price={product.price}
                                        description={product.description}
                                        items={product.items}
                                        onAddToOrder={addToOrder} // Pass add to order function
                                    />
                                ))
                        ) : (
                            <p className={styles.pText}>No individual products found</p>
                        )}
                    </div>

                    <h3 className={styles.categoryTitle}>Bundles/Sets</h3>
                    <div className={styles.bundleContainer}>
                        {bundles.length > 0 ? (
                            bundles
                                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
                                .map(product => (
                                    <Product 
                                        key={product.id} 
                                        image={product.image} 
                                        name={product.name}
                                        category={product.category}
                                        price={product.price}
                                        description={product.description}
                                        items={product.items}
                                        onAddToOrder={addToOrder} // Pass add to order function
                                    />
                                ))
                        ) : (
                            <p className={styles.pText}>No bundles found</p>
                        )}
                    </div>
                </div>

                <div className={styles.orderContainer}>
                    <h1 className={styles.orderTxt}>ORDERS</h1>
                    <div className={styles.orders}>
                        {order.length > 0 ? (
                            order.map((item, index) => (
                                <div key={index} className={styles.orderItem}>
                                    <p>{item.name} - ₱{item.price} x {item.quantity}</p>
                                </div>
                            ))
                        ) : (
                            <p className={styles.pText}>No items in the order</p>
                        )}
                    </div>
                    <button className={styles.placeOrder} onClick={placeOrder}>
                        Place Order
                    </button>
                </div>
            </div>
        </section>
    );
}

export default POS;
