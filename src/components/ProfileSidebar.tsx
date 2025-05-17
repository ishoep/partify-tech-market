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

interface ProfileSidebarProps {
  onLinkClick?: () => void;
  excludeLinks?: string[];
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ onLinkClick, excludeLinks = [] }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const links = [
    { name: 'Профиль', path: '/profile', icon: User },
    { name: 'Магазин', path: '/shop', icon: Store },
    { name: 'Склад', path: '/warehouse', icon: Warehouse },
    { name: 'Мастерская', path: '/workshop', icon: Wrench },
    { name: 'Платежи', path: '/payments', icon: Wallet },
  ].filter(link => !excludeLinks.includes(link.path));

  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick();
  };

  return (
    <div className="space-y-2 p-4">
      {!isMobile && (
        <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">
          Личный кабинет
        </h2>
      )}
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;