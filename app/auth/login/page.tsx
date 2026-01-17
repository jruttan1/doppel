import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata = {
  title: "Sign In | Doppel",
  description: "Sign in to your Doppel account",
}

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue networking">
      <LoginForm />
    </AuthLayout>
  )
}
