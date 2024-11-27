import React, { useEffect, useState } from 'react';

const LowestProductDemandGraph = () => {
  const [chartData, setChartData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);

  useEffect(() => {
    // Fetch the lowest selling products graph (SVG format) from the backend
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://localhost:5001/lowest-selling-products', {
          method: 'POST', // Assuming POST method for fetching graph
        });
        if (response.ok) {
          const svgText = await response.text(); // Read response as text (SVG format)
          setChartData(svgText); // Set SVG content for rendering
        } else {
          console.error('Error fetching graph:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching graph:', error);
      }
    };

    // Fetch the data used for the graph (lowest-selling products data)
    const fetchInsightsData = async () => {
      try {
        const response = await fetch('http://localhost:5001/lowest-selling-products-data', {
          method: 'POST', // Fetch data for insights
        });
        if (response.ok) {
          const data = await response.json();
          setInsightsData(data); // Set the insights data
        } else {
          console.error('Error fetching insights:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      }
    };

    fetchGraphData();
    fetchInsightsData();
  }, []);

  if (!chartData || !insightsData) {
    return <div>Loading graph and insights...</div>;
  }

  return (
    <div>
      <h2>Top 5 Lowest Selling Products</h2>

      {/* Display the SVG graph */}
      <div>
        <h3>Lowest Selling Products Graph</h3>
        <div dangerouslySetInnerHTML={{ __html: chartData }} />
      </div>

      {/* Display the insights data */}
      <div>
        <h3>Insights</h3>
        <ul>
          {insightsData.map((item, index) => (
            <li key={index}>
              <strong>{item.product_name}</strong>: {item.total_quantity_sold} units sold
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LowestProductDemandGraph;
