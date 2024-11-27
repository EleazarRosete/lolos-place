import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="customer-reviews-graph" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {graphImage ? (
        <>
          <img
            src={graphImage}
            alt="Customer Feedback Graph"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              fontSize: '16px',
            }}
          >
            <strong>Insights: </strong>
            <p>{generateDynamicInsight()}</p>
          </div>
        </>
      ) : (
        <p>Loading graph...</p>
      )}
    </div>
  );
};

export default CustomerReviewsGraph;
