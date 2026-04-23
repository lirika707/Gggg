import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Регистрация нового пользователя
 */
export async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Registration Error:", error.code, error.message);
    throw error;
  }
}

/**
 * Вход в систему
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error.code, error.message);
    throw error;
  }
}

/**
 * Выход из системы
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error.message);
    throw error;
  }
}

/**
 * Получить текущего пользователя (через Promise для удобства)
 */
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}
