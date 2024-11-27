import React, { useState, useEffect } from "react";
import axios from "axios";

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
        const dataResponse = await axios.get("http://localhost:5001/peak-hours-data");
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
    if (!peakHoursData) return "Loading insights...";

    const highestOrders = peakHoursData.highest_orders;

    return Object.entries(highestOrders)
      .map(([day, { hour, order_count }]) => {
        const time = formatHour(hour);
        return `${day}: Peak orders (${order_count}) at ${time}`;
      })
      .join(" | ");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {loading ? (
        <p style={{ fontSize: "18px", textAlign: "center", color: "#333" }}>
          Loading graph and insights...
        </p>
      ) : error ? (
        <p
          style={{
            color: "red",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {error}
        </p>
      ) : (
        <div>
          {graphUrl && (
            <img
              src={graphUrl}
              alt="Customer Peak Hours Graph"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}
          <div
            className="peak-hour-insight"
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              color: "#333",
              fontStyle: "italic",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              fontSize: "16px",
            }}
          >
            <strong>Insights:</strong> {generatePeakHourInsight()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPeakHoursGraph;
