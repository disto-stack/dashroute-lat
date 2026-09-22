import styles from "./page.module.css";
import { Button } from "@dashroute/ui";

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>DashRoute Admin</h1>
      <p style={{ marginBottom: "var(--spacing-lg)" }}>
        Design system and tokens are working!
      </p>
      <Button title="Universal Button" variant="primary" />
    </main>
  );
}
