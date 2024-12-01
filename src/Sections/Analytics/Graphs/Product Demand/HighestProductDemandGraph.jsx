import React, { useEffect, useState } from 'react';
import styles from './ProductDemandGraph.module.css';

const HighestProductDemandData = () => {
  const [productData, setProductData] = useState(null);
  const [graphSvg, setGraphSvg] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const graphResponse = await fetch('http://localhost:5001/highest-selling-products', {
          method: 'POST',
        });
        if (graphResponse.ok) {
          const graphText = await graphResponse.text();
          setGraphSvg(graphText);
        } else {
          console.error('Error fetching graph:', graphResponse.statusText);
        }

        const dataResponse = await fetch('http://localhost:5001/highest-selling-products-data', {
          method: 'POST',
        });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setProductData(data);
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
      <div className={styles.graphFeedbackContainer}>
        <div className={styles.graphContainer}>
          <div dangerouslySetInnerHTML={{ __html: graphSvg }} className={styles.salesGraph} />
        </div>

        <div className={styles.feedbackGraph}>
          <h3>Product Sold</h3>
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
    </div>
  );
};

export default HighestProductDemandData;
