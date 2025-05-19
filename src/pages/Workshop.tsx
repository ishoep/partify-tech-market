import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useAuth } from '@/context/AuthContext';
import { createTask, getTasks, updateTaskStatus } from '@/lib/firebase';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  client: string;
  price: number;
  date: string;
  status: string;
  completed: boolean;
}

const taskStatuses = [
  "Все задачи",
  "Активные",
  "Срочные", 
  "Готов",
  "Согласование",
  "Ждёт запчасть",
  "В работе"
];

const Workshop: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Активные");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Task form fields
  const [taskName, setTaskName] = useState('');
  const [client, setClient] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Активные');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const userTasks = await getTasks(currentUser.uid);
        setTasks(userTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить задачи",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser, toast]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName || !client || !price || !date) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await createTask(currentUser?.uid as string, {
        name: taskName,
        client,
        price: Number(price),
        date,
        status,
        completed: false
      });
      
      toast({
        title: "Успех",
        description: "Задача успешно создана",
      });
      
      // Reset form
      setTaskName('');
      setClient('');
      setPrice('');
      setDate('');
      setStatus('Активные');
      
      setShowTaskForm(false);
      
      // Refresh tasks
      const userTasks = await getTasks(currentUser?.uid as string);
      setTasks(userTasks);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось создать задачу",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskStatus(taskId, completed);
      
      // Refresh tasks
      const userTasks = await getTasks(currentUser?.uid as string);
      setTasks(userTasks);
      
      toast({
        title: "Успех",
        description: `Задача ${completed ? "завершена" : "возобновлена"}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось изменить статус задачи",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "Все задачи") return true;
    if (activeTab === "Активные") return !task.completed;
    return task.status === activeTab;
  });

  return (
    <MainLayout showSidebar>
      <div className="w-full py-4 px-2 sm:py-6">
        
        
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl sm:text-2xl">Мастерская</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Task status tabs */}
            <Tabs defaultValue="Активные" value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <TabsList className="w-full flex overflow-auto py-0 px-2 justify-start bg-transparent">
                  {taskStatuses.map((status) => (
                    <TabsTrigger 
                      key={status} 
                      value={status} 
                      className="px-3 py-2 text-sm md:px-4 md:text-base rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="p-4">
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-lg font-medium">Задачи: {activeTab}</h3>
                  <Button 
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    disabled={loading}
                  >
                    {showTaskForm ? "Отмена" : "Добавить задачу"}
                  </Button>
                </div>
                
                {showTaskForm && (
                  <div className="mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <form onSubmit={handleCreateTask} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="taskName">Название задачи*</Label>
                              <Input
                                id="taskName"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="client">Клиент*</Label>
                              <Input
                                id="client"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="price">Цена (UZS)*</Label>
                              <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min={0}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="date">Дата*</Label>
                              <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="status">Статус*</Label>
                              <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                              >
                                {taskStatuses.slice(1).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? "Создание..." : "Создать задачу"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredTasks.length > 0 ? (
                  <div className="space-y-2">
                    <div className="hidden sm:grid grid-cols-8 gap-2 p-2 font-medium text-sm border-b text-muted-foreground">
                      <div className="col-span-2">Заказ / Клиент</div>
                      <div className="col-span-2">Статус</div>
                      <div className="col-span-1">Срок</div>
                      <div className="col-span-1">Цена</div>
                      <div className="col-span-2">Действия</div>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {filteredTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="grid grid-cols-1 sm:grid-cols-8 gap-2 p-3 border rounded-md bg-background hover:bg-accent"
                        >
                          <div className="sm:col-span-2">
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-muted-foreground">{task.client}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.completed 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            }`}>
                              {task.status || (task.completed ? 'Готов' : 'Активные')}
                            </span>
                          </div>
                          <div className="sm:col-span-1 text-sm">
                            {task.date ? format(new Date(task.date), 'dd.MM.yyyy') : 'Не указана'}
                          </div>
                          <div className="sm:col-span-1 text-sm font-medium">
                            {task.price?.toLocaleString() || 0} UZS
                          </div>
                          <div className="sm:col-span-2 flex gap-2 justify-end sm:justify-start">
                            <Button 
                              variant={task.completed ? "secondary" : "default"}
                              size="sm"
                              onClick={() => toggleTaskStatus(task.id, !task.completed)}
                              className="w-full sm:w-auto"
                            >
                              {task.completed ? "Возобновить" : "Завершить"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Нет задач в категории "{activeTab}"</p>
                    <Button 
                      variant="ghost" 
                      className="mt-2"
                      onClick={() => setShowTaskForm(true)}
                    >
                      Добавить новую задачу
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Workshop;