import Board from "@/components/Board";
import styles from "@/styles/page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>CHECKMATE</h1>

      <Board />

      <footer className={styles.footer}>
        <p>
          a <a href="https://hitwicket.com/">HITWICKET</a> assignment
        </p>
      </footer>
    </main>
  );
}
