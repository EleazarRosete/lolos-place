import React, { useState, useEffect } from 'react';
import styles from './POS.module.css';
import Product from './Product/Product.jsx';
import Order from './Order/Order.jsx';

function POS() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceCharge, setServiceCharge] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [payment, setPayment] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orderDetails, setOrderDetails] = useState(false);
    const [GCashDetails, setGCashtDetails] = useState(false);
    const [CashDetails, setCashDetails] = useState(false);
    const [receipt, setReceipt] = useState(false);
    const [order, setOrder] = useState([]);
    const [input, setInput] = useState('');
    const [change, setChange] = useState('0.00')
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [orderType, setOrderType] = useState(null);
    const [amount, setAmount] = useState(0);
    const [ifDelivery, setIfDelivery] = useState('false');
    const [reservationID, setReservationID] = useState(null);
    const [paymentID, setPaymentID] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paidOrder, setPaidOrder] = useState({
        mop: '',
        total_amount: '' ,
        delivery: '',
        reservation_id: '',
        order_type: '',
        items: []
    });
    const [salesData, setSalesData] = useState({
        amount:'',
        service_charge:'',
        gross_sales:'',
        product_name:'',
        category:'',
        quantity_sold:'',
        price_per_unit:'',
        mode_of_payment:'',
        order_type:''
    });


    useEffect(() => {
        if (receipt) {
          const timer = setTimeout(() => {
            handleCloseReceipt();
          }, 1000); // 3000ms = 3 seconds
      
          return () => clearTimeout(timer); // Cleanup timeout if the component is unmounted or receipt changes
        }
      }, [receipt]);

    const calculateServiceCharges = async () => {
        let totalServiceCharge = 0; // Initialize a variable to accumulate service charges
      
        await Promise.all(
          order.map(async (orderedItem) => {
            const product = products.find(p => p.menu_id === orderedItem.menu_id); // Find the product based on menu_id
            if (product) {
              const serviceChargePerItem = product.price * 0.1; // Calculate 10% service charge per item
              totalServiceCharge += serviceChargePerItem * orderedItem.quantity; // Multiply by quantity to get the total service charge for this order
            }
          })
        );
        
        setServiceCharge(totalServiceCharge.toFixed(2)); // Update the state with the accumulated service charge
      };
      
      
      useEffect(() => {
        if (order.length > 0) {
          calculateServiceCharges();
        }
      }, [order]);

    const handleOpenModal = () => {
        setShowModal(true); // Open the confirmation modal
        ifPaid();
      };
    
      const handleCloseModal = () => {
        setShowModal(false); // Close the modal without submitting
      };
    
      const handleConfirmPayment = () => {
        submitOrder(); // Proceed with the order submission
        setShowModal(false); // Close the modal after submitting
      };

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        items: [''],
        img: '',
        stocks: '',
    });

    const handleClick = (value) => {
        setInput((prevInput) => prevInput + value);
    };

    const handleClear = () => {
        setInput('');
    };

    const handleCalculate = () => {
        try {
            setInput(eval(input).toString()); 
            setChange(eval(input).toString());// eval evaluates the expression
        } catch (error) {
            setInput('Error');
        }
    };

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await fetch("http://localhost:5000/menu/get-product", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await response.json();
        
                // Sort the products alphabetically by name
                const sortedData = jsonData.sort((a, b) => a.name.localeCompare(b.name));
        
                setProducts(sortedData);
                setFilteredProducts(sortedData);
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
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => product.category === category);
            setFilteredProducts(filtered);
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

    const addToOrder = (menu_id, name, price, stocks, quantity) => {
        setQuantity(quantity);

        setOrder(prevOrder => {
            const existingOrderItem = prevOrder.find(item => item.menu_id === menu_id);



            if (existingOrderItem) {
                return prevOrder.map(item =>
                    item.menu_id === menu_id
                        ? {
                            ...item,
                            quantity: item.quantity + quantity,
                            total: (item.quantity + quantity) * item.price
                        }
                        : item
                );
            } else {
                return [
                    ...prevOrder,
                    { menu_id, name, price, stocks, quantity, total: price * quantity}
                ];
            }

        });
    };
    
    const modifyOrder = (menu_id, name, price, stocks, quantity) => {
        setOrder(prevOrder => {
            const existingOrderItem = prevOrder.find(item => item.menu_id === menu_id);
    
            if (existingOrderItem) {
                // Update the quantity and total without adding to the previous quantity
                return prevOrder.map(item =>
                    item.menu_id === menu_id
                        ? {
                            ...item,
                            quantity: quantity,  // Use the received quantity directly
                            total: quantity * price // Calculate the total with the new quantity
                        }
                        : item
                );
            } else {
                // Add a new item with the given quantity and calculated total
                return [
                    ...prevOrder,
                    { menu_id, name, price, stocks, quantity, total: price * quantity }
                ];
            }
        });
    };

    
    const handleCancelOrder = () => {
        setOrderDetails(false);
        setOrderType(null);
        setPaymentMethod(null);
    };

    const placeOrder = async () => {
        if (order.length > 0) {
            setOrderDetails(true);
        } else {
            alert('No items in the order!');
        }
    };


    const submitOrder = async () => {
       
            setShowModal(false);
        if (isPaid && !loading) {  // Check if the order is paid and not already loading
            setLoading(true);  // Set loading state to true to block subsequent clicks
            setInput('');  // Reset input field
                


            const paidOrder = {
                mop: paymentMethod,
                total_amount: amount,
                delivery: ifDelivery === 'true',
                reservation_id: reservationID,
                order_type: orderType,
                items: order
            };
    
            try {
                const updateStockPromises = order.map(async ({ menu_id, quantity }) => {
                    const response = await fetch(`http://localhost:5000/menu/update-product-stock/${menu_id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quantity })
                    });
                    if (!response.ok) throw new Error(`Error updating stock: ${response.statusText}`);
                    setProducts(prevProducts =>
                        prevProducts.map(product =>
                            product.menu_id === menu_id ? { ...product, stocks: product.stocks - quantity } : product
                        )
                    );
                });
    
                // Wait for all stock updates to complete
                await Promise.all(updateStockPromises);
    
                // Add the order to the server
                const response = await fetch(`http://localhost:5000/order/add-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(paidOrder)
                });
    
                if (!response.ok) throw new Error(`Error adding order: ${response.statusText}`);

                const salesPromises = order.map(async (orderedItem, i) => {
                    const product = products.find(p => p.menu_id === orderedItem.menu_id);
                    console.log(product.price);
                    console.log(product.name);
                    console.log(product.price);



                    if (product) {
                        const price = parseFloat(product.price) || 0;
                        console.log("PROCEEEE", price);
                        const updatedSalesData = {
                            ...salesData,
                            amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
                            service_charge: parseFloat((price * 0.1).toFixed(2)),
                            gross_sales: parseFloat((price + price * 0.1)*orderedItem.quantity.toFixed(2)),
                            product_name: product.name,
                            category: product.category,
                            quantity_sold: orderedItem.quantity,
                            price_per_unit: parseFloat(price.toFixed(2)),
                            mode_of_payment: paymentMethod,
                            order_type: orderType,
                        };
                        console.log("Updated Sales Data for index ", i, updatedSalesData);
                        

                        try {
                            const response = await fetch('http://localhost:5000/sales/add-sales', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updatedSalesData),
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                console.error("Error response from server:", errorData);
                                throw new Error(`Error adding sales data: ${errorData.message}`);
                            }

                            const data = await response.json();
                            console.log("Sales data added successfully:", data);
                        } catch (err) {
                            console.error("Error adding sales data:", err.message);
                        }

                    }
                });
                
                await Promise.all(salesPromises);
                
                
    

    
                // Fetch updated payment data
                const paymentResponse = await fetch("http://localhost:5000/payment/get-payment", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await paymentResponse.json();
                setPayment(jsonData);
    
                setPaymentID(jsonData[jsonData.length - 1].payment_id);  // Assuming jsonData contains the payment array
    
                // Reset order-related states
                setAmount(0);
                setIfDelivery('false');
                setReservationID(null);
                setOrderType(null);
                setPaymentMethod(null);
                setOrderDetails(false);
                setCashDetails(false);
                setReceipt(true);
                setIsPaid(false);
            } catch (err) {
                console.error('Error processing order:', err.message);
                alert('There was an error processing your order. Please try again.');
            } finally {
                setLoading(false);  // Reset loading state
            }
        } else {
            alert("The order must be paid before proceeding");
        }
    };
    

    
    const handleCloseReceipt  = () =>{
        setReceipt(false);
        setOrder([]);
        setPaidOrder([]); // Clear paidOrder
    }


    const handleGCashPayment = async () => {
        const admin = 14;
        
        const body = {
            user_id: admin,
            lineItems: order.map(product => ({
                quantity: product.quantity,
                name: product.name,
                price: product.price
            })),
        };
    
        try {
            const response = await fetch('http://localhost:5000/api/create-gcash-checkout-session', {
                method: 'POST',  // Ensure POST method is used
                headers: {
                    'Content-Type': 'application/json',  // Set the content type to JSON
                },
                body: JSON.stringify(body),  // Convert body to JSON
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // Handle non-200 status codes
            }
    
            const responseData = await response.json(); // Parse the response as JSON
            const { url } = responseData; // Extract 'url' from response
            window.location.href = url;
        } catch (error) {
            console.error('Error initiating payment:', error);
        }
    };
    

    const processOrder = () => {
        const serviceCharge = order.reduce((total, item) =>(total + item.total) * 0.1, 0);
        const total = order.reduce((total, item) => total + item.total, 0) + serviceCharge;
        setAmount(total);
        


        // setAmount(total);
        console.log("mop", paymentMethod, "OT",orderType, 'amount', amount, order);

        if(paymentMethod == null || orderType == null){
            alert("Select a payment method and order type")
        }
        else{

                if(paymentMethod == "GCash"){
                    handleGCashPayment();
                    setCashDetails(false);
                    setOrderDetails(true);
                }
                else{
                    setGCashtDetails(false);
                    setCashDetails(true);
                    setOrderDetails(false);
                }
             
        }
    }

    const handleRemoveFromCart = (index) => {
        setOrder(prevOrder => prevOrder.filter((_, idx) => idx !== index));
    };


    const handleCancelPayment = () => {
        setCashDetails(false);
        setGCashtDetails(false);
        setOrderDetails(true);  
        setChange('0.00');
        setInput('');
    };

    const selectPaymentMethod = (e) => {
        setPaymentMethod(e.target.value)
    }

    const selectOrderType = (e) => {
        setOrderType(e.target.value)
        console.log(orderType);
    }

    const makePaymentGCash = async () => {
        const body = {
            user_id: customer.id,
            lineItems: cartItems.map(product => ({
                quantity: product.quantity,
                name: product.name,
                price: product.price
            })),
        };
    
        try {
            const response = await axios.post('http://localhost:5000/payment/create-gcash-checkout-session', body);
    
            const { url } = response.data;
    
            window.location.href = url;
        } catch (error) {
            console.error('Error initiating payment:', error);
        }
    }

    const ifPaid = () =>{
        setIsPaid(true); 
    }



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
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();  // Disable Enter key action
        }
    }}
