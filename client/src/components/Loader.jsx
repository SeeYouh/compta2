import styles from "../sass/components/Loader.module.scss";

function Loader({ text = "Chargement…", className = "" }) {
  return (
    <div
      className={`${styles.loader} ${className}`}
      role="status"
      aria-label={text}
    >
      <svg
        className={styles.spinner}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="40 60"
        />
      </svg>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
}

export default Loader;
