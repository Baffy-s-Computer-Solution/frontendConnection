import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, BriefcaseBusiness, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToStudentApplications, subscribeToActiveJobs } from '../../services/studentServices';
import { subscribeToStudentMentorshipData } from '../../services/studentMentorshipService';
import { Container, Row, Col, Card, Button, Badge, ListGroup } from '../../components/ui/tailwindCompat';

const Calendar = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const stopJobs = subscribeToActiveJobs(setJobs, (loadError) => setError(loadError.message || 'Could not load live deadlines.'));
    const stopApplications = uid ? subscribeToStudentApplications(uid, setApplications, (loadError) => setError(loadError.message || 'Could not load applications.')) : () => {};
    const stopSessions = uid ? subscribeToStudentMentorshipData(uid, ({ sessions: records }) => setSessions(records), (loadError) => setError(loadError.message || 'Could not load mentorship sessions.')) : () => {};
    return () => { stopJobs(); stopApplications(); stopSessions(); };
  }, [uid]);
  const events = useMemo(() => {
    const records = [];
    jobs.filter((job) => job.deadline).forEach((job) => records.push({ id: `deadline-${job.id}`, title: job.title || 'Opportunity deadline', detail: job.companyName || job.company || '', date: job.deadline?.toDate ? job.deadline.toDate() : new Date(job.deadline), type: 'deadline', Icon: BriefcaseBusiness }));
    sessions.filter((item) => item.scheduledAt || item.sessionDate).forEach((item) => records.push({ id: `session-${item.id}`, title: item.topic || item.title || 'Mentorship session', detail: item.mentorName || '', date: item.scheduledAt?.toDate ? item.scheduledAt.toDate() : new Date(item.scheduledAt || item.sessionDate), type: 'mentorship', Icon: GraduationCap }));
    applications.filter((item) => item.interviewAt || item.interviewDate).forEach((item) => {
      const value = item.interviewAt || item.interviewDate;
      records.push({ id: `interview-${item.id}`, title: `Interview: ${item.jobTitle || item.jobName || 'Application'}`, detail: item.companyName || '', date: value?.toDate ? value.toDate() : new Date(value), type: 'interview', Icon: BriefcaseBusiness });
    });
    return records.filter((item) => item.date && !Number.isNaN(item.date.getTime())).sort((a, b) => a.date - b.date);
  }, [jobs, sessions, applications]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const upcomingEvents = events.filter((event) => event.date >= new Date(new Date().setHours(0, 0, 0, 0))).slice(0, 5);

  if (Array.isArray(events)) return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header><p className="text-sm font-medium text-brand-700">Your schedule</p><h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h1><p className="mt-1 text-sm text-slate-500">Live opportunity deadlines, interviews, and mentorship sessions.</p></header>
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-brand-600"/><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{currentMonth} {currentYear}</h2></div>
          <div className="grid grid-cols-7 gap-1 text-center">{daysOfWeek.map((day) => <div key={day} className="py-2 text-xs font-semibold text-slate-500">{day}</div>)}{Array.from({ length: Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7 }).map((_, index) => {
            const day = index - firstDayOfMonth + 1;
            const matching = day > 0 && day <= daysInMonth ? events.filter((event) => event.date.getFullYear() === currentYear && event.date.getMonth() === currentDate.getMonth() && event.date.getDate() === day) : [];
            const isToday = day === currentDate.getDate();
            return <div key={`${day || 'blank'}-${index}`} className={`min-h-16 rounded-lg border p-2 text-left ${isToday ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-slate-100 dark:border-slate-800'}`}>{day > 0 && day <= daysInMonth && <><span className={`text-sm ${isToday ? 'font-bold text-brand-700' : 'text-slate-700 dark:text-slate-200'}`}>{day}</span>{matching.length > 0 && <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-brand-600" aria-label={`${matching.length} events`} />}</>}</div>;
          })}</div>
          {events.length === 0 && <p className="mt-4 text-sm text-slate-500">Scheduled items will appear here when they are added to your opportunities or mentorship.</p>}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900"><h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Upcoming</h2>
          {upcomingEvents.length === 0 ? <p className="text-sm text-slate-500">No upcoming items found.</p> : <ul className="space-y-3">{upcomingEvents.map(({ id, title, detail, date, type, Icon }) => <li key={id} className="flex gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"/><div className="min-w-0"><p className="font-medium text-slate-800 dark:text-slate-100">{title}</p><p className="text-sm text-slate-500">{detail || type}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3 w-3"/>{date.toLocaleString()}</p></div></li>)}</ul>}
        </section>
      </div>
    </main>
  );

  const getEventBadge = (type) => {
    switch (type) {
      case 'interview':
        return <Badge bg="primary">Interview</Badge>;
      case 'academic':
        return <Badge bg="success">Academic</Badge>;
      case 'mentorship':
        return <Badge bg="info">Mentorship</Badge>;
      case 'deadline':
        return <Badge bg="danger">Deadline</Badge>;
      case 'workshop':
        return (
          <Badge bg="warning" text="dark">
            Workshop
          </Badge>
        );
      default:
        return <Badge bg="secondary">Event</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge bg="info">Scheduled</Badge>;
      case 'pending':
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );
      case 'confirmed':
        return <Badge bg="success">Confirmed</Badge>;
      case 'urgent':
        return <Badge bg="danger">Urgent</Badge>;
      case 'registered':
        return <Badge bg="primary">Registered</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Calendar & Events</h2>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  {currentMonth} {currentYear}
                </h4>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <i className="bi bi-chevron-left"></i>
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    Today
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              </div>

              <div className="calendar-grid mb-4">
                <Row className="text-center border-bottom mb-2 pb-2">
                  {daysOfWeek.map((day) => (
                    <Col key={day} className="fw-bold">
                      {day}
                    </Col>
                  ))}
                </Row>

                <Row className="text-center">
                  {Array.from({ length: Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7 }).map((_, index) => {
                    const day = index - firstDayOfMonth + 1;
                    const isToday = day === currentDate.getDate();
                    const hasEvent = day > 0 && day <= daysInMonth && events.some((event) => event.date.getFullYear() === currentYear && event.date.getMonth() === currentDate.getMonth() && event.date.getDate() === day);

                    return (
                      <Col key={index} className="p-2 border">
                        <div
                          className={`d-flex flex-column ${isToday ? 'bg-primary text-white rounded p-1' : ''}`}
                        >
                          <div className={hasEvent ? 'fw-bold' : ''}>
                            {day > 0 && day <= daysInMonth ? day : ''}
                          </div>
                          {hasEvent && (
                            <div className="mt-1">
                              <i
                                className="bi bi-circle-fill text-primary"
                                style={{ fontSize: '8px' }}
                              ></i>
                            </div>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>

              <div className="text-center">
                <p className="text-muted mb-0">Events from applications and mentorship sessions will appear here as they are scheduled.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>📅 Upcoming Events</Card.Title>
              <ListGroup variant="flush">
                {upcomingEvents
                  .map((event) => (
                    <ListGroup.Item key={event.id}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{event.title}</h6>
                          <small className="text-muted">
                            {new Date(event.date).toLocaleDateString()} • {event.time}
                          </small>
                        </div>
                        {getEventBadge(event.type)}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        {getStatusBadge(event.status)}
                        <Button variant="outline-primary" size="sm">
                          View
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📊 This Month Overview</Card.Title>
              <p className="text-muted mb-0">No scheduled events are available yet.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default Calendar;



