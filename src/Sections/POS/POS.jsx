import React, { useState, useEffect } from 'react';
import styles from './POS.module.css';
import Product from './Product/Product.jsx';
import Order from './Order/Order.jsx';

function POS() {
    const [searchTerm, setSearchTerm] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]); // State for categories
    const [order, setOrder] = useState([]);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await fetch("http://localhost:5000/menu/get-product", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await response.json();
                setProducts(jsonData);
                setFilteredProducts(jsonData);
            } catch (err) {
                console.error('Error fetching products:', err.message);
            }
        };

        getProducts();
    }, []);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await fetch("http://localhost:5000/menu/get-categories", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await response.json();
                setCategories(jsonData);
            } catch (err) {
                console.error('Error fetching categories:', err.message);
            }
        };

        getCategories();
    }, []);

    const handleSortByCategory = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
    
        if (category === "All" || category === "") {
            setFilteredProducts(products); // Reset to full list of products
        } else {
            const filtered = products.filter(product => product.category === category);
            setFilteredProducts(filtered); // Set the filtered list of products
        }
    };
    
    

    useEffect(() => {
        const handler = setTimeout(() => {
            const filtered = products.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, products]);

    const addToOrder = async (menu_id, name, price, quantity) => {
        const existingOrderItem = order.find(item => item.menu_id === menu_id);
        setQuantity(quantity);

        // if (existingOrderItem) {
        //     setOrder(order.map(item =>
        //         item.menu_id === menu_id
        //             ? {
        //                 ...item,
        //                 stock: item.stocks + quantity,
        //                 total: (item.stocks + quantity) * item.price
        //             }
        //             : item
        //     ));
        // } else {
        //     setOrder([...order, {
        //         menu_id,
        //         name: name,
        //         price: price,
        //         quantity,
        //         total: price * quantity
        //     }]);
        // }

        // Update the stock in the database

        console.log(menu_id, quantity);
        try {
            const response = await fetch(`http://localhost:5000/menu/update-product-stock/${menu_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }), // Send stock to deduct
            });

            if (!response.ok) {
                throw new Error(`Error updating stock: ${response.statusText}`);
            }

            // Update the stock in the products state
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.menu_id === menu_id
                        ? { ...product, stocks: product.stocks - quantity } // Reduce stock in state
                        : product
                )
            );

        } catch (err) {
            console.error('Error updating product stock:', err.message);
        }
    };

    const placeOrder = () => {
        if (order.length > 0) {
            console.log('Order placed:', order);
            alert('Order placed successfully!');
            setOrder([]); // Reset the order after placing
        } else {
            alert('No items in the order!');
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.posContainer}>
                <div className={styles.navbar}>
                    <form className={styles.forms}>
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                className={styles.searchBar}
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterContainer}>
                        <select
                            className={styles.category}
                            value={selectedCategory}
                            onChange={handleSortByCategory}
                        >
                            <option value="All">All</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category} {/* Displaying the category name */}
                                </option>
                            ))}
                        </select>
                        </div>
                    </form>
                </div>
                
                <div className={styles.menuContainer}>
                    <div className={styles.productContainer}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <Product
                                    menu_id={product.menu_id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.img}
                                    description={product.description}
                                    items={product.items}
                                    stock={product.stocks}
                                    onAddToOrder={addToOrder}
                                />
                            ))
                        ) : (
                            <p className={styles.pText}>No products found</p>
                        )}
                    </div>
                </div>

                <div className={styles.orderContainer}>
                    <h1 className={styles.orderTxt}>ORDERS</h1>
                    <div className={styles.orders}>
                        {order.length > 0 ? (
                            order.map(orders => (
                                <Order
                                    id={orders.menu_id}
                                    name={orders.name}
                                    price={orders.price}
                                    stock={orders.stocks}
                                    quantity={quantity}
                                    onAddToOrder={addToOrder}
                                />
                            ))
                        ) : (
                            <p className={styles.pText}>No orders yet</p>
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
