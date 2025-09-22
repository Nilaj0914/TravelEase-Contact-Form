import styles from '../styles/Home.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Your Adventure Awaits</h1>
        <p className={styles.description}>Discover breathtaking destinations and create unforgettable memories.</p>
        <a href="#destinations" className={styles.ctaButton}>Explore Tours</a>
      </div>
    </section>
  );
}