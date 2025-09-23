import styles from '../styles/Home.module.css';

// To change the hero image, just change the filename here
const heroBackgroundImage = '/hero-background.jpg'; 

export default function Hero() {
  return (
    <section 
      className={styles.hero} 
      style={{ backgroundImage: `url(${heroBackgroundImage})` }}
    >
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Your Adventure Awaits</h1>
        <p className={styles.description}>Discover breathtaking destinations and create unforgettable memories.</p>
        <a href="#destinations" className={styles.ctaButton}>Explore Tours</a>
      </div>
    </section>
  );
}