
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
  const [partner, setPartner] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!currentUser || !chatId) return;
      
      setLoading(true);
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
          setPartner(partnerData);
          
          // Get product details if available
          if (firstMessage.productId) {
            const productData = await getProductById(firstMessage.productId);
            setProduct(productData);
          }
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
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
    
    // Set up real-time listener for new messages
    const intervalId = setInterval(async () => {
      try {
        const chatMessages = await getMessages(chatId as string);
        if (chatMessages.length !== messages.length) {
          setMessages(chatMessages);
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    }, 3000);
    
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
        description: error.message || "Не удалось отправить сообщение.",
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="mb-4 flex justify-between items-center">
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
        
        <div className="flex-1 overflow-y-auto glass-card p-4 mb-4 rounded-lg border-0">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p>Загрузка сообщений...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-5xl mb-4">💬</div>
                <p className="text-muted-foreground">
                  Нет сообщений. Начните общение прямо сейчас!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className={`rounded-lg p-3 max-w-xs md:max-w-md ${
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
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Отправить
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ChatDetail;
