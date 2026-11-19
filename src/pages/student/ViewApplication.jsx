/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getStudentApplications,
  getStudentJobApplications,
  getStudentProfile,
} from "../../services/studentServices";

const ViewApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const location = useLocation();

  const [application, setApplication] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationType, setApplicationType] = useState("");

  useEffect(() => {
    if (user?.uid && applicationId) {
      loadApplication();
    }
  }, [user, applicationId]);

  const loadApplication = async () => {
    try {
      setIsLoading(true);

      const type = location.state?.type || "";
      setApplicationType(type);

      let applicationData = null;

      if (type === "course" || !type) {
        const courseApps = await getStudentApplications(user.uid);
        if (courseApps.success) {
          applicationData = courseApps.data.find(
            (app) => app.id === applicationId,
          );
        }
      }

      if ((type === "job" || !type) && !applicationData) {
        const jobApps = await getStudentJobApplications(user.uid);
        if (jobApps.success) {
          applicationData = jobApps.data.find(
            (app) => app.id === applicationId,
          );
          if (applicationData) setApplicationType("job");
        }
      }

      if (applicationData) {
        setApplication(applicationData);
      } else {
        console.error("Application not found");
      }

      const profileRes = await getStudentProfile(user.uid);
      if (profileRes.success) {
        setStudentProfile(profileRes.data);
      }
    } catch (error) {
      console.error("Error loading application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return "Invalid Date";
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
        label: "Pending",
      },
      under_review: {
        className:
          "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
        label: "Under Review",
      },
      approved: {
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
        label: "Approved",
      },
      rejected: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200",
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || {
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
      label: "Pending",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const navigateBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-slate-50 px-4 py-4 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Application Not Found
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  The requested application could not be found.
                </p>
              </div>
              <button
                type="button"
                onClick={navigateBack}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const infoRows =
    applicationType === "job"
      ? [
          { label: "Job Title", value: application.jobTitle },
          { label: "Company", value: application.companyName },
          { label: "Location", value: application.location || "Not specified" },
          { label: "Job Type", value: application.jobType || "Not specified" },
        ]
      : [
          { label: "Course Name", value: application.courseName },
          { label: "Institution", value: application.institutionName },
          {
            label: "Course Duration",
            value: application.duration || "Not specified",
          },
          {
            label: "Fees",
            value: application.fees ? `$${application.fees}` : "Not specified",
          },
        ];

  const applicantRows = [
    {
      label: "Full Name",
      value: studentProfile?.fullName || application.studentName,
    },
    {
      label: "Email",
      value: studentProfile?.email || application.studentEmail,
    },
    {
      label: "Education Level",
      value: studentProfile?.educationLevel || "Not specified",
    },
    { label: "Phone", value: studentProfile?.phone || "Not provided" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {applicationType === "job" ? "Job" : "Course"} Application
                Details
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                View your application information and status
              </p>
            </div>
            <button
              type="button"
              onClick={navigateBack}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ← Back to Applications
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {applicationType === "job"
                    ? application.jobTitle
                    : application.courseName}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Application ID: {application.id}
                </p>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Application Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Application Type
                </p>
                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                  {applicationType === "job"
                    ? "Job Application"
                    : "Course Application"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Applied On
                </p>
                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(application.appliedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Status
                </p>
                <div className="mt-1">{getStatusBadge(application.status)}</div>
              </div>
              {application.updatedAt && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Last Updated
                  </p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(application.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              {applicationType === "job" ? "Job Details" : "Course Details"}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {infoRows.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Applicant Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {applicantRows.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Application Timeline
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Application Submitted",
                  description: formatDate(application.appliedAt),
                  active: true,
                },
                {
                  title: "Under Review",
                  description:
                    application.status === "under_review"
                      ? "Currently being reviewed"
                      : ["approved", "rejected"].includes(application.status)
                        ? "Review completed"
                        : "Pending review",
                  active: ["under_review", "approved", "rejected"].includes(
                    application.status,
                  ),
                },
                {
                  title: "Decision Made",
                  description:
                    application.status === "approved"
                      ? "Application approved"
                      : application.status === "rejected"
                        ? "Application rejected"
                        : "Waiting for decision",
                  active: ["approved", "rejected"].includes(application.status),
                },
              ].map(({ title, description, active }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className={[
                      "mt-1 h-4 w-4 rounded-full border-2",
                      active
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                    ].join(" ")}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={navigateBack}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Back to Applications
              </button>
              {application.status === "pending" && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-900/70"
                >
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplication;
