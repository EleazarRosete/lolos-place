import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './CustomerReviewsGraph.module.css'; // Assuming the CSS file is named CustomerReviewsGraph.module.css

const CustomerReviewsGraph = () => {
  const [graphImage, setGraphImage] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);

        // Fetch the graph image
        const graphResponse = await axios.post(
          'http://localhost:5001/feedback-graph',
          {},
          { responseType: 'blob' }
        );
        const imageUrl = URL.createObjectURL(graphResponse.data);
        setGraphImage(imageUrl);

        // Fetch the feedback statistics
        const statsResponse = await axios.get('http://localhost:5001/feedback-stats');
        setFeedbackStats(statsResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Error fetching data or graph');
        setLoading(false);
        console.error(err);
      }
    };

    fetchGraphData();
  }, []);

  const generateDynamicInsight = () => {
    if (!feedbackStats) return 'Loading insights...';

    const { total, positive, negative, neutral } = feedbackStats;
    const positivePercent = ((positive / total) * 100).toFixed(1);
    const negativePercent = ((negative / total) * 100).toFixed(1);
    const neutralPercent = ((neutral / total) * 100).toFixed(1);

    if (positive > negative && positive > neutral) {
      return `The majority of feedback (${positivePercent}%) is positive, reflecting strong customer satisfaction.`;
    } else if (negative > positive && negative > neutral) {
      return `The majority of feedback (${negativePercent}%) is negative, indicating areas for improvement in customer satisfaction.`;
    } else if (neutral > positive && neutral > negative) {
      return `Most feedback (${neutralPercent}%) is neutral, suggesting mixed customer experiences.`;
    } else {
      return `Feedback sentiment is evenly distributed: Positive (${positivePercent}%), Negative (${negativePercent}%), Neutral (${neutralPercent}%).`;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading data...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <section className={styles.section}>
      <div className={styles.graphContainer}>
        {graphImage ? (
          <>
            <img
              src={graphImage}
              alt="Customer Feedback Graph"
              className={styles.customerReviewsGraph}
            />
            <div className={styles.feedbackGraph}>
              <strong>Insights: </strong>
              <p>{generateDynamicInsight()}</p>
            </div>
          </>
        ) : (
          <p className={styles.loading}>Loading graph...</p>
        )}
      </div>
    </section>
  );
};

export default CustomerReviewsGraph;
