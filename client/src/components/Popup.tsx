import styles from "@/styles/popup.module.scss";

type popupProps = { won: boolean; spectator: string; onClose: any };

const Popup = ({ won, spectator, onClose }: popupProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.popup}>
        <h1 className={styles.title}>
          {!spectator
            ? won
              ? "Congratulations!"
              : "Better luck next time!"
            : "Results"}
        </h1>

        <p>
          {spectator
            ? spectator
            : won
            ? "🎉🎊 You Won 🎊🎉"
            : "🫢😳 You Lost 😳🫢"}
        </p>

        <div className={styles.options}>
          <button onClick={onClose}>Nope</button>
          <button onClick={() => window.location.reload()}>New Game</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
