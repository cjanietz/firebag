import { credential, firestore, initializeApp } from 'firebase-admin';
import { FirestoreConnection } from '../base/FirestoreConnection';

export function createFirestoreConnection() {
    const firebaseApp = initializeApp({
        credential: credential.cert(require(process.env.GOOGLE_ADMIN_CREDENTIALS)),
        databaseURL: process.env.DATABASE_URL
    });
    const firestoreInstance = firestore(firebaseApp);
    const firestoreConnection = FirestoreConnection.fromFirestore(firestoreInstance);
    return { firestoreInstance, firestoreConnection };
}
