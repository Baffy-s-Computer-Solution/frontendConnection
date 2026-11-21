import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  FileText,
  MapPin,
  Send,
  UploadCloud,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import {
  applyForJob,
  checkExistingApplication,
  getStudentProfile,
  uploadResume,
} from '../../services/studentServices';
import { formatLocation } from '../../utils/formatters';

const APPLICATION_STEPS = [
  { title: 'Your profile', description: 'Check your details' },
  { title: 'Your resume', description: 'Attach a resume' },
  { title: 'Cover letter', description: 'Review and submit' },
];

const formatSalary = (salary) => {
  if (!salary) return 'Negotiable';
  if (typeof salary === 'object' && salary.amount) {
    return `M${salary.amount}${salary.currency ? ` ${salary.currency}` : ''}`;
  }
  if (typeof salary === 'number') return `M${salary.toLocaleString()}`;
  return salary;
};

const toDate = (value) => {
  if (!value) return null;
  try {
    const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const formatDeadline = (deadline) => {
  const date = toDate(deadline);
  return date
    ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Open until filled';
};

const getJobType = (job) => job?.type || job?.jobType || 'Opportunity';

const ApplyJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const fileInputRef = useRef(null);

  const [job, setJob] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        const [jobResult, profileResult, appliedCheck] = await Promise.all([
          jobService.getJob(jobId),
          getStudentProfile(user.uid),
          checkExistingApplication(user.uid, jobId),
        ]);

        if (!active) return;

        if (jobResult?.success) {
          setJob(jobResult.data);
        } else {
          setMessage({
            type: 'error',
            text: jobResult?.error || 'We could not find this job. It may have been removed.',
          });
        }

        if (profileResult?.success) {
          setStudentProfile(profileResult.data);
        } else if (jobResult?.success) {
          setMessage({
            type: 'warning',
            text: 'Complete your student profile before sending an application.',
          });
        }

        if (appliedCheck?.success) {
          setHasApplied(appliedCheck.exists === true);
          if (appliedCheck.exists) {
            setMessage({
              type: 'warning',
              text: 'You have already applied for this position.',
            });
          }
        } else {
          setMessage({
            type: 'error',
            text: appliedCheck?.error || 'We could not verify your application status. Please try again.',
          });
        }
      } catch (error) {
        if (!active) return;
        console.error('Error loading application data:', error);
        setMessage({
          type: 'error',
          text: 'We could not load the application details. Please refresh and try again.',
        });
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (!jobId) {
      setMessage({ type: 'error', text: 'No job was selected. Return to Jobs and choose a position.' });
      setIsLoading(false);
    } else if (user?.uid) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [jobId, user?.uid]);

  const deadlineDate = toDate(job?.deadline);
  const today = new Date();
  const deadlineDay = deadlineDate
    ? new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate())
    : null;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isJobClosed =
    Boolean(job) &&
    (String(job.status || 'active').toLowerCase() !== 'active' ||
      Boolean(deadlineDay && deadlineDay.getTime() < todayStart.getTime()));

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      setResumeFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Choose a PDF, DOC, or DOCX resume.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Your resume must be smaller than 5 MB.' });
      return;
    }

    setResumeFile(file);
    setMessage({ type: '', text: '' });
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      setMessage({ type: 'error', text: 'Select a resume file before uploading.' });
      return;
    }

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadResume(resumeFile, user.uid);
      if (!result?.success || !result.url) {
        setMessage({
          type: 'error',
          text: result?.error || 'Your resume could not be uploaded. Please try again.',
        });
        return;
      }

      setStudentProfile((profile) => ({ ...profile, resumeUrl: result.url }));
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage({ type: 'success', text: 'Resume uploaded and saved to your profile.' });
    } catch (error) {
      console.error('Resume upload failed:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Your resume could not be uploaded. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 0 && !studentProfile?.fullName) {
      setMessage({ type: 'warning', text: 'Complete your profile before continuing.' });
      return;
    }
    if (currentStep === 1 && !studentProfile?.resumeUrl) {
      setMessage({ type: 'warning', text: 'Upload a resume before continuing.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setCurrentStep((step) => Math.min(step + 1, APPLICATION_STEPS.length - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!job || isJobClosed) {
      setMessage({ type: 'error', text: 'Applications are closed for this position.' });
      return;
    }
    if (hasApplied) {
      setMessage({ type: 'warning', text: 'You have already applied for this position.' });
      return;
    }
    if (!studentProfile?.fullName) {
      setMessage({ type: 'error', text: 'Complete your profile information before applying.' });
      setCurrentStep(0);
      return;
    }
    if (!studentProfile?.resumeUrl) {
      setMessage({ type: 'error', text: 'Upload your resume before applying.' });
      setCurrentStep(1);
      return;
    }
    if (!coverLetter.trim() || coverLetter.length > 1000) {
      setMessage({
        type: 'error',
        text: coverLetter.length > 1000
          ? 'Your cover letter must be 1,000 characters or fewer.'
          : 'Write a cover letter before submitting your application.',
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await applyForJob({
        studentId: user.uid,
        studentName: studentProfile.fullName,
        studentEmail: studentProfile.email || user.email,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        companyId: job.companyId,
        coverLetter: coverLetter.trim(),
        resumeUrl: studentProfile.resumeUrl,
        appliedAt: new Date(),
        status: 'pending',
        jobType: job.type,
        jobLocation: job.location,
        jobSalary: job.salary,
        studentEducation: studentProfile.educationLevel,
        studentSkills: studentProfile.skills,
        studentInstitution: studentProfile.institution,
        phoneNumber: studentProfile.phoneNumber,
        address: studentProfile.address,
      });

      if (!result?.success) {
        setMessage({
          type: 'error',
          text: result?.error || 'Your application could not be submitted. Please try again.',
        });
        return;
      }

      await jobService.incrementApplicantCount(job.id);
      setHasApplied(true);
      setMessage({
        type: 'success',
        text: 'Your application was submitted successfully. You can track it from Applications.',
      });
    } catch (error) {
      console.error('Application submission failed:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Your application could not be submitted. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToJobs = () => navigate('/student/jobs');

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center" role="status">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading your application...</p>
        </div>
      </main>
    );
  }

  const fullName = studentProfile?.fullName || 'Name not provided';
  const email = studentProfile?.email || user?.email || 'Email not provided';
  const coverLetterRemaining = 1000 - coverLetter.length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/student/jobs"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to jobs
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              Job application
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Apply with confidence
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Complete each step to send your application to the employer.
            </p>
          </div>
          <button
            type="button"
            onClick={goToJobs}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300 sm:self-auto"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            Browse jobs
          </button>
        </header>

        {message.text && (
          <div
            className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                : message.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
            }`}
            role={message.type === 'success' ? 'status' : 'alert'}
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1">{message.text}</p>
            {message.type === 'success' && hasApplied && (
              <Link
                to="/student/applications"
                className="shrink-0 font-semibold underline underline-offset-2"
              >
                View applications
              </Link>
            )}
          </div>
        )}

        {!job ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">Job not found</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              This position may have been removed. Browse available jobs to find another opportunity.
            </p>
            <button
              type="button"
              onClick={goToJobs}
              className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Browse available jobs
            </button>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Application details</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Complete each step in order, and go back any time to review earlier details.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                    Step {currentStep + 1} of {APPLICATION_STEPS.length}
                  </span>
                </div>

                <div
                  className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                  role="progressbar"
                  aria-label="Application progress"
                  aria-valuemin={0}
                  aria-valuemax={APPLICATION_STEPS.length}
                  aria-valuenow={currentStep + 1}
                >
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / APPLICATION_STEPS.length) * 100}%` }}
                  />
                </div>

                <ol className="grid grid-cols-3 gap-2" aria-label="Application steps">
                  {APPLICATION_STEPS.map((step, index) => {
                    const complete = index < currentStep;
                    const current = index === currentStep;
                    return (
                      <li key={step.title}>
                        <button
                          type="button"
                          onClick={() => index < currentStep && setCurrentStep(index)}
                          disabled={index >= currentStep}
                          aria-current={current ? 'step' : undefined}
                          className={`flex w-full items-center gap-2 rounded-xl p-2 text-left transition sm:p-3 ${
                            current
                              ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                              : complete
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-slate-400 dark:text-slate-500'
                          } ${complete ? 'cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30' : 'cursor-default'}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              current
                                ? 'bg-brand-600 text-white'
                                : complete
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold sm:text-sm">{step.title}</span>
                            <span className="hidden text-xs opacity-75 sm:block">{step.description}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-7">
                {currentStep === 0 && (
                  <div>
                    <div className="mb-5 flex items-start gap-3">
                      <span className="rounded-xl bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                        <UserRound className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-semibold">Check your profile</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          These details will be shared with the employer.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['Full name', fullName],
                        ['Email address', email],
                        ['Education', formatLocation(studentProfile?.educationLevel, 'Not specified')],
                        ['Institution', formatLocation(studentProfile?.institution, 'Not specified')],
                        ['Phone', studentProfile?.phoneNumber || 'Not provided'],
                        ['Location', formatLocation(studentProfile?.address, 'Not provided')],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
                        >
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                          <p className="mt-1 break-words text-sm font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>

                    {Array.isArray(studentProfile?.skills) && studentProfile.skills.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-semibold">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!studentProfile?.fullName && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        Complete your name on your profile before applying.
                        <Link to="/student/profile" className="ml-1 font-semibold underline">
                          Update profile
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 1 && (
                  <div>
                    <div className="mb-5 flex items-start gap-3">
                      <span className="rounded-xl bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-semibold">Add your resume</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Upload a PDF or Word document. Maximum file size is 5 MB.
                        </p>
                      </div>
                    </div>

                    {studentProfile?.resumeUrl && (
                      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-white p-2 text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                              Resume saved to your profile
                            </p>
                            <p className="text-xs text-emerald-800 dark:text-emerald-300">
                              You can use this resume or upload a newer version.
                            </p>
                          </div>
                        </div>
                        <a
                          href={studentProfile.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-emerald-800 underline underline-offset-2 dark:text-emerald-200"
                        >
                          View resume
                        </a>
                      </div>
                    )}

                    <label
                      htmlFor="resume-upload"
                      className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-brand-500 dark:hover:bg-brand-950/20"
                    >
                      <UploadCloud className="h-8 w-8 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                      <span className="mt-3 text-sm font-semibold">
                        {resumeFile ? resumeFile.name : 'Choose a resume file'}
                      </span>
                      <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        PDF, DOC, or DOCX · up to 5 MB
                      </span>
                      <input
                        id="resume-upload"
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        className="sr-only"
                      />
                    </label>

                    {resumeFile && (
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB selected
                        </p>
                        <button
                          type="button"
                          onClick={handleUploadResume}
                          disabled={isUploading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUploading ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Uploading securely...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" aria-hidden="true" />
                              Upload resume
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {isUploading && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">
                        Uploading your resume securely. Keep this page open until it finishes.
                      </p>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <div className="mb-5 flex items-start gap-3">
                      <span className="rounded-xl bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                        <Send className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-semibold">Write your cover letter</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Tell the employer why you are interested and what you bring to this role.
                        </p>
                      </div>
                    </div>

                    <label htmlFor="cover-letter" className="mb-2 block text-sm font-semibold">
                      Cover letter <span className="text-red-600" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="cover-letter"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Introduce yourself, describe relevant experience or skills, and explain why this opportunity interests you."
                      rows={8}
                      maxLength={1000}
                      required
                      disabled={hasApplied}
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <p className={`mt-2 text-right text-xs ${coverLetterRemaining < 0 ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}>
                      {coverLetter.length}/1,000 characters
                    </p>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Ready to send
                      </p>
                      <p className="mt-2 text-sm">
                        Your profile, resume, and cover letter will be shared with{' '}
                        <strong>{job.companyName || 'the employer'}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: '', text: '' });
                      setCurrentStep((step) => Math.max(step - 1, 0));
                    }}
                    disabled={currentStep === 0 || isSubmitting || hasApplied}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </button>

                  {currentStep < APPLICATION_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      disabled={
                        hasApplied ||
                        isJobClosed ||
                        (currentStep === 0 && !studentProfile?.fullName) ||
                        (currentStep === 1 && !studentProfile?.resumeUrl)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue to {APPLICATION_STEPS[currentStep + 1].title.toLowerCase()}
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        hasApplied ||
                        isJobClosed ||
                        !coverLetter.trim() ||
                        coverLetter.length > 1000
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Sending application...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          {hasApplied ? 'Application sent' : 'Submit application'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="bg-gradient-to-br from-brand-700 via-brand-700 to-violet-700 p-5 text-white sm:p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                    {getJobType(job)}
                  </span>
                  <h2 className="mt-4 text-xl font-bold leading-tight">{job.title}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                    <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {job.companyName || 'Company not listed'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Location</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatLocation(job.location, 'Remote')}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <CircleDollarSign className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Salary</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatSalary(job.salary)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <CalendarDays className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Deadline</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatDeadline(job.deadline)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <UserRound className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Applicants</p>
                    <p className="mt-0.5 text-sm font-semibold">{job.applicantsCount || 0}</p>
                  </div>
                </div>

                {isJobClosed && (
                  <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    Applications are closed for this position.
                  </div>
                )}
              </section>

              {(job.description || job.requirements) && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="font-semibold">About this position</h3>
                  {job.description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {job.description}
                    </p>
                  )}
                  {job.requirements && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold">Requirements</h4>
                      {Array.isArray(job.requirements) ? (
                        <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                          {job.requirements.map((requirement, index) => (
                            <li key={`${requirement}-${index}`} className="flex gap-2">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                          {job.requirements}
                        </p>
                      )}
                    </div>
                  )}
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default ApplyJob;
