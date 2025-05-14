
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getShopByUserId } from '@/lib/firebase';
import { 
  User, 
  ShoppingBag, 
  Package, 
  Settings,
  Home,
  MessageCircle,
  Heart,
  Store,
  Clock,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProfileSidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [hasShop, setHasShop] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const checkShop = async () => {
      if (currentUser) {
        try {
          const shop = await getShopByUserId(currentUser.uid);
          setHasShop(!!shop);
        } catch (error) {
          console.error("Error checking shop:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkShop();
  }, [currentUser]);

  const links = [
    {
      label: "Главная",
      path: "/",
      icon: <Home className="h-5 w-5 mr-3" />,
    },
    {
      label: "Профиль",
      path: "/profile",
      icon: <User className="h-5 w-5 mr-3" />,
    },
    {
      label: "Чаты",
      path: "/chats",
      icon: <MessageCircle className="h-5 w-5 mr-3" />,
    },
    {
      label: "Избранное",
      path: "/favorites",
      icon: <Heart className="h-5 w-5 mr-3" />,
    },
    {
      label: hasShop ? "Управление магазином" : "Создать магазин",
      path: "/shop",
      icon: <Store className="h-5 w-5 mr-3" />,
    },
    {
      label: "Склад",
      path: "/warehouse",
      icon: <Package className="h-5 w-5 mr-3" />,
    },
    {
      label: "Мастерская",
      path: "/workshop",
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
    {
      label: "История",
      path: "/history",
      icon: <Clock className="h-5 w-5 mr-3" />,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        {currentUser && (
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {currentUser.displayName ? (
                currentUser.displayName.charAt(0).toUpperCase()
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <div className="font-medium">{currentUser.displayName || 'Пользователь'}</div>
              <div className="text-xs text-muted-foreground">{currentUser.email}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <Button
            key={link.path}
            variant={location.pathname === link.path ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-base font-normal h-10",
              location.pathname === link.path
                ? "bg-primary/10"
                : "text-muted-foreground"
            )}
            asChild
          >
            <Link to={link.path}>
              {link.icon}
              {link.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="p-4 mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Выйти
        </Button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
