// Importation des services Firebase nécessaires
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuIBnTw4rD0ApMxNL3x3KKSXweRTQrWHg",
  authDomain: "project-management-kanba-5b42d.firebaseapp.com",
  projectId: "project-management-kanba-5b42d",
  storageBucket: "project-management-kanba-5b42d.firebasestorage.app",
  messagingSenderId: "71661777438",
  appId: "1:71661777438:web:66cd2299cb5ed9b87b740f",
  measurementId: "G-FPLLR9BW2L"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Initialiser les services principaux
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Exporter
export { auth, db, googleProvider }
export default app