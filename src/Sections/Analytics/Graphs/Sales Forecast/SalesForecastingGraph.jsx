import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SalesForecastingInsightsGraph.module.css";

const SalesForecastingInsights = () => {
  const [forecastData, setForecastData] = useState(null);
  const [graphUrl, setGraphUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesForecastData = async () => {
      try {
        setLoading(true);

        // Fetch the sales forecast data (not the image)
        const response = await axios.post(
          "http://localhost:5001/sales-forecast-data",
          {}
        );

        if (response.data && response.data.forecast_sales) {
          setForecastData(response.data);
        } else {
          setError("No sales forecast data available.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching sales forecast data:", err);
        setError("Failed to load sales forecast data. Please try again later.");
        setLoading(false);
      }
    };

    fetchSalesForecastData();
  }, []);

  const calculateInsights = (data) => {
    if (!data || data.forecast_sales.length === 0) return {};

    const totalSales = data.forecast_sales.reduce((acc, sales) => acc + sales, 0);
    const averageSales = totalSales / data.forecast_sales.length;
    const highestSales = Math.max(...data.forecast_sales);
    const lowestSales = Math.min(...data.forecast_sales);
    const highestMonthIndex = data.forecast_sales.indexOf(highestSales);
    const lowestMonthIndex = data.forecast_sales.indexOf(lowestSales);

    return {
      averageSales: averageSales.toFixed(2),
      highestSales: highestSales.toFixed(2),
      lowestSales: lowestSales.toFixed(2),
      highestMonth: data.forecast_dates[highestMonthIndex],
      lowestMonth: data.forecast_dates[lowestMonthIndex],
    };
  };

  const insights = forecastData ? calculateInsights(forecastData) : {};

  useEffect(() => {
    const fetchSalesForecastGraph = async () => {
      try {
        setLoading(true);

        const graphResponse = await axios.post(
          "http://localhost:5001/sales-forecast",
          {},
          { responseType: "blob" }
        );

        if (graphResponse.data) {
          const imageUrl = URL.createObjectURL(graphResponse.data);
          setGraphUrl(imageUrl);
        } else {
          setError("Failed to load the sales forecast graph.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching sales forecast graph:", err);
        setError("Failed to load sales forecast graph. Please try again later.");
        setLoading(false);
      }
    };

    fetchSalesForecastGraph();
  }, []);

  return (
    <div className={styles.section}>
      {loading ? (
        <p className={styles.loading}>Loading data...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.content}>
          <div className={styles.graphContainer}>
            {graphUrl && (
              <img
                src={graphUrl}
                alt="Sales Graph"
                className={styles.salesGraph}
              />
            )}
          </div>
          <div className={styles.insightsContainer}>
            <h2 className={styles.title}>Sales Insights</h2>
            <div className={styles.insight}>
              <h3>Average Monthly Sales</h3>
              <p>
                The average sales for the period are:{" "}
                <strong>₱{insights.averageSales}</strong>.
              </p>
            </div>
            <div className={styles.insight}>
              <h3>Highest and Lowest Sales</h3>
              <p>
                The highest sales occur in <strong>{insights.highestMonth}</strong>{" "}
                with <strong>₱{insights.highestSales}</strong>.
              </p>
              <p>
                The lowest sales occur in <strong>{insights.lowestMonth}</strong>{" "}
                with <strong>₱{insights.lowestSales}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesForecastingInsights;
  