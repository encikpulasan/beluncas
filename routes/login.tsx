import { Head } from "$fresh/runtime.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login - Charity Shelter Admin</title>
      </Head>
      <div class="min-h-screen flex items-center justify-center bg-background p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-foreground mb-2">
              Charity Shelter Dashboard
            </h1>
            <p class="text-muted-foreground">
              Sign in to access the admin panel
            </p>
          </div>

          <LoginForm />

          <p class="mt-4 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <a href="#" class="text-primary-600 hover:text-primary-800">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
