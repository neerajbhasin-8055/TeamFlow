
import { useState } from 'react'
import { API_BASE_URL } from '../api'

const AUTH_API = `${API_BASE_URL}/auth`
function LoginPage({onLoginSuccess}) {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  
async function getErrorMessage(response, fallbackMessage) {
  const data = await response.json();

  return data.message || fallbackMessage;
}



  async function register() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      
if (!response.ok) {
  const errorMessage = await getErrorMessage(
    response,
    "Unable to register user"
  );

  throw new Error(errorMessage);
}


      setMessage("Registration successful! You can now sign in.");
      setIsRegister(false);
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (err) {
      console.log(err)
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }


  async function login() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      
if (!response.ok) {
  const errorMessage = await getErrorMessage(
    response,
    "Unable to login"
  );

  throw new Error(errorMessage);
}


      const token = (await response.text()).trim();

      if (!token) {
        throw new Error("Login succeeded, but no token was returned.");
      }

      localStorage.setItem("token", token);
      setMessage("Login successful!");
      onLoginSuccess(token)

    } catch (err) {
      console.log(err)
      setError(err.message || "Something Went Wrong")
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    if (isRegister) {
      await register();
    } else {
      await login();
    }
  }


  return (
    <main className="min-h-screen bg-white p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-64px)] lg:grid-cols-2">

        {/* Left: Brand panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-50 via-white to-indigo-100 p-12 lg:flex xl:p-16">
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
              T
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              TeamFlow
            </span>
          </div>

          <div className="relative my-12">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Your team's workspace
            </span>

            <h1 className="max-w-lg text-5xl font-bold leading-[1.12] tracking-tight text-slate-900 xl:text-6xl">
              Great work happens
              <span className="text-violet-600"> together.</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
              Bring your projects, tasks, and people together.
              Spend less time managing work and more time making progress.
            </p>

            {/* Product preview */}
            <div className="mt-10 max-w-md rounded-2xl border border-white bg-white/90 p-5 shadow-xl shadow-violet-200/40 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Project overview
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your team at a glance
                  </p>
                </div>
                <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  Active
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Website redesign
                    </span>
                    <span className="text-slate-500">75%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-3/4 rounded-full bg-violet-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Backend development
                    </span>
                    <span className="text-slate-500">45%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[45%] rounded-full bg-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  A
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  R
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  S
                </div>
                <span className="ml-1 text-xs text-slate-500">
                  Your team, moving forward
                </span>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-slate-500">
            Plan together. Build together. Achieve together.
          </p>
        </section>

        {/* Right: Authentication form */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">

            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-white">
                T
              </div>
              <span className="text-xl font-bold text-slate-900">
                TeamFlow
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Welcome to TeamFlow
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {isRegister ? 'Create your account' : 'Welcome back'}
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-500">
                {isRegister
                  ? 'Get your workspace started in just a few steps.'
                  : 'Sign in to pick up where your team left off.'}
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              {isRegister && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(event) => {
                      setFormData({ ...formData, name: event.target.value })
                    }}
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => {
                    setFormData({ ...formData, email: event.target.value })
                  }}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      className="text-sm font-medium text-violet-600 transition hover:text-violet-800"
                      onClick={() =>
                        alert('Password reset will be added later.')
                      }
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(event) => {
                      setFormData({ ...formData, password: event.target.value })
                    }}
                    autoComplete={
                      isRegister ? 'new-password' : 'current-password'
                    }
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 text-sm font-medium text-slate-500 transition hover:text-violet-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {isRegister && (
                <p className="text-xs leading-5 text-slate-500">
                  Use at least 8 characters for your password.
                </p>
              )}

              {!isRegister && (
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />
                  Remember me
                </label>
              )}

              <button
                type="submit" disabled={loading}


                className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl active:translate-y-0"
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Sign in"}
                <span className="ml-2" aria-hidden="true">→</span>
              </button>
            </form>

            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              {isRegister
                ? 'Already have an account?'
                : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="font-semibold text-violet-600 transition hover:text-violet-800"
              >
                {isRegister ? 'Sign in' : 'Create an account'}
              </button>
            </p>

            <p className="mt-10 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to TeamFlow's Terms of Service
              and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
