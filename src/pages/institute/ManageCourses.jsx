import { useState } from 'react';
import Button from '../../components/ui/Button';

function ManageCourses() {
  const [loading] = useState(false);

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8"><h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">Manage Courses</h1>

      <section className="mb-6 rounded-xl border bg-white p-6 shadow-card dark:bg-slate-900"><h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Course Management System</h2><p className="mt-3 text-sm text-slate-500">
            This page allows institute administrators to manage courses, including:
          </p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Creating new courses</li>
            <li>Updating existing courses</li>
            <li>Managing course content and materials</li>
            <li>Setting course schedules and fees</li>
            <li>Tracking student enrollment</li>
          </ul>

          {loading ? (
            <span className="text-sm text-slate-500">Loading...</span>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="primary">Add New Course</Button><Button variant="outline">View All Courses</Button><Button variant="info">Export Course List</Button>
            </div>
          )}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-card dark:bg-slate-900"><h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Stats</h2><div className="mt-5 grid grid-cols-2 gap-4 text-center md:grid-cols-4"><div><h3 className="text-2xl font-semibold">12</h3><p className="text-sm text-slate-500">Active Courses</p>
            </div>
            <div><h3 className="text-2xl font-semibold">156</h3><p className="text-sm text-slate-500">Enrolled Students</p>
            </div>
            <div><h3 className="text-2xl font-semibold">8</h3><p className="text-sm text-slate-500">Instructors</p>
            </div>
            <div><h3 className="text-2xl font-semibold">4</h3><p className="text-sm text-slate-500">New This Month</p>
            </div>
          </div>
      </section></main>
  );
}

export default ManageCourses;
