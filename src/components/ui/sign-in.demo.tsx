"use client";

import { useState, type FormEvent } from "react";
import { SignInPage } from "@/components/ui/sign-in";
import { signInPhotos } from "@/components/auth/sign-in-photos";

// Isolated visual demo. Production /login uses AuthForm's existing authentication.
export default function SignInPageDemo() {
  const [message, setMessage] = useState("");
  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Demo form submitted. No credentials were sent or stored.");
  }
  return (
    <SignInPage
      title="Open your garage."
      description="Component preview — use /login to access your account."
      photo={signInPhotos[0]}
      onSignIn={handleSignIn}
      onGoogleSignIn={() =>
        setMessage("Demo Google action. No authentication was started.")
      }
      onResetPassword={() => setMessage("Demo password recovery action.")}
      onCreateAccount={() => setMessage("Demo create account action.")}
      message={message}
    />
  );
}
