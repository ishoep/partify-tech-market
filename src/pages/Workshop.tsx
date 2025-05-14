
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useAuth } from '@/context/AuthContext';
import { createTask, getTasks, updateTaskStatus } from '@/lib/firebase';
import { format } from 'date-fns';

// Define task statuses
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
  const [tasks, setTasks] = useState<any[]>([]);
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
          title: "Error",
          description: "Failed to load tasks",
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
        description: "Заполните все поля.",
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
        status: status,
      });
      
      toast({
        title: "Успех",
        description: "Задача создана.",
      });
      
      // Reset form
      setTaskName('');
      setClient('');
      setPrice('');
      setDate('');
      
      setShowTaskForm(false);
      
      // Refresh tasks
      const userTasks = await getTasks(currentUser?.uid as string);
      setTasks(userTasks);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось создать задачу.",
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
        description: `Задача ${completed ? "выполнена" : "возобновлена"}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить статус задачи.",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "Все задачи") return true;
    if (activeTab === "Активные") return !task.completed;
    return task.status === activeTab;
  });

  return (
    <MainLayout>
      <div className="flex flex-row h-full">
        {/* Sidebar - fixed width */}
        <div className="w-64 h-full border-r bg-white dark:bg-black">
          <ProfileSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              Назад
            </Button>
          </div>
          
          <Card>
            <CardHeader className="bg-primary/10 pb-2">
              <CardTitle className="text-2xl text-left">Мастерская</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Task status tabs */}
              <Tabs defaultValue="Активные" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex overflow-auto py-2 justify-start border-b">
                  {taskStatuses.map((status) => (
                    <TabsTrigger key={status} value={status} className="px-4">
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value={activeTab} className="px-4 py-4">
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">Задачи: {activeTab}</h3>
                    </div>
                    <Button onClick={() => setShowTaskForm(!showTaskForm)}>
                      {showTaskForm ? "Отмена" : "Добавить задачу"}
                    </Button>
                  </div>
                  
                  {showTaskForm && (
                    <div className="mb-6">
                      <Card className="bg-white/50 dark:bg-black/50">
                        <CardContent className="p-4">
                          <form onSubmit={handleCreateTask} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="taskName" className="text-left block">Название задачи*</Label>
                                <Input
                                  id="taskName"
                                  value={taskName}
                                  onChange={(e) => setTaskName(e.target.value)}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="client" className="text-left block">Клиент*</Label>
                                <Input
                                  id="client"
                                  value={client}
                                  onChange={(e) => setClient(e.target.value)}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="price" className="text-left block">Цена (UZS)*</Label>
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
                                <Label htmlFor="date" className="text-left block">Дата*</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={date}
                                  onChange={(e) => setDate(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="status" className="text-left block">Статус*</Label>
                                <select
                                  id="status"
                                  className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-black"
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
                              {loading ? "Добавление..." : "Добавить задачу"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Загрузка задач...</p>
                    </div>
                  ) : filteredTasks.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-8 gap-2 p-2 font-medium text-sm border-b text-muted-foreground">
                        <div className="col-span-2">Заказ / Клиент</div>
                        <div className="col-span-2">Статус</div>
                        <div className="col-span-1">Срок</div>
                        <div className="col-span-1">Цена</div>
                        <div className="col-span-2">Действия</div>
                      </div>
                      {filteredTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="grid grid-cols-8 gap-2 p-3 border rounded-md bg-white/50 dark:bg-black/50 items-center hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <div className="col-span-2">
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-muted-foreground">{task.client}</p>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${task.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {task.status || (task.completed ? 'Готов' : 'Активные')}
                            </span>
                          </div>
                          <div className="col-span-1 text-sm">
                            {task.date ? format(new Date(task.date), 'dd.MM.yyyy') : 'Не указана'}
                          </div>
                          <div className="col-span-1 text-sm font-medium">
                            {task.price?.toLocaleString() || 0} UZS
                          </div>
                          <div className="col-span-2 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleTaskStatus(task.id, !task.completed)}
                            >
                              {task.completed ? "Возобновить" : "Завершить"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Нет задач в категории {activeTab}</p>
                      <p className="text-sm mt-2">Добавьте новую задачу или измените фильтр</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Workshop;
