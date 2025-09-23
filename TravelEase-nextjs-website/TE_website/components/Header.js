// Add this at the very top. This is the critical fix.
'use client'; 

import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav>
        <a href="/" className={styles.logo}>TravelEase</a>

        <ul className={styles.navLinks}>
          <li><a href="#destinations">Destinations</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div style={{ transform: menuOpen ? 'rotate(45deg)' : 'rotate(0)' }} />
          <div style={{ opacity: menuOpen ? '0' : '1' }} />
          <div style={{ transform: menuOpen ? 'rotate(-45deg)' : 'rotate(0)' }} />
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <a href="#destinations" onClick={() => setMenuOpen(false)}>Destinations</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </div>
    </header>
  );
}