import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  // If logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
              sign in to your account
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 