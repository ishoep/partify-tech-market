
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { useCity } from '@/context/CityContext';
import CitySelector from './CitySelector';
import { MessageCircle, Heart, User } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedCity } = useCity();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) params.set('term', searchTerm);
    if (selectedCity) params.set('city', selectedCity);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <header className="w-full border-b p-3">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center text-xl font-bold text-primary">
          Telepart
        </Link>
        
        {/* Search */}
        {/* <form onSubmit={handleSearch} className="flex-1 w-full">
          <div className="relative">
            <Input
              type="search"
              placeholder="Поиск товаров, запчастей, аксессуаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-16"
            />
            <Button 
              type="submit" 
              className="absolute right-0 top-0 rounded-l-none h-full"
            >
              Найти
            </Button>
          </div>
        </form> */}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* <CitySelector /> */}
          
          {currentUser ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate('/chats')}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')}>
                <Heart className="h-5 w-5" />
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
            </>
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
