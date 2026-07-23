import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-600 mt-2">
            Get started with Agribridge in under a minute
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
