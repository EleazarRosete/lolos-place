import React, { useState } from 'react';
import Order from './Order';

function OrderList() {
  const [orders, setOrders] = useState([
    { id: 1, name: 'Order 1', quantity: 1, price: 10 },
    { id: 2, name: 'Order 2', quantity: 2, price: 20 },
  ]);

  const removeOrder = (id) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
  };

  return (
    <div>
      {orders.map(order => (
        <Order
          key={order.id}
          name={order.name}
          quantity={order.quantity}
          price={order.price}
          onRemove={() => removeOrder(order.id)} // Pass the removal function
        />
      ))}
    </div>
  );
}

export default OrderList;
