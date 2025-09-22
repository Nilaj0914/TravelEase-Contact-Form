import Head from 'next/head';
import styles from '../styles/Home.module.css';

// Import your new components
import Header from '../components/Header';
import Hero from '../components/Hero';
import Destinations from '../components/Destinations';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>TravelEase - Your Adventure Awaits</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Hero />
        <Destinations />
        {/* You can add more sections like "About" and "Contact" here */}
      </main>

      <Footer />
    </div>
  );
}