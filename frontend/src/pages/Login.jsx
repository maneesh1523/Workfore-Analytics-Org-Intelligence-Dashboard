import { login } from "../auth/auth";

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow w-80 text-center">
        <h2 className="text-xl font-semibold mb-4">Welcome</h2>
        <p className="text-gray-500 mb-6">Please login to continue</p>

        <button
          onClick={login}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Login with Cognito
        </button>
      </div>
    </div>
  );
}