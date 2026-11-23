import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { now: vi.fn() },
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
  auth: { currentUser: { uid: 'student-123' } },
  db: {},
  uploadPrivateDocument: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  deleteDoc: mocks.deleteDoc,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  limit: mocks.limit,
  onSnapshot: mocks.onSnapshot,
  orderBy: mocks.orderBy,
  query: mocks.query,
  runTransaction: mocks.runTransaction,
  serverTimestamp: mocks.serverTimestamp,
  setDoc: mocks.setDoc,
  Timestamp: mocks.Timestamp,
  updateDoc: mocks.updateDoc,
  where: mocks.where,
  writeBatch: mocks.writeBatch,
}));

vi.mock('../../../config/firebase', () => ({
  auth: mocks.auth,
  db: mocks.db,
}));

vi.mock('../../../services/supabaseMediaService', () => ({
  supabaseMediaService: {},
}));

vi.mock('../../../services/supabaseService', () => ({
  supabaseService: { uploadPrivateDocument: mocks.uploadPrivateDocument },
}));

vi.mock('../../../services/apiClient', () => ({
  apiRequest: mocks.apiRequest,
}));

vi.mock('../../../services/storageService', () => ({
  storageService: {},
}));

import {
  deleteStudentCalendarEvent,
  saveStudentCalendarEvent,
  setCompanyFollow,
  subscribeToCompanyFollows,
  updateStudentDocumentMetadata,
  uploadResume,
} from '../../../services/studentServices';
import socialPlatformService from '../../../services/socialPlatformService';

describe('uploadResume', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('writes an owner field required by the documents Firestore rule', async () => {
    const documentsRef = { collection: 'documents' };
    mocks.collection.mockReturnValue(documentsRef);
    mocks.doc.mockReturnValue({ document: 'student' });
    mocks.serverTimestamp.mockReturnValue('server timestamp');
    mocks.addDoc.mockResolvedValue({ id: 'resume-document' });
    mocks.uploadPrivateDocument.mockResolvedValue({
      success: true,
      path: 'private_documents/student-123/123_resume.pdf',
    });

    const result = await uploadResume(
      new File(['resume'], 'resume.pdf', { type: 'application/pdf' }),
      'student-123'
    );

    expect(result.success).toBe(true);
    expect(mocks.uploadPrivateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.any(File),
        title: 'resume.pdf',
        category: 'resume',
        contentType: 'application/pdf',
      })
    );
    expect(mocks.addDoc).toHaveBeenCalledWith(
      documentsRef,
      expect.objectContaining({
        userId: 'student-123',
        studentId: 'student-123',
        storageType: 'supabase_private',
      })
    );
  });

  it('does not write resume metadata when the authenticated upload fails', async () => {
    mocks.uploadPrivateDocument.mockRejectedValue(new Error('Resume uploads are temporarily unavailable.'));

    const result = await uploadResume(
      new File(['resume'], 'resume.pdf', { type: 'application/pdf' }),
      'student-123'
    );

    expect(result).toEqual({
      success: false,
      error: 'Resume uploads are temporarily unavailable.',
    });
    expect(mocks.updateDoc).not.toHaveBeenCalled();
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });
});

