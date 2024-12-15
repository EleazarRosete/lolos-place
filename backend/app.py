from flask import Flask, jsonify, request, send_file
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS
import plotly.graph_objects as go
import plotly.io as pio
import matplotlib.pyplot as plt
import io
import psycopg2
import numpy as np
import kaleido  # Ensure kaleido is installed
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime  # Import datetime module
import base64
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv(dotenv_path='./backend/.env')
admin_id = os.getenv('APP_PORT')
admin_id = int(admin_id)


app = Flask(__name__)
CORS(app)

analyzer = SentimentIntensityAnalyzer()

# Database connection setup
db_config = {
    'dbname': "lolos-place",
    'user': "postgres",
    'password': "password",  # Replace with your actual password
    'host': "localhost",
    'port': "5433"  # Ensure this is the correct port
}

# Function to get the database connection
def get_db_connection():
    return psycopg2.connect(**db_config)

@app.route('/highest-selling-products-data', methods=['POST'])
def highest_selling_products_data():
    try:
        # Connect to the database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # Execute query to fetch the highest-selling products
                cursor.execute("""
                    WITH product_sales AS (
                        SELECT 
                            product_name, 
                            SUM(quantity_sold) AS total_quantity_sold
                        FROM sales_data
                        GROUP BY product_name
                    ),
                    ranked_sales AS (
                        SELECT 
                            product_name,
                            total_quantity_sold,
                            RANK() OVER (ORDER BY total_quantity_sold DESC) AS rank_desc
                        FROM product_sales
                    )
                    SELECT 
                        product_name,
                        total_quantity_sold
                    FROM ranked_sales
                    ORDER BY total_quantity_sold DESC;
                """)
                data = cursor.fetchall()

        # Handle case where no sales data is found
        if not data:
            return jsonify({
                "message": "No sales data available for the highest-selling products",
                "data": []
            }), 404

        # Prepare response
        result = [
            {"product_name": row[0], "total_quantity_sold": row[1]} 
            for row in data
        ]
        return jsonify({"message": "Success", "data": result}), 200

    except psycopg2.DatabaseError as e:
        print("Database error:", e)
        return jsonify({"error": "A database error occurred. Please try again later."}), 500
    except Exception as e:
        print("Unexpected error:", e)
        return jsonify({"error": "An unexpected error occurred: " + str(e)}), 500
    





    
@app.route('/highest-selling-products', methods=['POST'])
def product_demand_per_month():
    try:
        year = request.args.get('year')  # Capture year parameter from query string
        month = request.args.get('month')  # Capture month parameter from query string
        if not year or not month:
            return jsonify({"error": "Year and month are required"}), 400  # Handle missing year or month
        
        # Connect to the database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                 WITH monthly_sales AS (
                    SELECT 
                        product_name,
                        DATE_TRUNC('month', date::DATE) AS sale_month,
                        SUM(quantity_sold) AS total_quantity_sold
                    FROM sales_data
                    WHERE EXTRACT(YEAR FROM date::DATE) = %s  -- Filter by year
                    AND EXTRACT(MONTH FROM date::DATE) = %s  -- Filter by month
                    GROUP BY product_name, DATE_TRUNC('month', date::DATE)
                    ORDER BY sale_month, total_quantity_sold DESC
                 )
                 SELECT 
                    sale_month,
                    product_name,
                    total_quantity_sold
                 FROM monthly_sales;
                """, (year, month))
                data = cursor.fetchall()

        if not data:
            return jsonify({"error": "No sales data available for the given month and year"}), 404

        # Prepare data for visualization
        result = {}
        for row in data:
            month = row[0].strftime('%Y-%m')  # Format date as Year-Month
            if month not in result:
                result[month] = []
            result[month].append({"product_name": row[1], "quantity_sold": row[2]})

        return jsonify(result)

    except psycopg2.Error as e:
        print("Database error:", e)
        return jsonify({"error": "Database error: " + str(e)}), 500
    except Exception as e:
        print("General error:", e)
        return jsonify({"error": "Error in fetching product demand per month: " + str(e)}), 500



@app.route('/lowest-selling-products-data', methods=['POST'])
def lowest_selling_products_data():
    try:
        # Connect to the database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    WITH product_sales AS (
                        SELECT 
                            product_name, 
                            SUM(quantity_sold) AS total_quantity_sold
                        FROM sales_data
                        GROUP BY product_name
                    ),
                    ranked_sales AS (
                        SELECT 
                            product_name,
                            total_quantity_sold,
                            RANK() OVER (ORDER BY total_quantity_sold ASC) AS rank_asc
                        FROM product_sales
                    )
                    SELECT 
                        product_name,
                        total_quantity_sold
                    FROM ranked_sales
                    WHERE rank_asc <= 5;
                """)
                data = cursor.fetchall()

        # If no data is found
        if not data:
            return jsonify({"error": "No sales data available for the lowest-selling products"}), 404

        # Prepare the data to be returned in JSON format
        result = [{'product_name': row[0], 'total_quantity_sold': row[1]} for row in data]

        # Return the data as JSON
        return jsonify(result)

    except psycopg2.Error as e:
        print("Database error:", e)
        return jsonify({"error": "Database error: " + str(e)}), 500
    except Exception as e:
        print("General error:", e)
        return jsonify({"error": "Error in fetching lowest selling products data: " + str(e)}), 500

