"use client";

import Link from "next/link";
import { useNavigationAuth } from "@/features/auth/use-navigation-auth";
import styles from "./autumn.module.css";

export function AutumnAccountLink() {
  const { showSignIn, signedIn } = useNavigationAuth();

  return (
    <div className={styles.account}>
      {signedIn ? (
        <Link href="/garage" className={styles.login}>
          My Garage
        </Link>
      ) : showSignIn ? (
        <Link href="/login" className={styles.login}>
          Log in
        </Link>
      ) : null}
    </div>
  );
}
