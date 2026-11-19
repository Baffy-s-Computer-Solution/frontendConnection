import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  Check,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rocket,
  Target,
  Award,
  Trophy,
  Crown,
  Star,
  Zap,
  Flame,
  Heart,
  Users,
  UserPlus,
  UserCheck,
  Briefcase,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Video,
  MessageSquare,
  DollarSign,
  CreditCard,
  Wallet,
  Globe,
  MapPin,
  Building2,
  Lightbulb,
  Brain,
  Compass,
  Map,
  Navigation,
  Route,
  Flag,
  Crosshair,
  Camera,
  Upload,
  Image as ImageIcon,
  FileText,
  FileCheck,
  Shield,
  Lock,
  Key,
  Fingerprint,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Plus,
  X,
  Save,
  Bell,
  BellRing,
  Settings,
  Sun,
  Moon,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Home,
  Menu,
  LogOut,
  Share2,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Hash,
  AtSign,
  Tag,
  Bookmark,
  Play,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Github,
  Presentation,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Palette,
  Brush,
  PenTool,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  CheckSquare,
  Square,
  Circle,
  CircleDot,
  Dot,
  MoreVertical,
  Sliders,
  Filter,
  Search,
  Grid,
  List as ListIcon,
  LayoutGrid,
  Layers,
  Package,
  Box,
  Gift,
  Sparkle,
  Diamond,
  Gem,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// UTILITY
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const STEP_TYPES = [
  { id: "welcome", title: "Welcome", icon: Sparkles },
  { id: "profile", title: "Profile Setup", icon: UserCheck },
  { id: "photo", title: "Profile Photo", icon: Camera },
  { id: "bio", title: "About You", icon: FileText },
  { id: "expertise", title: "Expertise", icon: Award },
  { id: "experience", title: "Experience", icon: Briefcase },
  { id: "rate", title: "Set Rate", icon: DollarSign },
  { id: "availability", title: "Availability", icon: Calendar },
  { id: "payout", title: "Payout", icon: Wallet },
  { id: "notifications", title: "Notifications", icon: Bell },
  { id: "finish", title: "Finish", icon: Rocket },
];

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading,
  className,
  ...props
}) => {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className={cn("w-4 h-4", children && "mr-2")} />
      ) : null}
      {children}
    </button>
  );
};

const Input = ({ label, error, hint, icon: Icon, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      )}
      <input
        {...props}
        className={cn(
          "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors",
          Icon && "pl-10",
          error ? "border-red-300" : "border-gray-300",
        )}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

// ============================================================================
// STEPS
// ============================================================================

const WelcomeStep = ({ profile }) => (
  <div className="text-center space-y-6">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-xl"
    >
      <Sparkles className="w-12 h-12 text-white" />
    </motion.div>
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome
        {profile?.displayName ? `, ${profile.displayName.split(" ")[0]}` : ""}!
        👋
      </h1>
      <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
        Let's set up your mentor profile in just a few minutes. This helps
        mentees find you and understand what you offer.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
      {[
        {
          icon: UserCheck,
          title: "Build Your Profile",
          description: "Add your story, expertise, and photo",
        },
        {
          icon: DollarSign,
          title: "Set Your Rate",
          description: "Choose your hourly rate",
        },
        {
          icon: Calendar,
          title: "Add Availability",
          description: "When can mentees book you?",
        },
      ].map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-5 text-left"
        >
          <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
            <item.icon className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
        </motion.div>
      ))}
    </div>
    <div className="pt-4 text-sm text-gray-500 flex items-center justify-center space-x-2">
      <Clock className="w-4 h-4" />
      <span>Takes about 5 minutes</span>
    </div>
  </div>
);

const ProfileStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Let's start with the basics
        </h2>
        <p className="mt-1 text-gray-600">
          This information will appear on your public mentor profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Full Name *"
          value={formData.displayName || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, displayName: e.target.value }))
          }
          placeholder="Your full name"
        />
        <Input
          label="Headline *"
          value={formData.headline || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, headline: e.target.value }))
          }
          placeholder="e.g., Senior Software Engineer at Google"
          hint="A short tagline describing what you do"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, email: e.target.value }))
          }
          placeholder="you@example.com"
          icon={Mail}
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, phone: e.target.value }))
          }
          placeholder="+1 (555) 000-0000"
          icon={Phone}
        />
        <Input
          label="Location"
          value={formData.location || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, location: e.target.value }))
          }
          placeholder="City, Country"
          icon={MapPin}
        />
        <Input
          label="Website"
          type="url"
          value={formData.website || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, website: e.target.value }))
          }
          placeholder="https://yoursite.com"
          icon={Globe}
        />
      </div>
    </div>
  );
};

const PhotoStep = ({ data, onChange, userId }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = React.useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Image required");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Under 5MB please");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const sRef = ref(
        storage,
        `mentor-profiles/${userId}/avatar_${Date.now()}_${file.name}`,
      );
      const task = uploadBytesResumable(sRef, file);
      const url = await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (s) =>
            setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref)),
        );
      });
      let finalUrl = url;
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append(
          "upload_preset",
          process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
        );
        fd.append("folder", `mentor-profiles/${userId}`);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: fd },
        );
        const c = await res.json();
        if (c.secure_url) finalUrl = c.secure_url;
      } catch (e) {
        console.warn("Cloudinary failed:", e);
      }

      onChange({ ...data, photoURL: finalUrl });
      toast.success("Photo uploaded!");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const initials = (data.displayName || "M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Add a profile photo
        </h2>
        <p className="mt-1 text-gray-600">
          A friendly photo helps mentees trust and connect with you.
        </p>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            {data.photoURL ? (
              <img
                src={data.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl font-bold text-white">{initials}</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>
        </div>
        {uploading && progress > 0 && (
          <div className="mt-4 w-64">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 text-center">
              {progress}%
            </p>
          </div>
        )}
        <p className="mt-4 text-sm text-gray-500 text-center max-w-md">
          Professional headshot works best. JPG, PNG or GIF up to 5MB.
        </p>
        {data.photoURL && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            icon={X}
            onClick={() => onChange({ ...data, photoURL: "" })}
          >
            Remove photo
          </Button>
        )}
      </div>
    </div>
  );
};

const BioStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState(data);
  useEffect(() => {
    onChange(formData);
  }, [formData]);
  const maxChars = 1000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about yourself
        </h2>
        <p className="mt-1 text-gray-600">
          Share your story and what makes you a great mentor.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bio
        </label>
        <textarea
          value={formData.bio || ""}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              bio: e.target.value.slice(0, maxChars),
            }))
          }
          rows={8}
          placeholder="Tell mentees about your background, passions, and what you can help with..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {(formData.bio || "").length}/{maxChars}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What can mentees expect from you?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              key: "menteeExpectations",
              value: "Personalized 1-on-1 guidance",
              icon: Users,
            },
            {
              key: "menteeExpectations2",
              value: "Actionable career advice",
              icon: Target,
            },
            {
              key: "menteeExpectations3",
              value: "Honest, constructive feedback",
              icon: MessageSquare,
            },
            {
              key: "menteeExpectations4",
              value: "Resources and networking opportunities",
              icon: BookOpen,
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div className="flex items-start space-x-2">
                <item.icon className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span className="text-sm text-gray-700">{item.value}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExpertiseStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    expertise: data.expertise || [],
    industries: data.industries || [],
    languages: data.languages || ["English"],
  });
  const [inputs, setInputs] = useState({
    expertise: "",
    industries: "",
    languages: "",
  });

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const expertSuggestions = [
    "Software Engineering",
    "Product Management",
    "Data Science",
    "UI/UX Design",
    "Marketing",
    "Sales",
    "Entrepreneurship",
    "Career Coaching",
    "Leadership",
    "Public Speaking",
    "Finance",
    "Consulting",
    "Content Creation",
    "Project Management",
  ];
  const industrySuggestions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Media & Entertainment",
    "Consulting",
    "Manufacturing",
    "Non-profit",
    "Government",
  ];
  const languageSuggestions = [
    "English",
    "Spanish",
    "French",
    "German",
    "Mandarin",
    "Hindi",
    "Arabic",
    "Portuguese",
  ];

  const renderTagSection = (field, suggestions) => (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value={inputs[field]}
          onChange={(e) =>
            setInputs((p) => ({ ...p, [field]: e.target.value }))
          }
          onKeyPress={(e) => {
            if (e.key === "Enter" && inputs[field].trim()) {
              e.preventDefault();
              setFormData((p) => ({
                ...p,
                [field]: [...new Set([...p[field], inputs[field].trim()])],
              }));
              setInputs((prev) => ({ ...prev, [field]: "" }));
            }
          }}
          placeholder={`Add ${field}`}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <Button
          type="button"
          variant="secondary"
          icon={Plus}
          onClick={() => {
            if (inputs[field].trim()) {
              setFormData((p) => ({
                ...p,
                [field]: [...new Set([...p[field], inputs[field].trim()])],
              }));
              setInputs((prev) => ({ ...prev, [field]: "" }));
            }
          }}
        >
          Add
        </Button>
      </div>

      {/* Selected */}
      {formData[field].length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {formData[field].map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
            >
              {item}
              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    [field]: p[field].filter((x) => x !== item),
                  }))
                }
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {suggestions
          .filter((s) => !formData[field].includes(s))
          .slice(0, 8)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                setFormData((p) => ({
                  ...p,
                  [field]: [...new Set([...p[field], s])],
                }))
              }
              className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-full transition-colors"
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          What are you an expert in?
        </h2>
        <p className="mt-1 text-gray-600">
          Help mentees find you by listing your areas of expertise.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Areas of Expertise *
        </h3>
        {renderTagSection("expertise", expertSuggestions)}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Industries</h3>
        {renderTagSection("industries", industrySuggestions)}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
        {renderTagSection("languages", languageSuggestions)}
      </div>
    </div>
  );
};