@app.route('/lowest-selling-products', methods=['POST'])
def lowest_selling_products():
    try:
        # Connect to the database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    WITH product_sales AS (
                        SELECT 
                            product_name, 
                            SUM(quantity_sold) AS total_quantity_sold
                        FROM sales_data
                        GROUP BY product_name
                    ),
                    ranked_sales AS (
                        SELECT 
                            product_name,
                            total_quantity_sold,
                            RANK() OVER (ORDER BY total_quantity_sold ASC) AS rank_asc
                        FROM product_sales
                    )
                    SELECT 
                        product_name,
                        total_quantity_sold
                    FROM ranked_sales
                    WHERE rank_asc <= 5;
                """)
                data = cursor.fetchall()

        # If no data is found
        if not data:
            return jsonify({"error": "No sales data available for the lowest-selling products"}), 404

        # Prepare data for the chart
        labels = [row[0] for row in data]
        sales_data = [row[1] for row in data]

        # Create a bar chart using Plotly
        fig = go.Figure(data=[go.Bar(x=labels, y=sales_data, marker_color='lightcoral')])
        fig.update_layout(
            title='Top 5 Lowest Selling Products',
            xaxis_title='Product Name',
            yaxis_title='Total Quantity Sold'
        )

        # Save the plot to a BytesIO object in SVG format and return it as a response
        svg = io.BytesIO()
        fig.write_image(svg, format='svg')
        svg.seek(0)

        # Return the SVG as a response
        return send_file(svg, mimetype='image/svg+xml')

    except psycopg2.Error as e:
        print("Database error:", e)
        return jsonify({"error": "Database error: " + str(e)}), 500
    except Exception as e:
        print("General error:", e)
        return jsonify({"error": "Error in fetching lowest selling products: " + str(e)}), 500


@app.route('/sales-forecast-data', methods=['POST'])
def sales_forecast_data():
    try:
        # Connect to the database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        EXTRACT(YEAR FROM CAST(date AS DATE)) AS year,
                        EXTRACT(MONTH FROM CAST(date AS DATE)) AS month,
                        SUM(gross_sales) AS total_gross_sales
                    FROM sales_data
                    GROUP BY year, month
                    ORDER BY year, month;
                """)
                data = cursor.fetchall()

        # If no data is found
        if not data:
            return jsonify({"error": "No sales data available for forecasting"}), 404

        # Prepare data for forecasting
        df = pd.DataFrame(data, columns=['year', 'month', 'total_gross_sales'])

        # Combine year and month to create a date column (first day of each month)
        df['date'] = pd.to_datetime(df[['year', 'month']].assign(day=1))

        # Ensure the data has valid values
        df = df.dropna(subset=['date', 'total_gross_sales'])

        # Check if the cleaned data is empty
        if df.empty:
            return jsonify({"error": "Data is empty after cleaning"}), 404

        # Convert date to ordinal for modeling
        df['date_ordinal'] = df['date'].apply(lambda x: x.toordinal())

        # Prepare independent (X) and dependent (y) variables
        X = df['date_ordinal'].values.reshape(-1, 1)
        y = df['total_gross_sales'].values

        # Ensure there is enough data for linear regression
        if len(X) < 2:  # Need at least two data points to fit the model
            return jsonify({"error": "Not enough data to fit the model"}), 400

        # Create a Linear Regression model and fit the data
        model = LinearRegression()
        model.fit(X, y)

        # Forecast the next 12 months
        forecast_months = 12
        future_dates_ordinal = np.array([df['date'].max().toordinal() + i * 30 for i in range(1, forecast_months + 1)]).reshape(-1, 1)
        forecast_sales = model.predict(future_dates_ordinal)

        # Convert forecasted ordinal dates back to datetime
        forecast_dates = [datetime.fromordinal(day) for day in future_dates_ordinal.flatten()]

        # Prepare the forecast result
        forecast_result = {
            'forecast_dates': [date.strftime('%Y-%m-%d') for date in forecast_dates],
            'forecast_sales': forecast_sales.tolist()
        }

        # Return the forecast data as JSON
        return jsonify(forecast_result)

    except Exception as e:
        print("Error in forecasting sales:", e)
        return jsonify({"error": "Error in forecasting sales: " + str(e)}), 500




