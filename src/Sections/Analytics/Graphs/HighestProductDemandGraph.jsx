import React, { useEffect, useState } from 'react';

const HighestProductDemandData = () => {
  const [productData, setProductData] = useState(null);
  const [graphSvg, setGraphSvg] = useState(null);

  useEffect(() => {
    // Fetch the highest selling products data from the backend
    const fetchProductData = async () => {
      try {
        // Fetch the graph SVG data
        const graphResponse = await fetch('http://localhost:5001/highest-selling-products', {
          method: 'POST',
        });
        if (graphResponse.ok) {
          const graphText = await graphResponse.text(); // Get SVG as text
          setGraphSvg(graphText); // Set the SVG content
        } else {
          console.error('Error fetching graph:', graphResponse.statusText);
        }

        // Fetch the data for the highest selling products
        const dataResponse = await fetch('http://localhost:5001/highest-selling-products-data', {
          method: 'POST',
        });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setProductData(data); // Set the fetched data
        } else {
          console.error('Error fetching data:', dataResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProductData();
  }, []);

  if (!graphSvg || !productData) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      <h2>Top 5 Highest Selling Products</h2>

      {/* Display the graph SVG */}
      <div>
        <h3>Highest Selling Products - Graph</h3>
        <div
          dangerouslySetInnerHTML={{ __html: graphSvg }} // Render the SVG content directly
        />
      </div>

      {/* Display the insights table */}
      <div>
        <h3>Product Insights</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Total Quantity Sold</th>
            </tr>
          </thead>
          <tbody>
            {productData.map((product, index) => (
              <tr key={index}>
                <td>{product.product_name}</td>
                <td>{product.total_quantity_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HighestProductDemandData;