const ExperienceStep = ({ data, onChange }) => {
  const [experiences, setExperiences] = useState(data.experience || []);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  useEffect(() => {
    onChange({ ...data, experience: experiences });
  }, [experiences]);

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.company.trim()) {
      toast.error("Title and company required");
      return;
    }
    if (editing !== null) {
      setExperiences((p) =>
        p.map((e, i) => (i === editing ? { ...formData } : e)),
      );
    } else {
      setExperiences((p) => [...p, { ...formData }]);
    }
    setFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setEditing(null);
  };

  const handleEdit = (idx) => {
    setFormData(experiences[idx]);
    setEditing(idx);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Your professional experience
        </h2>
        <p className="mt-1 text-gray-600">
          Add your work history to establish credibility.
        </p>
      </div>

      {experiences.length > 0 && (
        <div className="space-y-3">
          {experiences.map((exp, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{exp.title}</p>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {exp.startDate} -{" "}
                    {exp.current ? "Present" : exp.endDate || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(i)}
                  className="p-1.5 rounded hover:bg-white text-gray-600"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setExperiences((p) => p.filter((_, idx) => idx !== i))
                  }
                  className="p-1.5 rounded hover:bg-white text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 space-y-4">
        <h3 className="font-medium text-gray-900">
          {editing !== null ? "Edit experience" : "Add experience"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Job Title"
            value={formData.title}
            onChange={(e) =>
              setFormData((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Senior Engineer"
          />
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) =>
              setFormData((p) => ({ ...p, company: e.target.value }))
            }
            placeholder="Google"
          />
          <Input
            label="Start Date"
            type="month"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((p) => ({ ...p, startDate: e.target.value }))
            }
          />
          <div>
            <Input
              label="End Date"
              type="month"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((p) => ({ ...p, endDate: e.target.value }))
              }
              disabled={formData.current}
            />
            <label className="flex items-center space-x-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    current: e.target.checked,
                    endDate: e.target.checked ? "" : p.endDate,
                  }))
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">
                Currently working here
              </span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            rows={2}
            placeholder="Brief summary of your role"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
        <div className="flex items-center justify-end space-x-2">
          {editing !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormData({
                  title: "",
                  company: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                });
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            icon={editing !== null ? Check : Plus}
            onClick={handleAdd}
          >
            {editing !== null ? "Save" : "Add Experience"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const RateStep = ({ data, onChange }) => {
  const [rate, setRate] = useState(data.hourlyRate ?? 0);
  const [currency, setCurrency] = useState(data.currency || "LSL");

  useEffect(() => {
    onChange({ ...data, hourlyRate: rate, currency });
  }, [rate, currency]);

  const currencies = [{ code: "LSL", symbol: "L", label: "Lesotho Loti" }];

  const currentSymbol =
    currencies.find((c) => c.code === currency)?.symbol || "L";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Set your hourly rate
        </h2>
        <p className="mt-1 text-gray-600">
          You can always change this later or offer free intro sessions.
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
        <div className="text-center">
          <p className="text-sm text-indigo-700 font-medium mb-2">
            Your hourly rate
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-5xl font-bold text-gray-900">
              {currentSymbol}
              {rate}
            </span>
            <span className="text-xl text-gray-500">/hour</span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={500}
          step={5}
          value={rate}
          onChange={(e) => setRate(parseInt(e.target.value))}
          className="w-full mt-8 accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{currentSymbol}0 (Free)</span>
          <span>{currentSymbol}250</span>
          <span>{currentSymbol}500+</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                currency === c.code
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <span
                className={cn(
                  "text-xl font-bold",
                  currency === c.code ? "text-indigo-700" : "text-gray-700",
                )}
              >
                {c.symbol}
              </span>
              <span className="text-xs font-medium text-gray-600 mt-1">
                {c.code}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Suggested rates</p>
          <p className="text-xs text-blue-700 mt-1">
            Set a rate that reflects your experience and the value of your
            mentoring.
          </p>
        </div>
      </div>
    </div>
  );
};

const AvailabilityStep = ({ data, onChange }) => {
  const DAYS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const [availability, setAvailability] = useState(data.availability || {});
  const [timezone, setTimezone] = useState(
    data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  useEffect(() => {
    onChange({ ...data, availability, timezone });
  }, [availability, timezone]);

  const toggleSlot = (dayKey, hour) => {
    const slots = availability[dayKey] || [];
    const has = slots.includes(hour);
    setAvailability((p) => ({
      ...p,
      [dayKey]: has
        ? slots.filter((h) => h !== hour)
        : [...slots, hour].sort((a, b) => a - b),
    }));
  };

  const applyPreset = (preset) => setAvailability(preset);

  const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  const formatHour = (h) =>
    h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          When are you available?
        </h2>
        <p className="mt-1 text-gray-600">
          Select the hours when mentees can book you.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick presets
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Weekday Mornings",
              data: {
                monday: [8, 9, 10, 11, 12],
                tuesday: [8, 9, 10, 11, 12],
                wednesday: [8, 9, 10, 11, 12],
                thursday: [8, 9, 10, 11, 12],
                friday: [8, 9, 10, 11, 12],
              },
            },
            {
              label: "Weekday Evenings",
              data: {
                monday: [17, 18, 19, 20, 21],
                tuesday: [17, 18, 19, 20, 21],
                wednesday: [17, 18, 19, 20, 21],
                thursday: [17, 18, 19, 20, 21],
                friday: [17, 18, 19, 20, 21],
              },
            },
            {
              label: "Weekdays 9-5",
              data: {
                monday: [9, 10, 11, 12, 13, 14, 15, 16],
                tuesday: [9, 10, 11, 12, 13, 14, 15, 16],
                wednesday: [9, 10, 11, 12, 13, 14, 15, 16],
                thursday: [9, 10, 11, 12, 13, 14, 15, 16],
                friday: [9, 10, 11, 12, 13, 14, 15, 16],
              },
            },
            {
              label: "Weekends Only",
              data: {
                saturday: [9, 10, 11, 12, 13, 14, 15, 16, 17],
                sunday: [9, 10, 11, 12, 13, 14, 15, 16, 17],
              },
            },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.data)}
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <p className="text-xs font-medium text-gray-700 text-center">
                {p.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="w-20"></th>
              {HOURS.map((h) => (
                <th key={h} className="text-xs font-medium text-gray-500 pb-2">
                  {formatHour(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day.key}>
                <td className="text-xs font-medium text-gray-700 pr-2">
                  {day.label}
                </td>
                {HOURS.map((h) => {
                  const available = (availability[day.key] || []).includes(h);
                  return (
                    <td key={h}>
                      <button
                        onClick={() => toggleSlot(day.key, h)}
                        className={cn(
                          "w-full h-7 rounded transition-colors",
                          available
                            ? "bg-indigo-500 hover:bg-indigo-600"
                            : "bg-gray-100 hover:bg-indigo-100",
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="America/New_York">Eastern Time (US)</option>
          <option value="America/Chicago">Central Time (US)</option>
          <option value="America/Denver">Mountain Time (US)</option>
          <option value="America/Los_Angeles">Pacific Time (US)</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Dubai">Dubai</option>
          <option value="Asia/Kolkata">Mumbai / Delhi</option>
          <option value="Asia/Singapore">Singapore</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>
    </div>
  );
};

const PayoutStep = ({ data, onChange }) => {
  const [method, setMethod] = useState(data.payoutMethod || "bank_transfer");
  const [details, setDetails] = useState(
    data.payoutDetails || {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      paypalEmail: "",
    },
  );

  useEffect(() => {
    onChange({ ...data, payoutMethod: method, payoutDetails: details });
  }, [method, details]);

  const methods = [
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: Building2,
      desc: "Standard 3-5 day transfer",
    },
    {
      value: "paypal",
      label: "PayPal",
      icon: DollarSign,
      desc: "Instant to your PayPal",
    },
    {
      value: "stripe",
      label: "Stripe Connect",
      icon: CreditCard,
      desc: "Automatic weekly payouts",
    },
    {
      value: "wise",
      label: "Wise",
      icon: Globe,
      desc: "Best for international",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          How should we pay you?
        </h2>
        <p className="mt-1 text-gray-600">
          Choose your preferred payout method. You can change this anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMethod(m.value)}
            className={cn(
              "flex items-start p-4 rounded-lg border-2 transition-all text-left",
              method === m.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <div
              className={cn(
                "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 mr-3",
                method === m.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {method === "bank_transfer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Input
            label="Account Holder Name"
            value={details.accountName}
            onChange={(e) =>
              setDetails((p) => ({ ...p, accountName: e.target.value }))
            }
            placeholder="John Doe"
          />
          <Input
            label="Bank Name"
            value={details.bankName}
            onChange={(e) =>
              setDetails((p) => ({ ...p, bankName: e.target.value }))
            }
            placeholder="Chase Bank"
          />
          <Input
            label="Account Number"
            value={details.accountNumber}
            onChange={(e) =>
              setDetails((p) => ({ ...p, accountNumber: e.target.value }))
            }
            placeholder="000123456789"
          />
          <Input
            label="Routing Number"
            value={details.routingNumber}
            onChange={(e) =>
              setDetails((p) => ({ ...p, routingNumber: e.target.value }))
            }
            placeholder="021000021"
          />
        </div>
      )}

      {method === "paypal" && (
        <div className="pt-2">
          <Input
            label="PayPal Email"
            type="email"
            value={details.paypalEmail}
            onChange={(e) =>
              setDetails((p) => ({ ...p, paypalEmail: e.target.value }))
            }
            placeholder="you@paypal.com"
            icon={Mail}
          />
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-900">
            Your information is secure
          </p>
          <p className="text-xs text-green-700 mt-1">
            All payment information is encrypted and stored securely. We never
            share your details.
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationsStep = ({ data, onChange }) => {
  const [prefs, setPrefs] = useState(
    data.notificationPreferences || {
      emailNotifications: true,
      pushNotifications: true,
      sessionReminders: true,
      newMenteeAlerts: true,
      messageAlerts: true,
      reviewAlerts: true,
      paymentAlerts: true,
    },
  );

  useEffect(() => {
    onChange({ ...data, notificationPreferences: prefs });
  }, [prefs]);

  const toggles = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      desc: "Get updates in your inbox",
      icon: Mail,
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      desc: "Browser notifications",
      icon: BellRing,
    },
    {
      key: "sessionReminders",
      label: "Session Reminders",
      desc: "30 min before sessions",
      icon: Clock,
    },
    {
      key: "newMenteeAlerts",
      label: "New Mentee Alerts",
      desc: "When someone requests you",
      icon: UserPlus,
    },
    {
      key: "messageAlerts",
      label: "Message Alerts",
      desc: "New messages from mentees",
      icon: MessageSquare,
    },
    {
      key: "reviewAlerts",
      label: "Review Alerts",
      desc: "When mentees leave reviews",
      icon: Star,
    },
    {
      key: "paymentAlerts",
      label: "Payment Alerts",
      desc: "Payments and payouts",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Choose your notifications
        </h2>
        <p className="mt-1 text-gray-600">
          We'll only send you what you want to hear about.
        </p>
      </div>

      <div className="space-y-1 border border-gray-200 rounded-lg divide-y divide-gray-100">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <t.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                prefs[t.key] ? "bg-indigo-600" : "bg-gray-200",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                  prefs[t.key] ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinishStep = ({ profile }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-xl"
      >
        <Check className="w-12 h-12 text-white" strokeWidth={3} />
      </motion.div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">You're all set! 🎉</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
          Your mentor profile is now live. Mentees can start discovering and
          booking you.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-white">
                {(profile?.displayName || "M")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-gray-900">
              {profile?.displayName || "Your Name"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {profile?.headline || "Mentor"}
            </p>
            <div className="flex items-center mt-1 space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" /> Profile Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
        {[
          {
            icon: Users,
            title: "Share Your Profile",
            desc: "Let mentees know you're available",
            action: () => navigate("/mentor/profile"),
          },
          {
            icon: Calendar,
            title: "Schedule Sessions",
            desc: "View your calendar",
            action: () => navigate("/mentor/sessions"),
          },
          {
            icon: Rocket,
            title: "Go to Dashboard",
            desc: "Manage everything",
            action: () => navigate("/mentor/dashboard"),
          },
        ].map((item, i) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={item.action}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <item.icon className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const mentorId = user?.uid;

  useEffect(() => {
    if (!mentorId) return;
    getDoc(doc(db, "mentors", mentorId)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setProfile({ id: snap.id, ...d });
        if (d.onboardingCompleted) {
          // Already done — redirect
          navigate("/mentor/dashboard");
        }
      }
    });
  }, [mentorId, navigate]);

  const handleNext = useCallback(async () => {
    // Save current step data
    const step = STEP_TYPES[currentStep];
    if (step.id !== "welcome" && step.id !== "finish") {
      setSaving(true);
      try {
        const updates = { ...stepData, updatedAt: serverTimestamp() };
        if (step.id === "profile" && stepData.displayName)
          updates.displayName = stepData.displayName;
        if (step.id === "photo" && stepData.photoURL)
          updates.photoURL = stepData.photoURL;

        await updateDoc(doc(db, "mentors", mentorId), updates);

        // Sync to Supabase
        try {
          await supabase.from("mentor_profiles").upsert(
            {
              firebase_id: mentorId,
              ...Object.fromEntries(
                Object.entries(updates).filter(
                  ([_, v]) => typeof v !== "object" || v === null,
                ),
              ),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "firebase_id" },
          );
        } catch (e) {
          console.warn("Supabase sync failed:", e);
        }

        setCompletedSteps((p) => new Set([...p, step.id]));
      } catch (e) {
        console.error(e);
        toast.error("Failed to save progress");
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (currentStep < STEP_TYPES.length - 1) {
      setCurrentStep((p) => p + 1);
    }
  }, [currentStep, stepData, mentorId]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "mentors", mentorId), {
        onboardingCompleted: true,
        onboardingCompletedAt: serverTimestamp(),
        profileCompleted: true,
      });

      try {
        await supabase.from("mentor_profiles").upsert(
          {
            firebase_id: mentorId,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          },
          { onConflict: "firebase_id" },
        );
      } catch (e) {
        console.warn("supabase", e);
      }

      // Welcome notification
      await addDoc(collection(db, "notifications"), {
        userId: mentorId,
        type: "onboarding_complete",
        title: "Welcome to CareerConnect! 🎉",
        message: "Your mentor profile is live. Start accepting mentees today!",
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success("Welcome aboard!");
      navigate("/mentor/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to complete onboarding");
    } finally {
      setSaving(false);
    }
  }, [mentorId, navigate]);

  const handleSkip = useCallback(() => {
    if (
      window.confirm(
        "Skip onboarding? You can complete your profile later in Settings.",
      )
    ) {
      handleComplete();
    }
  }, [handleComplete]);

  const progress = ((currentStep + 1) / STEP_TYPES.length) * 100;
  const step = STEP_TYPES[currentStep];

  if (authLoading) return <LoadingSpinner />;
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">CareerConnect</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>

          {/* Progress bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                Step {currentStep + 1} of {STEP_TYPES.length}
              </span>
              <span className="text-xs font-medium text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2">
          {STEP_TYPES.map((s, i) => {
            const isActive = i === currentStep;
            const isComplete = completedSteps.has(s.id) || i < currentStep;
            return (
              <button
                key={s.id}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                disabled={i > currentStep}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : isComplete
                      ? "bg-green-100 text-green-700"
                      : "bg-white text-gray-400 border border-gray-200",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
                    isActive
                      ? "bg-white bg-opacity-20"
                      : isComplete
                        ? "bg-green-500 text-white"
                        : "bg-gray-100",
                  )}
                >
                  {isComplete && !isActive ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs font-medium">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step.id === "welcome" && <WelcomeStep profile={profile} />}
              {step.id === "profile" && (
                <ProfileStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "photo" && (
                <PhotoStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                  userId={mentorId}
                />
              )}
              {step.id === "bio" && (
                <BioStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "expertise" && (
                <ExpertiseStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "experience" && (
                <ExperienceStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "rate" && (
                <RateStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "availability" && (
                <AvailabilityStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "payout" && (
                <PayoutStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "notifications" && (
                <NotificationsStep
                  data={{ ...profile, ...stepData }}
                  onChange={(d) => setStepData((p) => ({ ...p, ...d }))}
                />
              )}
              {step.id === "finish" && (
                <FinishStep profile={{ ...profile, ...stepData }} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step.id !== "finish" && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              Back
            </Button>
            <Button
              size="lg"
              icon={currentStep === STEP_TYPES.length - 2 ? Check : ArrowRight}
              loading={saving}
              onClick={
                currentStep === STEP_TYPES.length - 2
                  ? handleComplete
                  : handleNext
              }
            >
              {currentStep === 0
                ? "Get Started"
                : currentStep === STEP_TYPES.length - 2
                  ? "Complete Setup"
                  : "Continue"}
            </Button>
          </div>
        )}

        {/* Skip hint */}
        {step.id !== "welcome" && step.id !== "finish" && (
          <p className="mt-4 text-center text-xs text-gray-500">
            You can always update this later in{" "}
            <Link
              to="/mentor/settings"
              className="text-indigo-600 hover:underline"
            >
              Settings
            </Link>
            .
          </p>
        )}
      </main>
    </div>
  );
};

export default MentorOnboarding;
