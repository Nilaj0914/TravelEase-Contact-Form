import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Poppins } from 'next/font/google'; // Import the font

// Import your components
import Header from '../components/Header';
import Hero from '../components/Hero';
import Destinations from '../components/Destinations';
import Footer from '../components/Footer';

// Configure the font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function Home() {
  return (
    // Apply the font's class name to the main container
    <div className={`${styles.container} ${poppins.className}`}>
      <Head>
        <title>TravelEase - Your Adventure Awaits</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Hero />
        <Destinations />
        
        <section className={styles.contactSection}>
          <h2>Have Questions?</h2>
          <p>Our travel experts are here to help you plan the perfect trip.</p>
          <a href="/contact" className={styles.contactButton}>Contact Us</a>
        </section>

      </main>

      <Footer />
    </div>
  );
}