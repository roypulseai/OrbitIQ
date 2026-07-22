"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign in to OrbitIQ</h1>
        <button
          onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
          className="btn-primary w-full"
        >
          Sign in with Keycloak
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Contact your administrator if you need access.
        </p>
      </div>
    </main>
  );
}
