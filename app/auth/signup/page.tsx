import { SignupForm } from "@/components/auth/signup-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata = {
  title: "Create Account | Doppel",
  description: "Create your Doppel account and deploy your digital twin",
}

export default function SignupPage() {
  return (
    <AuthLayout title="Create your account" description="Start your journey with agent-to-agent networking">
      <SignupForm />
    </AuthLayout>
  )
}
