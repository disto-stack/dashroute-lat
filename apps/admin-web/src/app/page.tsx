import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>DashRoute Admin</h1>
      <p style={{ marginBottom: "var(--spacing-lg)" }}>
        Design system and tokens are working!
      </p>
      <button className={styles.button}>Test Button</button>
    </main>
  );
}
