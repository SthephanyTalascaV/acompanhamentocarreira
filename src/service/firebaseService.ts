import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Auth
  login: async () => {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Login Error:', e);
    }
  },

  logout: async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('Logout Error:', e);
    }
  },

  // Advisors
  getAdvisors: async () => {
    const path = 'advisors';
    try {
      const email = auth.currentUser?.email;
      if (!email) return [];
      
      const isAdmin = email === 'jonathan.dornelas@nibo.com.br';
      let q;
      
      if (isAdmin) {
        // Admin sees everything (including orphans)
        const snap = await getDocs(collection(db, path));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        // Coordinators see only their own
        q = query(
          collection(db, path),
          where('ownerEmail', '==', email)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  getAdvisor: async (id: string) => {
    const path = `advisors/${id}`;
    try {
      const snap = await getDoc(doc(db, 'advisors', id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  },

  createAdvisor: async (data: any) => {
    const path = 'advisors';
    try {
      const email = auth.currentUser?.email;
      const docRef = await addDoc(collection(db, path), {
        ...data,
        ownerEmail: email
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  updateAdvisor: async (id: string, data: any) => {
    const path = `advisors/${id}`;
    try {
      await updateDoc(doc(db, 'advisors', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  deleteAdvisor: async (id: string) => {
    const path = `advisors/${id}`;
    try {
      await deleteDoc(doc(db, 'advisors', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Scorecards
  saveScorecard: async (data: any) => {
    const path = 'scorecards';
    try {
      const email = auth.currentUser?.email;
      const docRef = await addDoc(collection(db, path), {
        ...data,
        ownerEmail: email,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  getLatestScorecard: async (advisorId: string) => {
    const path = 'scorecards';
    try {
      const q = query(
        collection(db, path),
        where('advisorId', '==', advisorId),
        orderBy('year', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  },

  // Performance
  getPerformance: async (advisorId: string) => {
    const path = 'performance';
    try {
      const q = query(
        collection(db, path),
        where('advisorId', '==', advisorId),
        orderBy('month', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  // Checklist
  getChecklist: async (advisorId: string) => {
    const path = 'checklists';
    try {
      const q = query(
        collection(db, path),
        where('advisorId', '==', advisorId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  createChecklistItem: async (data: any) => {
    const path = 'checklists';
    try {
      const email = auth.currentUser?.email;
      const docRef = await addDoc(collection(db, path), {
        ...data,
        ownerEmail: email
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  toggleChecklistItem: async (itemId: string, isCompleted: boolean) => {
    const path = `checklists/${itemId}`;
    try {
      await updateDoc(doc(db, 'checklists', itemId), { isCompleted });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  // Meetings
  getMeetings: async (advisorId: string) => {
    const path = 'meetings';
    try {
      const q = query(
        collection(db, path),
        where('advisorId', '==', advisorId),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  // Milestones
  getMilestones: async (advisorId: string) => {
    const path = 'milestones';
    try {
      const q = query(
        collection(db, path),
        where('advisorId', '==', advisorId),
        orderBy('order', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  // Real-time listener for current advisor
  subscribeToPerformance: (advisorId: string, callback: (data: any[]) => void) => {
    const q = query(
      collection(db, 'performance'),
      where('advisorId', '==', advisorId),
      orderBy('month', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'performance'));
  }
};