@app.route('/sales-forecast', methods=['POST'])
def sales_forecast():
    try:
        # Connect to the database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        EXTRACT(YEAR FROM CAST(date AS DATE)) AS year,
                        EXTRACT(MONTH FROM CAST(date AS DATE)) AS month,
                        SUM(gross_sales) AS total_gross_sales
                    FROM sales_data
                    WHERE EXTRACT(YEAR FROM CAST(date AS DATE)) >= 2019
                    GROUP BY year, month
                    ORDER BY year, month;
                """)
                data = cursor.fetchall()

        # If no data is found
        if not data:
            return jsonify({"error": "No sales data available for forecasting"}), 404

        # Prepare data for forecasting
        df = pd.DataFrame(data, columns=['year', 'month', 'total_gross_sales'])

        # Combine year and month to create a date column (first day of each month)
        df['date'] = pd.to_datetime(df[['year', 'month']].assign(day=1))

        # Ensure the data has valid values
        df = df.dropna(subset=['date', 'total_gross_sales'])

        # Check if the cleaned data is empty
        if df.empty:
            return jsonify({"error": "Data is empty after cleaning"}), 404

        # Convert date to ordinal for modeling
        df['date_ordinal'] = df['date'].apply(lambda x: x.toordinal())

        # Prepare independent (X) and dependent (y) variables
        X = df['date_ordinal'].values.reshape(-1, 1)
        y = df['total_gross_sales'].values

        # Ensure there is enough data for linear regression
        if len(X) < 2:  # Need at least two data points to fit the model
            return jsonify({"error": "Not enough data to fit the model"}), 400

        # Create a Linear Regression model and fit the data
        model = LinearRegression()
        model.fit(X, y)

        # Calculate predicted sales for the current month
        current_month = datetime.now().month
        current_year = datetime.now().year
        current_month_date = datetime(current_year, current_month, 1)
        current_month_ordinal = np.array([current_month_date.toordinal()]).reshape(-1, 1)
        predicted_sales_this_month = model.predict(current_month_ordinal)

        # Prepare the result for predicted sales for the current month
        predicted_sales_current_month = {
            'year': current_year,
            'month': current_month,
            'predicted_sales': predicted_sales_this_month.tolist()[0]
        }

        # Prepare historical sales data grouped by year and month
        sales_per_month = []
        for _, row in df.iterrows():
            sales_per_month.append({
                'year': int(row['year']),
                'month': int(row['month']),
                'total_gross_sales': row['total_gross_sales']
            })

        # Prepare the response data
        response_data = {
            'sales_per_month': sales_per_month,
            'predicted_sales_current_month': predicted_sales_current_month
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": "Error in forecasting sales: " + str(e)}), 500



@app.route('/feedback-graph', methods=['POST'])
def feedback_graph():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT sentiment, COUNT(*) 
                    FROM feedback 
                    GROUP BY sentiment;
                """)
                sentiment_data = cursor.fetchall()

        if not sentiment_data:
            return jsonify({"error": "No feedback data available"}), 404

        # Extract sentiments and counts dynamically
        sentiments = [row[0].capitalize() for row in sentiment_data]
        counts = [row[1] for row in sentiment_data]

        # Define default colors for known sentiments
        sentiment_colors = {
            "Positive": "green",
            "Negative": "red",
            "Neutral": "gray"
        }
        # Assign colors dynamically, default to blue for unknown sentiments
        colors = [sentiment_colors.get(sentiment, "blue") for sentiment in sentiments]

        # Generate the pie chart
        fig = go.Figure(data=[go.Pie(labels=sentiments, values=counts, marker=dict(colors=colors))])

        fig.update_layout(
            title="Sentiment Distribution",
            showlegend=True,
            plot_bgcolor="white",
            paper_bgcolor="white",
            font=dict(color="black"),
        )

        # Convert the figure to an SVG image using Kaleido
        img_io = io.BytesIO()
        pio.write_image(fig, img_io, format='svg')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/svg+xml')

    except Exception as e:
        print("Error generating feedback graph:", e)
        return jsonify({"error": "Error generating graph"}), 500

