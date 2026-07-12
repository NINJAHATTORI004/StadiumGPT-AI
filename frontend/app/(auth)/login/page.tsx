import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-10">
      <AuthForm mode="login" />
    </main>
  );
}

