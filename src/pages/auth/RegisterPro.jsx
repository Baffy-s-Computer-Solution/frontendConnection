import { useCallback, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Info,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  normalizeUserType,
  getDashboardPathByUserType,
} from "../../utils/authRoleUtils";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const roles = [
  {
    value: "student",
    label: "Student",
    description: "Find jobs and internships",
    icon: GraduationCap,
    verification: false,
  },
  {
    value: "mentor",
    label: "Mentor",
    description: "Guide the next generation",
    icon: UserRound,
    verification: true,
  },
  {
    value: "company",
    label: "Company",
    description: "Hire talented people",
    icon: Building2,
    verification: true,
  },
];
const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Other",
];
const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "200+ employees",
];
const educationLevels = [
  "High School",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

export default function RegisterPro() {
  const { loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role");
  const invitedEmail = searchParams.get("email") || "";
  const referralCode = searchParams.get("ref") || '';
  const referralCompanyId = searchParams.get("company") || '';
  const referralOwnerId = searchParams.get("referrer") || '';
  const referralOwnerType = searchParams.get("referrerType") || (referralOwnerId ? 'mentor' : '');
  const hasRequestedRole = roles.some((role) => role.value === requestedRole);
  const [userType, setUserType] = useState(() => hasRequestedRole ? requestedRole : "");
  const [step, setStep] = useState(() => hasRequestedRole ? 2 : 1);
  const [form, setForm] = useState({
    fullName: "",
    email: invitedEmail,
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    institution: "",
    educationLevel: "",
    expertise: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const currentRole = roles.find((role) => role.value === userType);
  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };
  const validateEmail = useCallback(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email),
    [],
  );
  const validateStep = () => {
    const errors = {};
    if (!roles.some((role) => role.value === userType)) {
      errors.userType = "Select Student, Mentor, or Company to continue";
    }
    if (step === 2) {
      if (!form.fullName.trim()) errors.fullName = "Full name is required";
      if (!form.email.trim()) errors.email = "Email is required";
      else if (!validateEmail(form.email))
        errors.email = "Invalid email address";
      if (!form.password) errors.password = "Password is required";
      else if (!(
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[0-9]/.test(form.password)
      ))
        errors.password = "Min 8 chars, 1 uppercase, 1 number";
      if (form.password !== form.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
      if (!form.acceptTerms) errors.acceptTerms = "You must accept the terms";
    }
    if (step === 3) {
      if (userType === "company") {
        if (!form.companyName.trim())
          errors.companyName = "Company name is required";
        if (!form.industry) errors.industry = "Industry is required";
      }
      if (userType === "student") {
        if (!form.educationLevel)
          errors.educationLevel = "Education level is required";
        if (!form.institution.trim())
          errors.institution = "Institution is required";
      }
      if (userType === "mentor" && !form.expertise.trim()) {
        errors.expertise = "Area of expertise is required";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const selectRole = (role) => {
    setUserType(role);
    setStep(2);
    setError("");
  };
  const handleNext = () => {
    if (!validateStep()) {
      setError("Please correct the errors below");
      return;
    }
    setError("");
    setStep((value) => value + 1);
  };
  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validateStep()) {
      setError("Please correct the errors below");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const normalizedUserType = normalizeUserType(userType);
      const data = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        userType: normalizedUserType,
        acceptTerms: form.acceptTerms,
      };
      if (referralCode && referralCompanyId) {
        Object.assign(data, { referralCode, referralCompanyId });
      } else if (referralCode && referralOwnerId) {
        Object.assign(data, { referralCode, referralOwnerId, referralOwnerType });
      }
      if (userType === "company")
        Object.assign(data, {
          companyName: form.companyName.trim(),
          industry: form.industry,
          companySize: form.companySize,
          website: form.website.trim(),
        });
      if (userType === "student")
        Object.assign(data, {
          institution: form.institution.trim(),
          educationLevel: form.educationLevel,
        });
      if (userType === "mentor")
        Object.assign(data, { expertise: form.expertise.trim() });
      const result = await register(data);
      if (!result.success) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }
      setSuccess(result.referralWarning || "Account created successfully!");
      setTimeout(
        () =>
          currentRole?.verification
            ? navigate("/verify-pending", {
                state: {
                  userType: normalizedUserType,
                  message: `Your ${currentRole.label} account has been created. It's now pending admin verification.`,
                },
              })
            : navigate("/login", {
                state: {
                  message: "Account created! Please sign in to continue.",
                  type: "success",
                },
              }),
        1000,
      );
    } catch (registrationError) {
      setError(
        registrationError.message || "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignup = async () => {
    if (normalizeUserType(userType) === "company") {
      setError("Company accounts must use email and password.");
      return;
    }
    if (!roles.some((role) => role.value === userType)) {
      setError("Please select Student or Mentor first");
      return;
    }
    setGoogleLoading(true);
    setError("");
    try {
      const normalizedUserType = normalizeUserType(userType);
      const referralData =
        referralCode && referralCompanyId
          ? { referralCode, referralCompanyId }
          : referralCode && referralOwnerId
            ? { referralCode, referralOwnerId, referralOwnerType }
            : {};
      const result = await loginWithGoogle({ userType: normalizedUserType, ...referralData });
      if (!result.success) {
        setError(result.error || "Google sign-up failed");
        return;
      }
      setSuccess(result.referralWarning || "Account created! Redirecting...");
      setTimeout(
        () =>
          currentRole?.verification
            ? navigate("/verify-pending", {
                state: {
                  userType: normalizedUserType,
                  message: `Your ${currentRole.label} account is pending admin verification.`,
                },
              })
            : navigate(getDashboardPathByUserType(normalizedUserType), {
                replace: true,
              }),
        1000,
      );
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };
  const disabled = loading || googleLoading;
  const field = (name, label, type = "text", icon, placeholder, required = true) => (
    <Input
      id={name}
      label={label}
      type={type}
      value={form[name]}
      onChange={(event) => update(name, event.target.value)}
      error={fieldErrors[name]}
      disabled={disabled || (name === "email" && Boolean(invitedEmail))}
      leadingIcon={icon}
      showPasswordToggle={type === "password"}
      placeholder={placeholder}
      required={required}
    />
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <section className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-pop dark:bg-slate-900 sm:p-10">
        <div className="mb-5 flex justify-start">
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <span aria-hidden="true">🏠</span>
            Home
          </Link>
        </div>
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <UserRound className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join Career Connect today
          </p>
          <div className="mx-auto mt-6 flex max-w-sm items-center gap-2" role="progressbar" aria-label={`Signup progress: step ${step} of 3`} aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-2 flex-1 rounded-full ${item <= step ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"}`}
              />
            ))}
          </div>
        </header>
        {error && (
          <div
            className="mt-6 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success-dark">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}
        {step === 1 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Select your account type
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {roles.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectRole(value)}
                  className="flex items-center gap-3 rounded-xl border p-4 text-left transition hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <strong className="block text-sm text-slate-900 dark:text-slate-100">
                      {label}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Sign in here
              </Link>
            </p>
            <Link to="/" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600">
              Back to home
            </Link>
          </div>
        )}
        {step === 2 && (
          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              handleNext();
            }}
          >
            <div className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-200">
              Step 2 of 3: {currentRole?.label} account
            </div>
            {invitedEmail && (
              <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                Create your account with the invited email address, then verify it and return to your invitation.
              </p>
            )}
            {userType === "company" && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                You can use your Gmail address. Company accounts are created with
                Firebase email and password; Google sign-up is not available.
              </p>
            )}
            {field(
              "fullName",
              "Full Name",
              "text",
              UserRound,
              "Your full name",
            )}
            {field("email", "Email Address", "email", Mail, "you@example.com")}
            {field(
              "password",
              "Password",
              "password",
              ShieldCheck,
              "At least 8 characters",
            )}
            {field(
              "confirmPassword",
              "Confirm Password",
              "password",
              ShieldCheck,
              "Repeat your password",
            )}
            {field(
              "phone",
              "Phone Number",
              "tel",
              Phone,
              "Optional phone number",
              false,
            )}
            <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(event) =>
                  update("acceptTerms", event.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-brand-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-brand-600">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {fieldErrors.acceptTerms && (
              <p className="text-xs text-danger">{fieldErrors.acceptTerms}</p>
            )}
            {userType !== "company" && (
              <Button
                type="button"
                fullWidth
                variant="outline"
                disabled={disabled}
                onClick={handleGoogleSignup}
              >
                Sign up with Google
              </Button>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                leadingIcon={ArrowLeft}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={disabled}
                trailingIcon={ArrowRight}
              >
                Next
              </Button>
            </div>
          </form>
        )}
        {step === 3 && (
          <form className="mt-8 space-y-5" onSubmit={handleRegister}>
            <div className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-200">
              Step 3 of 3: Complete your profile
            </div>
            {userType === "company" && (
              <>
                {field(
                  "companyName",
                  "Company Name",
                  "text",
                  Building2,
                  "Your company name",
                )}
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Industry
                  <select
                    value={form.industry}
                    onChange={(event) => update("industry", event.target.value)}
                    className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select your industry</option>
                    {industries.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Company Size (optional)
                  <select
                    value={form.companySize}
                    onChange={(event) => update("companySize", event.target.value)}
                    className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select company size</option>
                    {companySizes.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                {field(
                  "website",
                  "Website",
                  "url",
                  Building2,
                  "https://example.com",
                  false,
                )}
                <div className="flex gap-2 rounded-lg border border-info/20 bg-info-light p-4 text-sm text-info-dark">
                  <Info className="h-5 w-5 shrink-0" />
                  Your company account will be reviewed by our admin team.
                </div>
              </>
            )}
            {userType === "student" && (
              <>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Education Level
                  <select
                    value={form.educationLevel}
                    onChange={(event) =>
                      update("educationLevel", event.target.value)
                    }
                    className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select education level</option>
                    {educationLevels.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                {field(
                  "institution",
                  "Institution / University",
                  "text",
                  GraduationCap,
                  "Your institution",
                )}
              </>
            )}
            {userType === "mentor" && (
              <>
                {field("expertise", "Area of expertise", "text", GraduationCap, "For example: software engineering")}
                <div className="flex gap-2 rounded-lg border border-info/20 bg-info-light p-4 text-sm text-info-dark">
                  <Info className="h-5 w-5 shrink-0" />
                  Mentor accounts are reviewed by our admin team before activation.
                </div>
              </>
            )}
            {userType !== "company" && userType !== "student" && userType !== "mentor" && (
              <div className="flex gap-2 rounded-lg border border-info/20 bg-info-light p-4 text-sm text-info-dark">
                <Info className="h-5 w-5 shrink-0" />
                Select a supported account type to continue.
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
                leadingIcon={ArrowLeft}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={loading}
                trailingIcon={CheckCircle2}
              >
                Create Account
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
