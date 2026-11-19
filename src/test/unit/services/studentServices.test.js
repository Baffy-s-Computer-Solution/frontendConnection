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
  auth: { currentUser: { uid: 'student-123' } },
  db: {},
  uploadToCloudinary: vi.fn(),
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
}));

vi.mock('firebase/storage', () => ({
  deleteObject: vi.fn(),
  ref: vi.fn(),
}));

vi.mock('../../../config/firebase', () => ({
  auth: mocks.auth,
  db: mocks.db,
  storage: {},
}));

vi.mock('../../../services/cloudinaryService', () => ({
  cloudinaryService: { uploadToCloudinary: mocks.uploadToCloudinary },
}));

vi.mock('../../../services/apiClient', () => ({
  apiRequest: mocks.apiRequest,
}));

vi.mock('../../../services/storageService', () => ({
  storageService: {},
}));

import { uploadResume } from '../../../services/studentServices';

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
    mocks.apiRequest.mockResolvedValue({
      url: 'https://files.example/resume.pdf',
      publicId: 'students/student-123/resumes/resume',
      resourceType: 'raw',
    });

    const result = await uploadResume(
      { type: 'application/pdf', size: 12, name: 'resume.pdf' },
      'student-123'
    );

    expect(result.success).toBe(true);
    expect(mocks.apiRequest).toHaveBeenCalledWith(
      '/api/media/student/resume',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    );
    expect(mocks.addDoc).toHaveBeenCalledWith(
      documentsRef,
      expect.objectContaining({
        userId: 'student-123',
        studentId: 'student-123',
        storageType: 'cloudinary',
      })
    );
  });

  it('does not write resume metadata when the authenticated upload fails', async () => {
    mocks.apiRequest.mockRejectedValue(new Error('Resume uploads are temporarily unavailable.'));

    const result = await uploadResume(
      { type: 'application/pdf', size: 12, name: 'resume.pdf' },
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
