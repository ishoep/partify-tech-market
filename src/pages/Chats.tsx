
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getUserChats, getUserProfile, getProductById } from '@/lib/firebase';
import { MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const Chats: React.FC = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const userChats = await getUserChats(currentUser.uid);
        
        // Get additional chat details
        const chatsWithDetails = await Promise.all(
          userChats.map(async (chat) => {
            // Get chat partner details
            const partnerId = chat.isOwner ? chat.buyerId : chat.sellerId;
            const partner = await getUserProfile(partnerId);
            
            // Get product details
            const product = await getProductById(chat.productId);
            
            return {
              ...chat,
              partner: partner || { displayName: 'Пользователь' },
              product: product || { name: 'Товар' },
              lastMessageTime: chat.updatedAt?.toDate() || new Date(),
            };
          })
        );
        
        // Sort by last message time
        chatsWithDetails.sort((a, b) => 
          b.lastMessageTime - a.lastMessageTime
        );
        
        setChats(chatsWithDetails);
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chats",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUser, toast]);

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Chats header */}
        <div className="bg-white dark:bg-gray-900 border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Чаты</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <p>Загрузка...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-medium">У вас пока нет чатов</h3>
              <p className="text-muted-foreground mb-6">
                Начните общение с продавцом, чтобы появился чат
              </p>
              <Button onClick={() => navigate('/')}>
                Перейти к поиску
              </Button>
            </div>
          ) : (
            <div>
              {chats.map((chat) => (
                <Link to={`/chats/${chat.id}`} key={chat.id} className="block">
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.partner.photoURL} alt={chat.partner.displayName} />
                      <AvatarFallback>
                        {chat.partner.displayName ? chat.partner.displayName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {chat.partner.displayName || 'Пользователь'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.lastMessageTime), { 
                            addSuffix: false,
                            locale: ru 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground truncate mr-2">
                          {chat.lastMessage || `Обсуждение: ${chat.product.name || 'товара'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Chats;
