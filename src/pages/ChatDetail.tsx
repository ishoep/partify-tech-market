
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getMessages, sendMessage, getUserProfile, getProductById } from '@/lib/firebase';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partner, setPartner] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!currentUser || !chatId) {
        setError("Не удалось загрузить данные чата. Попробуйте еще раз.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get messages
        const chatMessages = await getMessages(chatId);
        setMessages(chatMessages);
        
        // Get first message to determine chat participants
        if (chatMessages.length > 0) {
          const firstMessage = chatMessages[0];
          const partnerId = firstMessage.senderId === currentUser.uid
            ? firstMessage.receiverId
            : firstMessage.senderId;
          
          // Get partner details
          const partnerData = await getUserProfile(partnerId);
          if (partnerData) {
            setPartner(partnerData);
          } else {
            console.warn("Не удалось получить данные собеседника");
          }
          
          // Get product details if available
          if (firstMessage.productId) {
            try {
              const productData = await getProductById(firstMessage.productId);
              if (productData) {
                setProduct(productData);
              }
            } catch (productError) {
              console.error("Ошибка при загрузке данных товара:", productError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setError("Не удалось загрузить данные чата. Попробуйте еще раз.");
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить чат",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
    
    // Set up polling for new messages
    const intervalId = setInterval(async () => {
      if (!currentUser || !chatId) return;
      
      try {
        const chatMessages = await getMessages(chatId);
        if (chatMessages.length !== messages.length) {
          setMessages(chatMessages);
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, chatId, toast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !chatId) return;
    
    try {
      await sendMessage(chatId, currentUser.uid, newMessage);
      setNewMessage('');
      
      // Refresh messages
      const chatMessages = await getMessages(chatId);
      setMessages(chatMessages);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось отправить сообщение",
      });
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => navigate('/chats')}>Вернуться к списку чатов</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout compact>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-3 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/chats')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            К чатам
          </Button>
          
          <div className="text-right">
            {partner && (
              <div className="text-sm font-medium">{partner.displayName}</div>
            )}
            {product && (
              <div className="text-xs text-muted-foreground">
                Товар: {product.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto border rounded p-3 mb-3">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p>Загрузка сообщений...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-4xl mb-3">💬</div>
                <p className="text-muted-foreground">
                  Нет сообщений. Начните общение!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.uid
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded p-2 max-w-xs md:max-w-md ${
                      message.senderId === currentUser?.uid
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-left">{message.content}</div>
                    <div
                      className={`text-xs mt-1 text-right ${
                        message.senderId === currentUser?.uid
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp && format(
                        new Date(message.timestamp.toDate()),
                        'HH:mm'
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || loading}>
            <Send className="h-4 w-4 mr-2" />
            Отправить
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ChatDetail;