@app.route('/feedback-stats', methods=['GET'])
def feedback_stats():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT sentiment, COUNT(*) 
                    FROM feedback 
                    GROUP BY sentiment;
                """)
                sentiment_data = cursor.fetchall()

        if not sentiment_data:
            return jsonify({"error": "No feedback data available"}), 404

        # Prepare the data for response
        total_feedbacks = sum(row[1] for row in sentiment_data)
        feedback_stats = {
            "total": total_feedbacks,
            "positive": next((row[1] for row in sentiment_data if row[0].lower() == "positive"), 0),
            "negative": next((row[1] for row in sentiment_data if row[0].lower() == "negative"), 0),
            "neutral": next((row[1] for row in sentiment_data if row[0].lower() == "neutral"), 0),
        }

        return jsonify(feedback_stats)

    except Exception as e:
        print("Error fetching feedback stats:", e)
        return jsonify({"error": "Error fetching feedback stats"}), 500


@app.route('/peak-hours-graph', methods=['POST'])
def peak_hours_graph():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        TO_CHAR(date, 'Day') AS day_of_week,
                        EXTRACT(HOUR FROM time) AS hour,
                        COUNT(*) AS order_count
                    FROM orders
                    WHERE EXTRACT(HOUR FROM time) BETWEEN 10 AND 21
                    GROUP BY day_of_week, hour
                    ORDER BY day_of_week, hour ASC;
                """)
                data = cursor.fetchall()

        # Days of the week in order
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        hours = list(range(10, 22))  # Hours: 10, 11, ..., 21

        # Initialize data structure
        order_data = {day: [0] * len(hours) for day in days}

        # Populate order_data with query results
        for row in data:
            day_of_week = row[0].strip()  # Get the day of the week
            hour = int(row[1])  # Get the hour
            order_count = int(row[2])  # Get the count
            if day_of_week in order_data:
                index = hours.index(hour)  # Find hour index
                order_data[day_of_week][index] = order_count

        # Define a color palette for distinct colors
        colors = [
            "red", "orange", "yellow", "green", "blue", "indigo", "violet", 
            "cyan", "magenta", "brown", "pink", "teal"
        ]

        # Create bar traces for each hour with distinct colors
        traces = []
        for hour in hours:
            hour_index = hours.index(hour)
            traces.append(
                go.Bar(
                    name=f"{hour}:00",
                    x=days,
                    y=[order_data[day][hour_index] for day in days],
                    marker=dict(color=colors[hour_index % len(colors)])  # Assign color based on index
                )
            )

        # Create the grouped bar chart
        fig = go.Figure(data=traces)

        fig.update_layout(
            title="Peak Order Hours by Day of the Week (10 AM to 9 PM)",
            xaxis=dict(title='Day of the Week', categoryorder='array', categoryarray=days),
            yaxis=dict(title='Number of Orders'),
            barmode='group',  # Group bars by hour
            plot_bgcolor="white",
            paper_bgcolor="white",
            font=dict(color="black"),
            legend=dict(title="Hour of Day")  # Add a legend title
        )

        # Convert the figure to an SVG image using Kaleido
        img_io = io.BytesIO()
        pio.write_image(fig, img_io, format='svg')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/svg+xml')

    except Exception as e:
        print("Error generating peak hours graph:", e)
        return jsonify({"error": "Error generating graph"}), 500



