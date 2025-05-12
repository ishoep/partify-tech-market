
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useAuth } from '@/context/AuthContext';
import { createTask, getTasks, updateTaskStatus } from '@/lib/firebase';
import { format } from 'date-fns';

const Workshop: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Task form fields
  const [taskName, setTaskName] = useState('');
  const [client, setClient] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');

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

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64">
          <ProfileSidebar />
        </div>
        
        <div className="flex-1">
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              Назад
            </Button>
          </div>
          
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-left">Мастерская</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Задачи</h3>
                <Button onClick={() => setShowTaskForm(!showTaskForm)}>
                  {showTaskForm ? "Отмена" : "Добавить задачу"}
                </Button>
              </div>
              
              {showTaskForm && (
                <div className="mb-6">
                  <Card className="glass-card border-0">
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
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3 text-left">Активные задачи</h3>
                  {activeTasks.length === 0 ? (
                    <p className="text-muted-foreground">Нет активных задач</p>
                  ) : (
                    <div className="space-y-2">
                      {activeTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 border rounded-md bg-white/50 dark:bg-black/50"
                        >
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={task.id}
                                checked={task.completed}
                                onCheckedChange={(checked) => 
                                  toggleTaskStatus(task.id, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={task.id}
                                className="font-medium"
                              >
                                {task.name}
                              </Label>
                            </div>
                            <div className="text-sm text-muted-foreground pl-6">
                              <p>Клиент: {task.client}</p>
                              <p>
                                Дата: {task.date ? format(new Date(task.date), 'dd.MM.yyyy') : 'Не указана'}
                              </p>
                              <p className="font-medium">
                                Цена: {task.price?.toLocaleString() || 0} UZS
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-3 text-left">Выполненные задачи</h3>
                  {completedTasks.length === 0 ? (
                    <p className="text-muted-foreground">Нет выполненных задач</p>
                  ) : (
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                        >
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={task.id}
                                checked={task.completed}
                                onCheckedChange={(checked) => 
                                  toggleTaskStatus(task.id, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={task.id}
                                className="font-medium line-through"
                              >
                                {task.name}
                              </Label>
                            </div>
                            <div className="text-sm text-muted-foreground pl-6">
                              <p>Клиент: {task.client}</p>
                              <p>
                                Дата: {task.date ? format(new Date(task.date), 'dd.MM.yyyy') : 'Не указана'}
                              </p>
                              <p className="font-medium">
                                Цена: {task.price?.toLocaleString() || 0} UZS
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Workshop;
