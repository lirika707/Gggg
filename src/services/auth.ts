import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInAnonymously,
    signOut,
    updateProfile
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { normalizeLogin, validateLogin, validatePassword } from '../helpers/validation';

export const getAuthErrorMessage = (error: any): string => {
  let code = error?.code || error?.message;
  if (typeof code === 'string' && code.includes('auth/')) {
    const match = code.match(/auth\/[a-z-]+/);
    if (match) code = match[0];
  }
  
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Этот способ входа временно недоступен.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Неверный логин или пароль.';
    case 'auth/email-already-in-use':
      return 'Этот логин уже занят. Пожалуйста, выберите другой.';
    case 'auth/weak-password':
      return 'Пароль слишком слабый. Используйте минимум 6 символов.';
    case 'auth/invalid-email':
      return 'Некорректный формат логина.';
    case 'auth/network-request-failed':
      return 'Ошибка сети. Проверьте подключение к интернету.';
    case 'auth/popup-closed-by-user':
      return 'Окно входа было закрыто.';
    default:
      return 'Произошла ошибка при входе. Попробуйте позже.';
  }
};

export const getTechEmail = (login: string) => {
  if (login.includes('@')) {
    return login.trim().toLowerCase();
  }
  const normalized = normalizeLogin(login);
  return `${normalized}@auth.local`;
};

export const loginWithUsername = async (login: string, pass: string) => {
  let email = login;
  const normalized = !login.includes('@') ? normalizeLogin(login) : '';

  if (!login.includes('@')) {
    if (normalized === 'admin') {
      email = 'admin@admin.app';
    } else {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('normalizedLogin', '==', normalized));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('auth/user-not-found');
      }

      // Get the first matching user's authEmail
      const userData = querySnapshot.docs[0].data();
      email = userData.authEmail || `${normalized}@auth.local`;
    }
  }

  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    // Handle case where admin was deleted from Auth but user tries to log in
    if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && normalized === 'admin') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        
        // Ensure Firestore doc exists
        const adminDocRef = doc(db, 'users', userCredential.user.uid);
        const adminDoc = await getDoc(adminDocRef);
        
        if (!adminDoc.exists()) {
          await updateProfile(userCredential.user, { displayName: 'Admin' });
          await setDoc(adminDocRef, {
            uid: userCredential.user.uid,
            login: 'admin',
            normalizedLogin: 'admin',
            authEmail: email,
            fullName: 'Admin',
            phone: '',
            avatar: 'https://picsum.photos/seed/admin/150/150',
            role: 'admin',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            listingsCount: 0,
            soldCount: 0,
            rating: 5,
            verified: true,
            quickRegistration: false,
            registrationLevel: 'full',
            provider: 'email',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        return userCredential;
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          throw new Error('auth/wrong-password');
        }
        throw createError;
      }
    }
    throw error;
  }
};

export const registerWithUsername = async (
  login: string, 
  pass: string, 
  firstName: string, 
  lastName: string, 
  phone: string, 
  location?: string, 
  bio?: string
) => {
  const loginError = validateLogin(login);
  if (loginError && !login.includes('@')) throw new Error(loginError);
  
  const passError = validatePassword(pass);
  if (passError) throw new Error(passError);

  const email = getTechEmail(login);
  const normalizedLogin = login.includes('@') ? login.split('@')[0] : normalizeLogin(login);
  
  // Check if normalizedLogin is already taken
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('normalizedLogin', '==', normalizedLogin));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error('auth/email-already-in-use');
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const fullName = `${firstName} ${lastName}`.trim() || normalizedLogin;
  
  await updateProfile(userCredential.user, { displayName: fullName });

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    login: login.includes('@') ? normalizedLogin : login,
    normalizedLogin: normalizedLogin,
    authEmail: email,
    firstName,
    lastName,
    fullName,
    phone,
    location: location || '',
    bio: bio || '',
    avatar: 'https://picsum.photos/seed/user/150/150',
    role: email === 'nterra558@gmail.com' ? 'admin' : 'user',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    listingsCount: 0,
    soldCount: 0,
    rating: 0,
    verified: false,
    quickRegistration: false,
    registrationLevel: 'full',
    provider: 'email',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { userCredential, fullName };
};

export const quickRegisterWithUsername = async (login: string) => {
  const loginError = validateLogin(login);
  if (loginError && !login.includes('@')) throw new Error(loginError);
  
  const pass = Math.random().toString(36).slice(-10) + 'A1!';

  const email = getTechEmail(login);
  const normalizedLogin = login.includes('@') ? login.split('@')[0] : normalizeLogin(login);

  // Check if normalizedLogin is already taken
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('normalizedLogin', '==', normalizedLogin));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error('auth/email-already-in-use');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const fullName = normalizedLogin;
  
  await updateProfile(userCredential.user, { displayName: fullName });

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    login: login.includes('@') ? normalizedLogin : login,
    normalizedLogin: normalizedLogin,
    authEmail: email,
    fullName,
    phone: '',
    avatar: 'https://picsum.photos/seed/user/150/150',
    role: 'user',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    listingsCount: 0,
    soldCount: 0,
    rating: 0,
    verified: false,
    quickRegistration: true,
    registrationLevel: 'quick',
    provider: 'email',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { userCredential, fullName, password: pass };
};

export const signInWithGoogleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result?.user) {
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          login: result.user.email?.split('@')[0] || 'user',
          normalizedLogin: normalizeLogin(result.user.email?.split('@')[0] || 'user'),
          authEmail: result.user.email,
          fullName: result.user.displayName || 'Пользователь',
          avatar: result.user.photoURL || 'https://picsum.photos/seed/user/150/150',
          role: 'user',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          listingsCount: 0,
          soldCount: 0,
          rating: 0,
          verified: false,
          quickRegistration: false,
          registrationLevel: 'social',
          provider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(userRef, {
          updatedAt: serverTimestamp(),
          provider: 'google'
        }, { merge: true });
      }
    }
    return result;
  } catch (error: any) {
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('auth/operation-not-allowed');
    }
    throw error;
  }
};

export const signInAnonymouslyAuth = async () => {
  const result = await signInAnonymously(auth);
  if (result?.user) {
    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        login: 'guest-' + result.user.uid.slice(0, 5),
        normalizedLogin: 'guest-' + result.user.uid.slice(0, 5),
        authEmail: null,
        fullName: 'Гость',
        avatar: 'https://picsum.photos/seed/guest/150/150',
        role: 'user',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        listingsCount: 0,
        soldCount: 0,
        rating: 0,
        verified: false,
        quickRegistration: true,
        registrationLevel: 'guest',
        provider: 'anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }
  return result;
};

export const logOutAuth = () => signOut(auth);

export const handleSocialLoginDemo = async (providerName: string) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Авторизация через ${providerName} скоро будет доступна.`));
    }, 500);
  });
};
