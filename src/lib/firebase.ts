import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, DocumentData, QuerySnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Define interfaces for better typing
interface ShopAddress {
  city: string;
  address: string;
}

interface Shop {
  id: string;
  name?: string;
  ownerId?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  website?: string;
  description?: string;
  addresses?: ShopAddress[];
  city?: string;
  address?: string;
  hasDelivery?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // Allow additional properties
}

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
    return { id: shopSnap.id, ...shopSnap.data() } as Shop;
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

  // Get the shop data to include city, addresses and hasDelivery
  let shopData: Shop | null = null;
  if (productData.shopId) {
    shopData = await getShopByUserId(productData.shopId);
  }
  
  // Use the primary address city if available
  const primaryCity = shopData?.addresses && shopData.addresses.length > 0
    ? shopData.addresses[0].city
    : shopData?.city || null;
    
  return addDoc(productsRef, {
    ...productData,
    articleNumber,
    city: primaryCity,
    shop: {
      id: shopData?.id,
      name: shopData?.name,
      addresses: shopData?.addresses || [],
      hasDelivery: shopData?.hasDelivery || false,
    },
    hasDelivery: shopData?.hasDelivery || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

// Define Product interface to fix type errors
interface Product {
  id: string;
  name?: string;
  model?: string;
  category?: string;
  shopName?: string;
  price?: number; 
  discountPercent?: number;
  discountedPrice?: number;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any; // Allow additional properties
}

export const getProducts = async (filters: any = {}) => {
  try {
    const productsRef = collection(db, "products");
    
    let q = query(productsRef);
    
    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }
    
    if (filters.shopId) {
      q = query(q, where("shopId", "==", filters.shopId));
    }
    
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }
    
    if (filters.minDiscount) {
      q = query(q, where("discountPercent", ">=", filters.minDiscount));
    }
    
    if (filters.orderBy) {
      q = query(q, orderBy(filters.orderBy, filters.orderDirection || "desc"));
    }
    
    const querySnapshot = await getDocs(q);
    let products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    // Apply client-side filters for properties we can't directly query in Firestore
    if (filters.city) {
      products = products.filter(product => product.city === filters.city);
    }
    
    if (filters.sellerName) {
      products = products.filter(product => product.shop?.name === filters.sellerName);
    }
    
    return products;
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
};

// New function to get unique sellers
export const getUniqueSellers = async (): Promise<string[]> => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);
    
    // Create a Set to automatically filter duplicate seller names
    const sellerNameSet = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.shop?.name) {
        sellerNameSet.add(data.shop.name);
      }
    });
    
    return Array.from(sellerNameSet);
  } catch (error) {
    console.error("Error fetching unique sellers:", error);
    return [];
  }
};

export const getRecommendedProducts = async (limitCount = 10) => {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("discountPercent", ">=", 30),
      orderBy("discountPercent", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error("Error in getRecommendedProducts:", error);
    return [];
  }
};

export const searchProducts = async (searchTerm: string, filters: any = {}) => {
  try {
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
        product.shopName?.toLowerCase().includes(lowerSearchTerm) ||
        product.shop?.name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
};

export const updateProduct = async (productId: string, productData: any) => {
  const productRef = doc(db, "products", productId);
  
  // If shopId is included, update the shop information
  if (productData.shopId) {
    const shopData = await getShopByUserId(productData.shopId);
    
    if (shopData) {
      // Use the primary address city if available
      const primaryCity = shopData.addresses && shopData.addresses.length > 0
        ? shopData.addresses[0].city
        : shopData.city || null;
        
      productData.city = primaryCity;
      productData.shop = {
        id: shopData.id,
        name: shopData.name,
        addresses: shopData.addresses || [],
        hasDelivery: shopData.hasDelivery || false,
      };
      productData.hasDelivery = shopData.hasDelivery || false;
    }
  }
  
  // If price or discount changed, recalculate the discounted price
  if ((productData.price !== undefined || productData.discountPercent !== undefined)) {
    const currentProduct = await getProductById(productId);
    if (currentProduct) {
      const price = productData.price !== undefined ? productData.price : currentProduct.price || 0;
      const discount = productData.discountPercent !== undefined ? productData.discountPercent : currentProduct.discountPercent || 0;
      
      if (discount > 0) {
        productData.discountedPrice = Math.round(price * (1 - discount / 100));
      } else {
        productData.discountedPrice = price;
      }
    }
  }
  
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

// Check if a product is already in favorites
export const isProductInFavorites = async (userId: string, productId: string) => {
  try {
    const favoritesRef = collection(db, "favorites");
    const q = query(
      favoritesRef,
      where("userId", "==", userId),
      where("productId", "==", productId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking favorites:", error);
    return false;
  }
};

// Add to favorites only if not already added
export const addToFavorites = async (userId: string, productId: string) => {
  try {
    // Check if already in favorites
    const alreadyInFavorites = await isProductInFavorites(userId, productId);
    
    if (alreadyInFavorites) {
      console.log("Product already in favorites");
      return { success: false, message: "Товар уже в избранном" };
    }
    
    // Add to favorites
    const favoritesRef = collection(db, "favorites");
    await addDoc(favoritesRef, {
      userId,
      productId,
      createdAt: new Date(),
    });
    
    return { success: true, message: "Товар добавлен в избранное" };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const getFavorites = async (userId: string) => {
  try {
    const favoritesRef = collection(db, "favorites");
    const q = query(favoritesRef, where("userId", "==", userId));
    
    const querySnapshot = await getDocs(q);
    const favoriteIds: string[] = [];
    
    querySnapshot.forEach((doc) => {
      favoriteIds.push(doc.data().productId);
    });
    
    // Get full product details for each favorite
    const favoriteProducts: Product[] = [];
    
    for (const productId of favoriteIds) {
      const product = await getProductById(productId);
      if (product) {
        favoriteProducts.push(product);
      }
    }
    
    return favoriteProducts;
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

export const removeFromFavorites = async (userId: string, productId: string) => {
  try {
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
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Chat functions
export const createChat = async (buyerId: string, sellerId: string, productId: string) => {
  try {
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
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const getUserChats = async (userId: string) => {
  try {
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
  } catch (error) {
    console.error("Error getting user chats:", error);
    return [];
  }
};

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  try {
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
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getMessages = async (chatId: string) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef);
    
    const querySnapshot = await getDocs(q);
    const messages: any[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    return messages.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return a.timestamp.seconds - b.timestamp.seconds;
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
};

export { app, auth, db, analytics };
