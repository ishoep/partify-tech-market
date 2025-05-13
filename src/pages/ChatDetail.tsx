
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getMessages, sendMessage, getUserProfile, getProductById } from '@/lib/firebase';
import { ArrowLeft, Send, User, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId || !currentUser) return;
      
      try {
        // Get messages
        const chatMessages = await getMessages(chatId);
        setMessages(chatMessages);
        
        // Determine partner ID and product ID
        if (chatMessages.length > 0) {
          const firstMessage = chatMessages[0];
          const doc = await fetch(`https://firestore.googleapis.com/v1/projects/search-4e940/databases/(default)/documents/chats/${chatId}`).then(res => res.json());
          
          if (doc && doc.fields) {
            const data = {
              buyerId: doc.fields.buyerId?.stringValue,
              sellerId: doc.fields.sellerId?.stringValue,
              productId: doc.fields.productId?.stringValue,
            };
            setChatData(data);
            
            // Get partner profile
            const partnerId = currentUser.uid === data.buyerId ? data.sellerId : data.buyerId;
            const partnerData = await getUserProfile(partnerId);
            setPartner(partnerData);
            
            // Get product details
            if (data.productId && data.productId !== 'general') {
              const productData = await getProductById(data.productId);
              setProduct(productData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chat",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [chatId, currentUser, toast]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || !currentUser) return;
    
    try {
      await sendMessage(chatId, currentUser.uid, message);
      setMessage('');
      
      // Fetch updated messages
      const updatedMessages = await getMessages(chatId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Chat header */}
        <div className="bg-white dark:bg-gray-900 border-b p-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chats')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {partner && (
            <div className="flex items-center flex-1 ml-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={partner.photoURL} alt={partner.displayName} />
                <AvatarFallback>
                  {partner.displayName ? partner.displayName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{partner.displayName || 'Пользователь'}</p>
                    <p className="text-xs text-muted-foreground">
                      {partner.online ? 'Онлайн' : 'Был(а) недавно'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/user/${partner.id}`)}
                      title="Профиль пользователя"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    
                    {partner.shop && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/shop/${partner.id}`)}
                        title="Магазин пользователя"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Product info if available */}
        {product && (
          <div className="bg-muted/50 p-3 flex items-center">
            <div className="w-10 h-10 mr-3 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Обсуждение товара</p>
              <Link to={`/products/${product.id}`} className="text-sm hover:underline text-primary">
                {product.name}
              </Link>
            </div>
          </div>
        )}
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto bg-[#e6ebee] dark:bg-gray-900 p-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Загрузка сообщений...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p>Сообщений пока нет. Отправьте первое сообщение!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isOwn = currentUser?.uid === msg.senderId;
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isOwn 
                          ? 'bg-primary/15 text-primary-foreground rounded-br-none' 
                          : 'bg-white dark:bg-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <div className={`text-xs mt-1 text-muted-foreground flex items-center ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {msg.timestamp && (
                          <span>
                            {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <div className="bg-white dark:bg-gray-900 border-t p-3">
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-primary rounded-full h-10 w-10 p-0 flex items-center justify-center"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatDetail;
