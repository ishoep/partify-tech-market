
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { CityProvider } from "@/context/CityContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import ShopPage from "./pages/ShopPage";
import UserProfile from "./pages/UserProfile";
import Warehouse from "./pages/Warehouse";
import Workshop from "./pages/Workshop";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import Chats from "./pages/Chats";
import ChatDetail from "./pages/ChatDetail";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import Payments from "./pages/Payments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/shop/:shopId" element={<ShopPage />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/shop" element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } />
              <Route path="/warehouse" element={
                <ProtectedRoute>
                  <Warehouse />
                </ProtectedRoute>
              } />
              <Route path="/workshop" element={
                <ProtectedRoute>
                  <Workshop />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/chats" element={
                <ProtectedRoute>
                  <Chats />
                </ProtectedRoute>
              } />
              <Route path="/chats/:chatId" element={
                <ProtectedRoute>
                  <ChatDetail />
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
