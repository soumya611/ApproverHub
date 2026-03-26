import { useState } from "react";
import { EyeCloseIcon, EyeIcon, LockIcon, MailIcon } from "../../icons";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col">
      {/* Logo: image or fallback "Approver Hub" text */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-6 flex items-center justify-center min-h-[48px]">
          {!logoError ? (
            <img
              src="/images/logo/ApproverHubLogo.svg"
              alt="Approver Hub"
              className="h-12 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-baseline gap-1 text-2xl font-semibold">
              <span className="text-[var(--color-primary-500)]">Approver</span>
              <span className="text-gray-900 dark:text-white"> Hub</span>
            </div>
          )}
        </div>
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome!
        </h1>
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/home");
        }}
      >
        {/* Email */}
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            placeholder="john.smith@perivan.com"
            className="w-full border border-gray-300 bg-white pl-10 pr-4 py-3 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            className="w-full border border-gray-300 bg-white pl-10 pr-11 py-3 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeCloseIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={rememberMe}
              onChange={setRememberMe}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Remember Me
            </span>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-[#c45c4a] hover:underline dark:text-[#e07a6b]"
            onClick={(e) => e.preventDefault()}
          >
            Forgot Password?
          </a>
        </div>

        {/* Sign In - coral/orange solid button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full rounded-xl bg-[var(--color-secondary-500)] font-semibold text-white hover:bg-[var(--color-secondary-600)] focus:ring-2 focus:ring-[var(--color-secondary-500)]/30"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