describe('student-owned calendar and document updates', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('company follows for students and mentors', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('rejects friend requests when either account is a company', async () => {
      await expect(socialPlatformService.sendFriendRequest(
        { id: 'company-456', role: 'company' },
        { userType: 'student' }
      )).rejects.toThrow('Company profiles are followed, not added as friends.');
      await expect(socialPlatformService.sendFriendRequest(
        { id: 'student-456', role: 'student' },
        { userType: 'company' }
      )).rejects.toThrow('Company profiles are followed, not added as friends.');

      expect(mocks.writeBatch).not.toHaveBeenCalled();
      expect(mocks.getDocs).not.toHaveBeenCalled();
    });

    it('stores a mentor follow as a user-owned company follower and chat edge', async () => {
      const followerRef = { collection: 'companyFollowers' };
      const chatEdgeRef = { collection: 'company_chat_followers' };
      const batch = { set: vi.fn(), delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
      mocks.doc.mockReturnValueOnce(followerRef).mockReturnValueOnce(chatEdgeRef);
      mocks.writeBatch.mockReturnValue(batch);
      mocks.serverTimestamp.mockReturnValue('server timestamp');

      const result = await setCompanyFollow('mentor-123', 'company-456', true, 'mentor');

      expect(result.success).toBe(true);
      expect(batch.set.mock.calls[0][1]).toEqual(expect.objectContaining({
        companyId: 'company-456',
        userId: 'mentor-123',
        status: 'active',
      }));
      expect(batch.set.mock.calls[0][1]).not.toHaveProperty('studentId');
      expect(batch.set.mock.calls[1][1]).toEqual(expect.objectContaining({
        companyId: 'company-456',
        followerId: 'mentor-123',
        status: 'active',
      }));
      expect(batch.commit).toHaveBeenCalledOnce();
    });

    it('rejects company accounts trying to follow another company', async () => {
      const result = await setCompanyFollow('company-123', 'company-456', true, 'company');

      expect(result).toEqual({
        success: false,
        error: 'Only student and mentor accounts can follow companies.',
      });
      expect(mocks.writeBatch).not.toHaveBeenCalled();
    });

    it('subscribes to both legacy student and mentor follow records', () => {
      const studentRecords = { docs: [{ data: () => ({ companyId: 'company-1', status: 'active' }) }] };
      const mentorRecords = { docs: [{ data: () => ({ companyId: 'company-2', status: 'active' }) }] };
      mocks.onSnapshot
        .mockImplementationOnce((query, onData) => { onData(studentRecords); return vi.fn(); })
        .mockImplementationOnce((query, onData) => { onData(mentorRecords); return vi.fn(); });
      const onData = vi.fn();

      subscribeToCompanyFollows('mentor-123', onData);

      expect(mocks.onSnapshot).toHaveBeenCalledTimes(2);
      expect(onData).toHaveBeenLastCalledWith(new Set(['company-1', 'company-2']));
    });
  });

  it('creates a calendar event only for the authenticated student', async () => {
    const eventsRef = { collection: 'calendarEvents' };
    mocks.collection.mockReturnValue(eventsRef);
    mocks.serverTimestamp.mockReturnValue('server timestamp');
    mocks.addDoc.mockResolvedValue({ id: 'event-1' });

    const result = await saveStudentCalendarEvent('student-123', {
      title: 'Interview preparation',
      startAt: new Date('2025-03-10T09:00:00.000Z'),
      description: 'Review the role requirements',
    });

    expect(result.success).toBe(true);
    expect(mocks.collection).toHaveBeenCalledWith(mocks.db, 'students', 'student-123', 'calendarEvents');
    expect(mocks.addDoc).toHaveBeenCalledWith(eventsRef, expect.objectContaining({
      title: 'Interview preparation',
      startAt: new Date('2025-03-10T09:00:00.000Z'),
      description: 'Review the role requirements',
    }));
  });

  it('rejects calendar writes from another authenticated user', async () => {
    const result = await saveStudentCalendarEvent('another-student', {
      title: 'Not allowed',
      startAt: new Date('2025-03-10T09:00:00.000Z'),
    });

    expect(result.success).toBe(false);
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it('updates and deletes the authenticated student calendar record', async () => {
    const eventRef = { event: 'interview-preparation' };
    const eventsRef = { collection: 'calendarEvents' };
    mocks.collection.mockReturnValue(eventsRef);
    mocks.doc.mockReturnValue(eventRef);
    mocks.serverTimestamp.mockReturnValue('server timestamp');

    const updateResult = await saveStudentCalendarEvent('student-123', {
      title: 'Updated interview prep',
      startAt: new Date('2025-03-10T09:00:00.000Z'),
    }, 'event-1');
    const deleteResult = await deleteStudentCalendarEvent('student-123', 'event-1');

    expect(updateResult.success).toBe(true);
    expect(mocks.updateDoc).toHaveBeenCalledWith(eventRef, expect.objectContaining({ title: 'Updated interview prep' }));
    expect(deleteResult.success).toBe(true);
    expect(mocks.deleteDoc).toHaveBeenCalledWith(eventRef);
  });

  it('updates metadata only when the document belongs to the student', async () => {
    mocks.doc.mockReturnValue({ document: 'resume' });
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ studentId: 'student-123', fileName: 'resume.pdf' }),
    });
    mocks.serverTimestamp.mockReturnValue('server timestamp');

    const result = await updateStudentDocumentMetadata('resume-1', 'student-123', {
      fileName: 'Updated resume.pdf',
      documentType: 'resume',
    });

    expect(result.success).toBe(true);
    expect(mocks.updateDoc).toHaveBeenCalledWith({ document: 'resume' }, expect.objectContaining({
      fileName: 'Updated resume.pdf',
      documentType: 'resume',
    }));
  });
});
