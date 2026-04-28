import { useAuthContext } from "@asgardeo/auth-react";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  const { signIn, state } = useAuthContext();

  return (
    <div className={styles.page}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden />

      <div className={styles.hero}>
        <div className={styles.badge}>Built with Asgardeo + Choreo</div>

        <h1 className={styles.title}>
          Manage your tasks<br />
          <em>beautifully.</em>
        </h1>

        <p className={styles.subtitle}>
          A secure, cloud-native task tracker powered by WSO2 Asgardeo for
          authentication and Choreo for deployment. Sign in to get started.
        </p>

        <button
          className={styles.signInBtn}
          onClick={() => signIn()}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <><div className="spinner" /> Signing in…</>
          ) : (
            <><IconLock /> Sign in with Asgardeo</>
          )}
        </button>

        <p className={styles.hint}>
          Secured by WSO2 Asgardeo Identity Platform
        </p>
      </div>

      {/* Feature cards */}
      <div className={styles.features}>
        {FEATURES.map((f, i) => (
          <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "🔐", title: "Asgardeo Auth",    desc: "Secure SSO login via WSO2 identity platform" },
  { icon: "☁️", title: "Choreo Deploy",    desc: "Backend & frontend deployed on WSO2 Choreo" },
  { icon: "⚡", title: "Ballerina API",    desc: "REST API written in WSO2's own language" },
  { icon: "📊", title: "Live Dashboard",  desc: "Real-time stats and task completion tracking" },
];

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
