import styles from './Dashboard.module.css';
import FeedbackCard from './Cards/FeedbackCard/FeedbackCard';
import InventoryCard from './Cards/InventoryCard/InventoryCard.jsx';
import SalesTodayCard from './Cards/SalesTodayCard/SalesTodayCard.jsx';
import BestProductCard from './Cards/BestProductCard/BestProductCard.jsx';
import DeliveriesCard from './Cards/DeliveriesCard/DeliveriesCard.jsx';
import ReservationCard from './Cards/ReservationCard/ReservationCard.jsx';


function Dashboard() { 

    return (
        <section className={styles.section}>
            <div className={styles.cardContainer}>
                <FeedbackCard/>
                <InventoryCard/>
                <SalesTodayCard/>
                <DeliveriesCard/>
                <ReservationCard/>
                <BestProductCard/>

            </div>
        </section>
    );
}

export default Dashboard;
