
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Heart } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full border-b p-3">
      <div className="container flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center text-xl font-bold text-primary">
          Telepart
        </Link>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')}>
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate('/chats')}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>Профиль</span>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Войти
              </Button>
              <Button onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
