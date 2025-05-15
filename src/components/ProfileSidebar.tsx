
import React from 'react';
import { NavLink } from 'react-router-dom';
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

const ProfileSidebar = () => {
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
    <div className="space-y-1">
      <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">
        Личный кабинет
      </h2>
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )
            }
          >
            <link.icon className="h-4 w-4" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
