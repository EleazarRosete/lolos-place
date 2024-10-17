import { useState } from 'react';
import styles from './App.module.css';
import Dashboard from './Sections/Dashboard/Dashboard.jsx';
import POS from './Sections/POS/POS.jsx';
import Inventory from './Sections/Inventory/Inventory.jsx';
import Feedback from './Sections/Feedback/Feedback.jsx';
import Analytics from './Sections/Analytics/Analytics.jsx';

import dashboardIcon from './assets/dashboard.png';
import posIcon from './assets/menu.png';
import inventoryIcon from './assets/inventory.png';
import feedbackIcon from './assets/feedback.png';
import analyticsIcon from './assets/analytics.png';
import logoutIcon from './assets/logout.png';

function App() {
      // Set the Dashboard as the default open section
      const [isDashboardOpen, setIsDashboardOpen] = useState(true);
      const [isPosOpen, setIsPosOpen] = useState(false);
      const [isInventoryOpen, setIsInventoryOpen] = useState(false);
      const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
      const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
      const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
      const handleLogout = () => {
        setIsLogoutOpen(true);
      };
    
      const confirmLogout = () => {
        alert("You have logged out!");
        setIsLogoutOpen(false);
      };
    
      const cancelLogout = () => {
        setIsLogoutOpen(false);
      };
  
      const handleDashboard = () => {
          setIsDashboardOpen(true);
          setIsPosOpen(false);
          setIsInventoryOpen(false);
          setIsFeedbackOpen(false);
          setIsAnalyticsOpen(false);
      };
  
      const handlePos = () => {
          setIsDashboardOpen(false);
          setIsPosOpen(true);
          setIsInventoryOpen(false);
          setIsFeedbackOpen(false);
          setIsAnalyticsOpen(false);
      };
  
      const handleInventory = () => {
          setIsDashboardOpen(false);
          setIsPosOpen(false);
          setIsInventoryOpen(true);
          setIsFeedbackOpen(false);
          setIsAnalyticsOpen(false);
      };
  
      const handleFeedback = () => {
          setIsDashboardOpen(false);
          setIsPosOpen(false);
          setIsInventoryOpen(false);
          setIsFeedbackOpen(true);
          setIsAnalyticsOpen(false);
      };
  
      const handleAnalytics = () => {
          setIsDashboardOpen(false);
          setIsPosOpen(false);
          setIsInventoryOpen(false);
          setIsFeedbackOpen(false);
          setIsAnalyticsOpen(true);
      };
  
      return (
          <aside className={styles.aside}>
              <div className={styles.logoContainer}>
                  <h1 className={styles.dinerName}>
                  LoLo's Place  
                  <span className={styles.restaurant}> Restaurant </span>
                  </h1>
              </div>
              <button className={styles.sideButton} onClick={handleDashboard}><img src={dashboardIcon} alt="dashboard" className={styles.buttonIcons}/>Dashboard</button>
              <button className={styles.sideButton} onClick={handlePos}><img src={posIcon} alt="point of sale" className={styles.buttonIcons}/>Point of Sale</button>
              <button className={styles.sideButton} onClick={handleInventory}><img src={inventoryIcon} alt="inventory" className={styles.buttonIcons}/>Inventory</button>
              <button className={styles.sideButton} onClick={handleFeedback}><img src={feedbackIcon} alt="feedback" className={styles.buttonIcons}/>Feedback</button>
              <button className={styles.sideButton} onClick={handleAnalytics}><img src={analyticsIcon} alt="analytics" className={styles.buttonIcons}/>Analytics</button>
              <button className={styles.sideButton} onClick={handleLogout}><img src={logoutIcon} alt="logout" className={styles.buttonIcons} onClick={handleLogout}/>Logout</button>
  
              {isDashboardOpen && <Dashboard sectionTitle="Dashboard Section" />}
              {isPosOpen && <POS sectionTitle="Point of Sale Section" />}
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
      );
}

export default App
