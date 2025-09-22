import styles from '../styles/Home.module.css';

const destinations = [
  { name: 'Paris, France', price: '$1,200', image: '/paris.jpg' },
  { name: 'Kyoto, Japan', price: '$1,500', image: '/kyoto.jpg' },
  { name: 'Cairo, Egypt', price: '$900', image: '/cairo.jpg' },
];

export default function Destinations() {
  return (
    <section id="destinations" className={styles.destinations}>
      <h2>Popular Destinations</h2>
      <div className={styles.grid}>
        {destinations.map((dest) => (
          <div key={dest.name} className={styles.card}>
            <img src={dest.image} alt={dest.name} className={styles.cardImage} />
            <h3>{dest.name}</h3>
            <p>Starting from {dest.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}