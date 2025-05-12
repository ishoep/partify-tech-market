
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, MessageCircle, User, LogIn, Package, 
  LogOut, ShoppingBag, Menu, X 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="bg-white dark:bg-black z-50 sticky top-0 left-0 right-0 px-3 py-2 mb-2 border-b">
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          telepart
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {currentUser ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center"
              >
                <Link to="/favorites">
                  <Heart className="h-4 w-4 mr-1" />
                  Избранное
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center"
              >
                <Link to="/chats">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Чаты
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <Avatar className="h-6 w-6 mr-1">
                      <AvatarFallback>
                        {currentUser.displayName
                          ? getInitials(currentUser.displayName)
                          : currentUser.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    Профиль
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Профиль
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/shop')}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Магазин
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/warehouse')}>
                    <Package className="h-4 w-4 mr-2" />
                    Склад
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/workshop')}>
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    Мастерская
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-1" />
                  Войти
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Зарегистрироваться</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 top-[53px] z-40 md:hidden bg-background",
            isMenuOpen ? "flex flex-col" : "hidden"
          )}
        >
          <div className="flex flex-col p-4 space-y-2">
            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/favorites">
                    <Heart className="h-4 w-4 mr-2" />
                    Избранное
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/chats">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Чаты
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Профиль
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/shop">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Магазин
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/warehouse">
                    <Package className="h-4 w-4 mr-2" />
                    Склад
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/workshop">
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    Мастерская
                  </Link>
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center justify-start text-destructive"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/register">Зарегистрироваться</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
