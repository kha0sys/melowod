import { useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function FirebaseConnectionTest() {
  const [status, setStatus] = useState<string>('Checking connection...');

  useEffect(() => {
    // Test Firestore connection
    const testFirestore = async () => {
      try {
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setStatus(prev => prev + '\nFirestore connection successful!');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStatus(prev => prev + '\nFirestore error: ' + errorMessage);
      }
    };

    // Test Auth connection
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStatus(prev => prev + '\nAuth connection successful! User: ' + user.email);
      } else {
        setStatus(prev => prev + '\nAuth connection successful! No user signed in.');
      }
    });

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-secondary rounded-lg">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      <pre className="whitespace-pre-wrap">{status}</pre>
    </div>
  );
}