@app.route('/peak-hours-data', methods=['GET'])
def peak_hours_data():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT TO_CHAR(date, 'Day') AS day_of_week,
                           EXTRACT(HOUR FROM time) AS hour_of_day,
                           COUNT(*) AS order_count
                    FROM orders
                    WHERE EXTRACT(HOUR FROM time) BETWEEN 10 AND 21
                    GROUP BY day_of_week, hour_of_day
                    ORDER BY day_of_week, hour_of_day;
                """)
                data = cursor.fetchall()

        # Days and hours to structure the response
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        hours = list(range(10, 22))  # Peak hours: 10 AM to 9 PM

        # Initialize the dictionary for storing order counts
        order_data = {day: {hour: 0 for hour in hours} for day in days}

        # Populate order_data with query results
        for row in data:
            day_of_week = row[0].strip()  # Clean whitespace around day name
            hour_of_day = int(row[1])
            order_count = row[2]
            if day_of_week in order_data:
                order_data[day_of_week][hour_of_day] = order_count

        # Extract the highest order count for each day along with the corresponding hour
        highest_orders = {}
        for day in days:
            day_data = order_data[day]
            highest_hour = max(day_data, key=day_data.get)  # Hour with max orders
            highest_orders[day] = {
                "hour": highest_hour,
                "order_count": day_data[highest_hour]
            }

        # Return the highest order count for each day
        return jsonify({"highest_orders": highest_orders})

    except Exception as e:
        print("Error retrieving peak hours data:", e)
        return jsonify({"error": "Error retrieving data"}), 500


# Negative words that could appear in text
negative_words = ['bad', 'sad', 'angry', 'hate', 'worst', 'terrible', 'awful', 'dislike', 'sinful']

# Specific cases where negative words indicate positive sentiment
positive_with_negative_words = [
    "sinful",  # This could be used in a positive way when describing indulgence, like in desserts
    "bad"  # Sometimes 'bad' is used in a playful or indulgent context (e.g., "This is bad, but so good")
]

@app.route('/api/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()  # Getting the JSON data from the request
    text = data.get('text')  # Extracting the text field from the JSON data
    
    # Analyzing sentiment using the VADER sentiment analyzer
    sentiment_score = analyzer.polarity_scores(text)
    compound_score = sentiment_score['compound']
    
    # Check for the presence of negative words, but allowing for positive sentiment context
    contains_negative_word = any(neg_word in text.lower() for neg_word in negative_words)
    
    # Special case for identifying positive sentiment with negative words
    sentiment_label = ''
    
    # Check if the text contains any words that should be considered as positive in context
    if contains_negative_word:
        if any(phrase in text.lower() for phrase in positive_with_negative_words):
            sentiment_label = 'positive sentiment with negative words'
        elif compound_score > 0.5:  # If VADER analysis indicates overall positive sentiment
            sentiment_label = 'positive sentiment with negative words'
        elif compound_score < -0.5:  # If the sentiment score is clearly negative
            sentiment_label = 'negative sentiment with negative words'
        else:
            sentiment_label = 'neutral sentiment with negative words'
    else:
        # If no negative words are detected, proceed with regular sentiment analysis
        if compound_score > 0.5:
            sentiment_label = 'positive'
        elif compound_score < -0.5:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'

    # Returning the sentiment result as a JSON response
    return jsonify({
        'compound': compound_score,
        'sentiment': sentiment_label
    })








if __name__ == "__main__":
    app.run(debug=True, port=admin_id)
