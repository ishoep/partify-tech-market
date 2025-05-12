
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBvysiR8_upx3QwgOkDIxF79OxknEi10f8",
  authDomain: "search-4e940.firebaseapp.com",
  projectId: "search-4e940",
  storageBucket: "search-4e940.firebasestorage.app",
  messagingSenderId: "760384502605",
  appId: "1:760384502605:web:194bad6f1dc49e1c985504",
  measurementId: "G-64H897ZFBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Authentication functions
export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Firestore functions
export const createUserProfile = async (userId: string, userData: any) => {
  return setDoc(doc(db, "users", userId), {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, {
    ...userData,
    updatedAt: new Date(),
  });
};

// Shop functions
export const createShop = async (userId: string, shopData: any) => {
  const shopRef = doc(db, "shops", userId);
  return setDoc(shopRef, {
    ...shopData,
    ownerId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getShopByUserId = async (userId: string) => {
  const shopRef = doc(db, "shops", userId);
  const shopSnap = await getDoc(shopRef);
  
  if (shopSnap.exists()) {
    return { id: shopSnap.id, ...shopSnap.data() };
  } else {
    return null;
  }
};

export const updateShop = async (shopId: string, shopData: any) => {
  const shopRef = doc(db, "shops", shopId);
  return updateDoc(shopRef, {
    ...shopData,
    updatedAt: new Date(),
  });
};

// Product functions
export const createProduct = async (productData: any) => {
  // Generate an article number starting from 10000
  const productsRef = collection(db, "products");
  const q = query(productsRef);
  const querySnapshot = await getDocs(q);
  
  const articleNumber = 10000 + querySnapshot.size;
  
  return addDoc(productsRef, {
    ...productData,
    articleNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getProducts = async (filters: any = {}) => {
  const productsRef = collection(db, "products");
  
  let q = query(productsRef);
  
  if (filters.category) {
    q = query(productsRef, where("category", "==", filters.category));
  }
  
  if (filters.shopId) {
    q = query(productsRef, where("shopId", "==", filters.shopId));
  }
  
  if (filters.status) {
    q = query(productsRef, where("status", "==", filters.status));
  }
  
  const querySnapshot = await getDocs(q);
  const products: any[] = [];
  
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  
  return products;
};

export const searchProducts = async (searchTerm: string, filters: any = {}) => {
  // Due to Firebase limitations with text search, we'll fetch all products
  // and filter them client-side
  const products = await getProducts(filters);
  
  if (!searchTerm) return products;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(lowerSearchTerm) ||
      product.model?.toLowerCase().includes(lowerSearchTerm) ||
      product.category?.toLowerCase().includes(lowerSearchTerm) ||
      product.shopName?.toLowerCase().includes(lowerSearchTerm)
    );
  });
};

export const getProductById = async (productId: string) => {
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateProduct = async (productId: string, productData: any) => {
  const productRef = doc(db, "products", productId);
  return updateDoc(productRef, {
    ...productData,
    updatedAt: new Date(),
  });
};

export const deleteProduct = async (productId: string) => {
  return deleteDoc(doc(db, "products", productId));
};

// Warehouse functions
export const getWarehouseProducts = async (userId: string) => {
  const productsRef = collection(db, "products");
  const q = query(
    productsRef, 
    where("userId", "==", userId),
    where("status", "==", "На складе")
  );
  
  const querySnapshot = await getDocs(q);
  const products: any[] = [];
  
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  
  return products;
};

// Workshop functions
export const createTask = async (userId: string, taskData: any) => {
  const tasksRef = collection(db, "tasks");
  return addDoc(tasksRef, {
    ...taskData,
    userId,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getTasks = async (userId: string) => {
  const tasksRef = collection(db, "tasks");
  const q = query(tasksRef, where("userId", "==", userId));
  
  const querySnapshot = await getDocs(q);
  const tasks: any[] = [];
  
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  
  return tasks;
};

export const updateTaskStatus = async (taskId: string, completed: boolean) => {
  const taskRef = doc(db, "tasks", taskId);
  return updateDoc(taskRef, {
    completed,
    updatedAt: new Date(),
  });
};

// Favorite functions
export const addToFavorites = async (userId: string, productId: string) => {
  const favoritesRef = collection(db, "favorites");
  return addDoc(favoritesRef, {
    userId,
    productId,
    createdAt: new Date(),
  });
};

export const getFavorites = async (userId: string) => {
  const favoritesRef = collection(db, "favorites");
  const q = query(favoritesRef, where("userId", "==", userId));
  
  const querySnapshot = await getDocs(q);
  const favoriteIds: string[] = [];
  
  querySnapshot.forEach((doc) => {
    favoriteIds.push(doc.data().productId);
  });
  
  // Get full product details for each favorite
  const favoriteProducts: any[] = [];
  
  for (const productId of favoriteIds) {
    const product = await getProductById(productId);
    if (product) {
      favoriteProducts.push(product);
    }
  }
  
  return favoriteProducts;
};

export const removeFromFavorites = async (userId: string, productId: string) => {
  const favoritesRef = collection(db, "favorites");
  const q = query(
    favoritesRef,
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  
  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach(async (document) => {
    await deleteDoc(doc(db, "favorites", document.id));
  });
};

// Chat functions
export const createChat = async (buyerId: string, sellerId: string, productId: string) => {
  // Check if chat already exists
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("buyerId", "==", buyerId),
    where("sellerId", "==", sellerId),
    where("productId", "==", productId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Chat already exists, return its ID
    return querySnapshot.docs[0].id;
  }
  
  // Create a new chat
  const chatRef = await addDoc(chatsRef, {
    buyerId,
    sellerId,
    productId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return chatRef.id;
};

export const getUserChats = async (userId: string) => {
  const chatsRef = collection(db, "chats");
  const buyerQuery = query(chatsRef, where("buyerId", "==", userId));
  const sellerQuery = query(chatsRef, where("sellerId", "==", userId));
  
  const buyerChats = await getDocs(buyerQuery);
  const sellerChats = await getDocs(sellerQuery);
  
  const chats: any[] = [];
  
  buyerChats.forEach((doc) => {
    chats.push({ id: doc.id, ...doc.data(), isOwner: false });
  });
  
  sellerChats.forEach((doc) => {
    chats.push({ id: doc.id, ...doc.data(), isOwner: true });
  });
  
  return chats;
};

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  
  // Update chat's updatedAt timestamp
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    updatedAt: new Date(),
  });
  
  return addDoc(messagesRef, {
    senderId,
    content,
    timestamp: new Date(),
  });
};

export const getMessages = async (chatId: string) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef);
  
  const querySnapshot = await getDocs(q);
  const messages: any[] = [];
  
  querySnapshot.forEach((doc) => {
    messages.push({ id: doc.id, ...doc.data() });
  });
  
  return messages.sort((a, b) => a.timestamp - b.timestamp);
};

export { app, auth, db, analytics };
