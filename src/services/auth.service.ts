import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserRole, UserDocument } from "../types/user.types";
import { COLLECTIONS } from "../constants/collections";

const provider = new GoogleAuthProvider();

export const authService = {
  // Register Email & Password
  registerWithEmail: async (email: string, password: string, role: UserRole = "customer", displayName: string = ""): Promise<UserDocument> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData: UserDocument = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        role,
        createdAt: serverTimestamp(),
        ...(role === "driver" && { points: 0, isVerified: false })
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
      
      // If driver, we might want to create a wallet doc immediately
      if (role === "driver") {
        await setDoc(doc(db, COLLECTIONS.WALLETS, user.uid), {
          userId: user.uid,
          balance: 0,
          updatedAt: serverTimestamp()
        });
      }
      
      return userData;
    } catch (err) {
      throw new Error(`Gagal mendaftar: ${err}`);
    }
  },

  // Login Email & Password
  loginWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      throw new Error(`Gagal login: ${err}`);
    }
  },

  // Google Sign-in
  loginWithGoogle: async (role: UserRole = "customer") => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const userData: UserDocument = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role,
          createdAt: serverTimestamp(),
          ...(role === "driver" && { points: 0, isVerified: false })
        };
        await setDoc(userDocRef, userData);
        
        if (role === "driver") {
          await setDoc(doc(db, COLLECTIONS.WALLETS, user.uid), {
            userId: user.uid,
            balance: 0,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      return user;
    } catch (err) {
      throw new Error(`Gagal login dengan Google: ${err}`);
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      throw new Error(`Gagal logout: ${err}`);
    }
  },
  
  // Get User Profile
  getUserProfile: async (uid: string): Promise<UserDocument | null> => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data() as UserDocument;
      }
      return null;
    } catch (err) {
      throw new Error(`Gagal mengambil profil: ${err}`);
    }
  },

  // Update User Profile
  updateUserProfile: async (uid: string, data: Partial<UserDocument>): Promise<void> => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, uid);
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      throw new Error(`Gagal memperbarui profil: ${err}`);
    }
  }
};
