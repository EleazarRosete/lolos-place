import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import styles from './Admin.module.css';
import Dashboard from './Sections/Dashboard/Dashboard.jsx';
import POS from './Sections/POS/POS.jsx';
import Inventory from './Sections/Inventory/Inventory.jsx';
import Feedback from './Sections/Feedback/Feedback.jsx';
import Analytics from './Sections/Analytics/Analytics.jsx';
import Purchases from './Sections/Purchases/Purchases.jsx';


import dashboardIcon from './assets/dashboard.png';
import posIcon from './assets/menu.png';
import inventoryIcon from './assets/inventory.png';
import feedbackIcon from './assets/feedback.png';
import analyticsIcon from './assets/analytics.png';
import logoutIcon from './assets/logout.png';


const Admin = () => { // Fixed component declaration
    const navigate = useNavigate(); // Initialize navigate

    // Set the Dashboard as the default open section
    const [isDashboardOpen, setIsDashboardOpen] = useState(true);
    const [isPosOpen, setIsPosOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);


    const handleLogout = () => {
        setIsLogoutOpen(true);
    };

    const confirmLogout = () => {
        setIsLogoutOpen(false);
        navigate("/login"); // Navigate to login page
    };

    const cancelLogout = () => {
        setIsLogoutOpen(false);
    };

    const handleDashboard = () => {
        setIsDashboardOpen(true);
        setIsPosOpen(false);
        setIsOrdersOpen(false);
        setIsInventoryOpen(false);
        setIsFeedbackOpen(false);
        setIsAnalyticsOpen(false);
    };

    const handlePos = () => {
        setIsDashboardOpen(false);
        setIsPosOpen(true);
        setIsOrdersOpen(false);
        setIsInventoryOpen(false);
        setIsFeedbackOpen(false);
        setIsAnalyticsOpen(false);
    };

    const handleOrders = () => {
        setIsDashboardOpen(false);
        setIsPosOpen(false);
        setIsOrdersOpen(true);
        setIsInventoryOpen(false);
        setIsFeedbackOpen(false);
        setIsAnalyticsOpen(false);
    };


    const handleInventory = () => {
        setIsDashboardOpen(false);
        setIsPosOpen(false);
        setIsOrdersOpen(false);
        setIsInventoryOpen(true);
        setIsFeedbackOpen(false);
        setIsAnalyticsOpen(false);
    };

    const handleFeedback = () => {
        setIsDashboardOpen(false);
        setIsPosOpen(false);
        setIsOrdersOpen(false);
        setIsInventoryOpen(false);
        setIsFeedbackOpen(true);
        setIsAnalyticsOpen(false);
    };

    const handleAnalytics = () => {
        setIsDashboardOpen(false);
        setIsPosOpen(false);
        setIsOrdersOpen(false);
        setIsInventoryOpen(false);
        setIsFeedbackOpen(false);
        setIsAnalyticsOpen(true);
    };

    return (
        <section className={styles.MainSection}>
<aside className={styles.aside}>
            <div className={styles.logoContainer}>
                <h1 className={styles.dinerName}>
                    LoLo's Place  
                </h1>
                <h2 className={styles.restaurant}>Restaurant</h2>
            </div>
            <button className={styles.sideButton} onClick={handleDashboard}>
                <img src={dashboardIcon} alt="dashboard" className={styles.buttonIcons} />Dashboard
            </button>
            <button className={styles.sideButton} onClick={handlePos}>
                <img src={posIcon} alt="point of sale" className={styles.buttonIcons} />Point of Sale
            </button>
            <button className={styles.sideButton} onClick={handleOrders}>
                <img src={posIcon} alt="orders" className={styles.buttonIcons} />Orders
            </button>
            <button className={styles.sideButton} onClick={handleInventory}>
                <img src={inventoryIcon} alt="inventory" className={styles.buttonIcons} />Inventory
            </button>
            <button className={styles.sideButton} onClick={handleFeedback}>
                <img src={feedbackIcon} alt="feedback" className={styles.buttonIcons} />Feedback
            </button>
            <button className={styles.sideButton} onClick={handleAnalytics}>
                <img src={analyticsIcon} alt="analytics" className={styles.buttonIcons} />Analytics
            </button>
            <button className={styles.sideButton} onClick={handleLogout}>
                <img src={logoutIcon} alt="logout" className={styles.buttonIcons} />Logout
            </button>

            {isDashboardOpen && <Dashboard sectionTitle="Dashboard Section" />}
            {isPosOpen && <POS sectionTitle="Point of Sale Section" />}
            {isOrdersOpen && <Purchases sectionTitle="Orders" />}
            {isInventoryOpen && <Inventory sectionTitle="Inventory Section" />}
            {isFeedbackOpen && <Feedback sectionTitle="Feedback Section" />}
            {isAnalyticsOpen && <Analytics sectionTitle="Analytics Section" />}
            {isLogoutOpen && 
                <div className={styles.logoutOverlay}>
                    <div className={styles.logout}>
                        <h2>Confirm logout</h2>
                        <p>Are you sure you want to log out?</p>
                        <div className={styles.logoutButtons}>
                            <button onClick={confirmLogout} className={styles.confirmButton}>Yes</button>
                            <button onClick={cancelLogout} className={styles.cancelButton}>No</button>
                        </div>
                    </div>
                </div>}
        </aside>
        </section>  
    );
};

export default Admin;
