
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
      label: "Профиль",
      path: "/profile",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      label: hasShop ? "Управление магазином" : "Создать магазин",
      path: "/shop",
      icon: <ShoppingBag className="h-4 w-4 mr-2" />,
    },
    {
      label: "Склад",
      path: "/warehouse",
      icon: <Package className="h-4 w-4 mr-2" />,
    },
    {
      label: "Мастерская",
      path: "/workshop",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="border rounded p-4">
      <div className="space-y-2">
        {links.map((link) => (
          <Button
            key={link.path}
            variant={location.pathname === link.path ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              location.pathname === link.path
                ? ""
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
      <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center justify-start text-destructive"
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  Выйти
                </Button>
    </div>
  );
};

export default ProfileSidebar;
