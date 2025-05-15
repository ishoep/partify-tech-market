
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  User, 
  Store, 
  Warehouse, 
  Wrench, 
  Heart, 
  MessageSquare,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ProfileSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const links = [
    { name: 'Профиль', path: '/profile', icon: User },
    { name: 'Магазин', path: '/shop', icon: Store },
    { name: 'Склад', path: '/warehouse', icon: Warehouse },
    { name: 'Мастерская', path: '/workshop', icon: Wrench },
    { name: 'Платежи', path: '/payments', icon: Wallet },
    { name: 'Избранное', path: '/favorites', icon: Heart },
    { name: 'Сообщения', path: '/chats', icon: MessageSquare },
  ];

  return (
    <div className="space-y-2">
      <h2 className={cn(
        "mb-4 px-2 font-semibold tracking-tight",
        isMobile ? "text-xl text-center" : "text-lg"
      )}>
        Личный кабинет
      </h2>
      <nav className={cn(
        "space-y-1",
        isMobile && "grid grid-cols-2 gap-2"
      )}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
                isMobile && "justify-center"
              )
            }
          >
            <link.icon className={cn("h-5 w-5", isMobile && "mr-0")} />
            <span className={cn(isMobile && "hidden")}>
              {link.name}
            </span>
            {isMobile && location.pathname === link.path && (
              <span className="sr-only">{link.name}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
