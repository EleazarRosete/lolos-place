import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CustomerPeakHoursGraph.module.css";

const CustomerPeakHoursGraph = () => {
  const [graphUrl, setGraphUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [peakHoursData, setPeakHoursData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraphAndData = async () => {
      try {
        setLoading(true);

        // Fetch the graph image
        const graphResponse = await axios.post(
          "http://localhost:5001/peak-hours-graph",
          {},
          { responseType: "blob" }
        );
        const imageUrl = URL.createObjectURL(graphResponse.data);
        setGraphUrl(imageUrl);

        // Fetch the peak hours data
        const dataResponse = await axios.get(
          "http://localhost:5001/peak-hours-data"
        );
        setPeakHoursData(dataResponse.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching graph or data:", err);
        setError("Failed to load graph or insights. Please try again later.");
        setLoading(false);
      }
    };

    fetchGraphAndData();
  }, []);

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  const generatePeakHourInsight = () => {
    if (!peakHoursData) {
      return "Loading insights...";
    }
  
    const highestOrders = peakHoursData.highest_orders;
    const weekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
    return weekOrder
      .map((day) => {
        if (!highestOrders[day] || highestOrders[day].order_count === 0) {
          return `${day}: No orders`;
        }
  
        const { hour, order_count } = highestOrders[day];
        const time = formatHour(hour);
        return `${day}: Peak orders (${order_count}) at ${time}`;
      })
      .join("<br>"); // Use <br> for line breaks
  };
  
  return (
    <div className={styles.section}>
      {loading ? (
        <p className={styles.loading}>Loading graph and insights...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.graphContainer}>
          {graphUrl && (
            <img
              src={graphUrl}
              alt="Customer Peak Hours Graph"
              className={styles.customerReviewsGraph}
            />
          )}
        <div className={styles.feedbackGraph}>
          <strong>Insights:</strong>
          <p dangerouslySetInnerHTML={{ __html: generatePeakHourInsight() }} />
        </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPeakHoursGraph;
