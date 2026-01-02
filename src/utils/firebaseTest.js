import { auth, db } from '@/firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc, getDocs } from 'firebase/firestore'

export const testFirebaseConnection = async () => {
  try {
    console.log('=== TEST FIREBASE CONNECTION ===')
    
    // 1. Test Auth
    console.log('1. Testing Firebase Auth...')
    console.log('Auth instance:', auth)
    console.log('Current user:', auth.currentUser)
    
    // 2. Test Firestore
    console.log('2. Testing Firestore...')
    console.log('Firestore instance:', db)
    
    // 3. Essayez de créer un test document
    console.log('3. Creating test document...')
    try {
      const testRef = await addDoc(collection(db, 'test'), {
        test: 'Connection test',
        timestamp: new Date().toISOString()
      })
      console.log('✅ Test document created with ID:', testRef.id)
      
      // Nettoyer le test
      // (Vous pouvez le supprimer manuellement depuis Firebase Console)
    } catch (firestoreError) {
      console.error('❌ Firestore error:', firestoreError)
      console.log('Vérifiez vos règles Firestore!')
    }
    
    return true
  } catch (error) {
    console.error('❌ Firebase test failed:', error)
    return false
  }
}