/>

                        </div>

                        <div className={styles.filterContainer}>
                            <select
                                className={styles.category}
                                value={selectedCategory}
                                onChange={handleSortByCategory}
                            >
                                <option value="All">All</option>
                                {Array.from(new Set(categories.filter(category => category)) // Remove falsy values like null/undefined
                                    ).map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
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
                                    key={product.menu_id}
                                    menu_id={product.menu_id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.img}
                                    description={product.description}
                                    items={product.items}
                                    stock={product.stocks}
                                    onAddToOrder={addToOrder}
                                    number={quantity}
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
                            order.map((orders, index) => (
                                <Order
                                    key={orders.menu_id}
                                    id={orders.menu_id}
                                    name={orders.name}
                                    price={orders.price}
                                    stock={orders.stocks}
                                    order={orders.quantity}
                                    total={orders.total}
                                    onAddToOrder={modifyOrder}
                                    onRemove={handleRemoveFromCart}
                                    index={index}
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

            {orderDetails && (
                <div className={styles.modalPOS}>
                <div className={styles.orderDetails}>
                    <h2 className={styles.orderDetailsHeader}>Order Summary</h2>

                    <div className={styles.orderItems}>
                        {order.length > 0 ? (
                            order.map((orders, index) => (
                                <div key={orders.menu_id} className={styles.orderItem}>
                                    <p><strong>{orders.name}</strong></p>
                                    <p>Qty: {orders.quantity}</p>
                                    <p>Price: ₱{orders.price}</p>
                                    <p>Subtotal: ₱{orders.total}</p>
                                </div>
                            ))
                        ) : (
                            <p className={styles.pText}>No orders yet</p>
                        )}
                    </div>
 
                    <h3 className={styles.totalAmount} >Total Amount: ₱{order.reduce((total, item) => total + item.total, 0)}</h3>
                    <div className={styles.paymentOptions}>
                        <label>
                            <input type="radio" name="payment" value="GCash" checked={paymentMethod === 'GCash'}
                    onClick={selectPaymentMethod} /> GCash
                        </label>
                        <label>
                            <input type="radio" name="payment" value="Cash" checked={paymentMethod === 'Cash'}
                    onClick={selectPaymentMethod}/> Cash
                        </label>
                    </div>

                    <div className={styles.additionalOptions}>
                    <label>
                            <input type="radio" name="order" value="Dine-in" checked={orderType === 'Dine-in'}
                    onClick={selectOrderType}/> Dine-in
                        </label>
                        <label>
                            <input type="radio" name="order" value="Take-out" checked={orderType === 'Take-out'}
                    onClick={selectOrderType}/> Take-out
                        </label>

                    </div>

                    <button className={styles.confirmOrderButton} onClick={processOrder}>
                        Confirm Order
                    </button>
                    <button className={styles.cancelOrderButton} onClick={handleCancelOrder}>
                        Cancel
                    </button>
                </div>
                </div>
            )}

{CashDetails && (
                    <div className={styles.modalPOS}>
        <div className={styles.paymentDetails}>
          <h1 className={styles.cashHeader}>Cash Payment</h1>
          <div className={styles.contentContainer}>
            <div className={styles.calculator}>
              <div className={styles.display}>
                <input
                  type="text"
                  value={input}
                  placeholder="Calculator"
                  readOnly
                  className={styles.inputData}
                />
              </div>
              <div className={styles.calcButtons}>
                {/* Calculator Buttons */}
                <button className={styles.calcButton} onClick={() => handleClick('1')}>1</button>
                <button className={styles.calcButton} onClick={() => handleClick('2')}>2</button>
                <button className={styles.calcButton} onClick={() => handleClick('3')}>3</button>
                <button className={styles.calcButton} onClick={() => handleClick('+')}>+</button>

                <button className={styles.calcButton} onClick={() => handleClick('4')}>4</button>
                <button className={styles.calcButton} onClick={() => handleClick('5')}>5</button>
                <button className={styles.calcButton} onClick={() => handleClick('6')}>6</button>
                <button className={styles.calcButton} onClick={() => handleClick('-')}>-</button>

                <button className={styles.calcButton} onClick={() => handleClick('7')}>7</button>
                <button className={styles.calcButton} onClick={() => handleClick('8')}>8</button>
                <button className={styles.calcButton} onClick={() => handleClick('9')}>9</button>
                <button className={styles.calcButton} onClick={() => handleClick('*')}>*</button>

                <button className={styles.calcButton} onClick={() => handleClick('0')}>0</button>
                <button className={styles.calcButton} onClick={handleClear}>C</button>
                <button className={styles.calcButton} onClick={handleCalculate}>=</button>
                <button className={styles.calcButton} onClick={() => handleClick('/')}>/</button>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.paymentInfo}>
              <h1 className={styles.headerPayment}>Order Items:</h1>

                <div className={styles.orderItems}>
                  {order.length > 0 ? (
                    order.map((orders, index) => (
                      <div key={orders.menu_id} className={styles.orderItem}>
                        <p className={styles.txtStyles}><strong>{orders.name}</strong></p>
                        <p>Qty: {orders.quantity}</p>
                        <p>Price: ₱{orders.price}</p>
                        <p>Subtotal: ₱{orders.total}</p>
                      </div>
                    ))
                  ) : (
                    <p className={styles.pText}>No orders yet</p>
                  )}
                </div>
                <h3 className={styles.sum}>
                  Order Total: ₱{order.reduce((total, item) => total + item.total, 0).toFixed(2)}
                </h3>
                <h3 className={styles.sum}>
                  Service charge(10%): ₱{serviceCharge}
                </h3>
                <h3 className={styles.sum}>
  Total Amount: ₱{
    (order.reduce((total, item) => total + item.total, 0) + parseFloat(serviceCharge)).toFixed(2)
  }
</h3>

                <h3 className={styles.sum}>Change: ₱{change}</h3>
              </div>

              {/* Removed the checkbox, now a modal will handle the PAID state */}

              <div className={styles.navButton}>
                <button className={styles.cancelPaymentButton} onClick={handleCancelPayment}>CANCEL</button>

                {/* Proceed button, disabled until confirmed */}
                <button 
                  onClick={handleOpenModal} 
                  className={styles.cancelPaymentButton}
                >
                  PROCEED
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

      )}

                {receipt && (
                    <div className={styles.modalPOS}>

                    <div className={styles.orderReceipt}>
                        <h1>Successful!</h1>
                    </div>
                    </div>

                )}
    

                      {/* Modal for confirmation */}
      {showModal && (
        <div className={styles.modalPOS}>
          <div className={styles.modalConfirmation}>
            <h2>Confirm Payment</h2>
            <p>Are you sure you want to proceed with the payment?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleCloseModal} className={styles.cancelModalConfirmation}>CANCEL</button>
              <button onClick={submitOrder } disabled={loading} className={styles.cancelModalConfirmation}>CONTINUE</button>
            </div>
          </div>
        </div>
      )}
        </section>
    );
}

export default POS;
