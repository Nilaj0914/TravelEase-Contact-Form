import styles from '../styles/Home.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav>
        <a href="/" className={styles.logo}>TravelEase</a>
        <ul className={styles.navLinks}>
          <li><a href="#destinations">Destinations</a></li>
          {/*<li><a href="#about">About</a></li>*/}
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}