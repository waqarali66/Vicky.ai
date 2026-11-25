import React from "react";
import { Navigate } from "react-router-dom";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { useAuth } from "../helpers/useAuth";
import styles from "./login.module.css";

export default function LoginPage() {
  const { authState } = useAuth();

  if (authState.type === "authenticated") return <Navigate to="/" replace />;

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span>V</span>
          <div><b>VICKY</b><small>AI FILM STUDIO</small></div>
        </div>
        <div className={styles.kicker}>PRIVATE FILMMAKER WORKSPACE</div>
        <h1>Welcome<br /><em>back to the studio.</em></h1>
        <p className={styles.intro}>Sign in to continue building your stories, characters and productions.</p>
        <PasswordLoginForm />
        <div className={styles.ownerNote}>Studio owner account: <b>waqar.aliakbar920@gmail.com</b></div>
        <div className={styles.footer}>YOUR STORIES. YOUR STUDIO. YOUR CREATIVE CONTROL.</div>
      </div>
      <div className={styles.visual}>
        <div className={styles.orbit} />
        <div className={styles.visualCopy}><span>01 / THE CREATIVE ENGINE</span><b>From first idea<br />to final frame.</b><small>One private space for the entire filmmaking journey.</small></div>
      </div>
    </main>
  );
}