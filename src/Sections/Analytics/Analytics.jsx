import React, { useEffect, useState } from "react";
import styles from "./Analytics.module.css";
import CustomerReviewsGraph from "./Graphs/CustomerReviewsGraph.jsx";
import CustomerPeakHoursGraph from "./Graphs/CustomerPeakHoursGraph.jsx";
import SalesForecastingGraph from "./Graphs/SalesForecastingGraph.jsx";
import HighestProductDemandGraph from "./Graphs/HighestProductDemandGraph.jsx";
import LowestProductDemandGraph from "./Graphs/LowestProductDemandGraph.jsx";

function Analytics() {
    const scrollContainerRef = React.useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const graphs = [
        CustomerReviewsGraph,
        CustomerPeakHoursGraph,
        SalesForecastingGraph,
        HighestProductDemandGraph,
        LowestProductDemandGraph,
    ];

    const scrollToIndex = (index) => {
        const container = scrollContainerRef.current;
        const graphWidth = container.offsetWidth; // Full width of the graph container
        const targetScrollLeft = graphWidth * index;

        container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        setActiveIndex(index);
    };

    const scrollLeft = () => {
        if (activeIndex > 0) scrollToIndex(activeIndex - 1);
    };

    const scrollRight = () => {
        if (activeIndex < graphs.length - 1) scrollToIndex(activeIndex + 1);
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        const graphWidth = container.offsetWidth;
        const scrollLeft = container.scrollLeft;
        const index = Math.round(scrollLeft / graphWidth);

        setActiveIndex(index);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className={styles.section}>
            <h2>Analytics</h2>
            <div className={styles.arrowButton} onClick={scrollLeft}>
                &#8249; {/* Left arrow */}
            </div>
            <div className={styles.graphContainer} ref={scrollContainerRef}>
                {graphs.map((GraphComponent, index) => (
                    <div
                        key={index}
                        className={`${styles.graph} ${
                            activeIndex === index ? styles.active : ""
                        }`}
                    >
                        <GraphComponent />
                    </div>
                ))}
            </div>
            <div className={styles.arrowButton} onClick={scrollRight}>
                &#8250; {/* Right arrow */}
            </div>
        </section>
    );
}

export default Analytics;
