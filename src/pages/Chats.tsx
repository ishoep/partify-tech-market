
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getUserChats, getUserProfile, getProductById } from '@/lib/firebase';
import { MessageCircle, ArrowLeft } from 'lucide-react';
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
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад
        </Button>
      </div>
      
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold">Чаты</h1>
      </div>

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
        <div className="space-y-3 max-w-2xl mx-auto">
          {chats.map((chat) => (
            <Link to={`/chats/${chat.id}`} key={chat.id}>
              <Card className="glass-card border-0 hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex-1 text-left">
                      <div className="font-medium">
                        {chat.partner.displayName}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({chat.isOwner ? 'покупатель' : 'продавец'})
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Товар: {chat.product.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(chat.lastMessageTime), { 
                          addSuffix: true,
                          locale: ru 
                        })}
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default Chats;
