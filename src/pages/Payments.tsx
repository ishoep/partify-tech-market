
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlusCircle, MinusCircle, Filter, Trash2, Info } from 'lucide-react';
import { addDoc, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress'; 

interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  method: 'card' | 'cash';
  category: string;
  comment: string;
  createdAt: Date;
}

const Payments = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'card' | 'cash'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const isMobile = useIsMobile();
  
  // Form state
  const [method, setMethod] = useState<'card' | 'cash'>('card');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  // Load transactions
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef, where("userId", "==", currentUser.uid));
        
        const querySnapshot = await getDocs(q);
        const fetchedTransactions: Transaction[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTransactions.push({
            id: doc.id,
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            method: data.method,
            category: data.category,
            comment: data.comment,
            createdAt: data.createdAt.toDate()
          });
        });
        
        // Sort by date (newest first)
        fetchedTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить транзакции",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentUser, toast]);

  // Calculate totals
  const calculateTotals = () => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
      }
    });
    
    const balance = income - expense;
    
    return { income, expense, balance };
  };

  const { income, expense, balance } = calculateTotals();

  // Filtered transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.method === filter;
  });

  // Add transaction
  const handleAddTransaction = async () => {
    if (!currentUser) {
      toast({
        title: "Ошибка",
        description: "Вы не авторизованы",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || !category) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const parsedAmount = parseFloat(amount);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast({
          title: "Ошибка", 
          description: "Введите корректную сумму",
          variant: "destructive"
        });
        return;
      }
      
      const transactionData = {
        userId: currentUser.uid,
        type: transactionType,
        amount: parsedAmount,
        method,
        category,
        comment,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "transactions"), transactionData);
      
      // Add to local state
      const newTransaction: Transaction = {
        id: docRef.id,
        ...transactionData
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast({
        title: "Успешно",
        description: transactionType === 'income' ? "Приход добавлен" : "Расход добавлен"
      });
      
      // Reset form
      setMethod('card');
      setAmount('');
      setCategory('');
      setComment('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить транзакцию",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      
      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      toast({
        title: "Успешно",
        description: "Транзакция удалена"
      });
      
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить транзакцию",
        variant: "destructive"
      });
    }
  };

  // Income categories
  const incomeCategories = [
    "Оплата заказа",
    "Оплата счета",
    "Оплата товара",
    "Предоплата заказа",
    "Прочие доходы"
  ];

  // Expense categories
  const expenseCategories = [
    "Возврат товара",
    "Возврат заказа",
    "Выплата ЗП",
    "Оплата аренды",
    "Оплата коммунальных услуг",
    "Оплата поставщику",
    "Прочие расходы"
  ];

  return (
    <MainLayout showSidebar>
      <div className="container max-w-5xl mx-auto py-4 px-2 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Платежи</h1>
        
        {/* Balance and Totals */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
          <div className="col-span-3 sm:col-span-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Баланс</p>
            <p className={`text-base sm:text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toFixed(2)} UZS
            </p>
          </div>
          <div className="col-span-3/2 sm:col-span-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Приход</p>
            <p className="text-base sm:text-xl font-bold text-green-600">{income.toFixed(2)} UZS</p>
          </div>
          <div className="col-span-3/2 sm:col-span-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Расход</p>
            <p className="text-base sm:text-xl font-bold text-red-600">{expense.toFixed(2)} UZS</p>
          </div>
        </div>
        
        {/* Filters and Add Button */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start ${isMobile ? 'items-stretch' : 'sm:items-center'} mb-4 sm:mb-6 gap-2 sm:gap-4`}>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="card">Карта</TabsTrigger>
                <TabsTrigger value="cash">Наличные</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            Создать
          </Button>
        </div>
        
        {/* Transactions List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-full max-w-md">
              <Progress value={50} className="h-1 w-full mb-2" />
              <p className="text-center text-gray-500">Загрузка транзакций...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <img 
              src="https://static.thenounproject.com/png/2116141-200.png" 
              alt="Здесь пока пусто" 
              className="w-24 h-24 sm:w-32 sm:h-32 mb-4 opacity-60"
            />
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Здесь пока пусто</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Добавьте первую транзакцию, нажав на кнопку "Создать"
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="bg-white dark:bg-gray-800 border rounded-lg p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {transaction.type === 'income' ? (
                    <div className="bg-green-100 dark:bg-green-900 p-1.5 sm:p-2 rounded-full">
                      <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="bg-red-100 dark:bg-red-900 p-1.5 sm:p-2 rounded-full">
                      <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {transaction.category.length > 20 && isMobile 
                        ? transaction.category.substring(0, 20) + "..."
                        : transaction.category}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {format(transaction.createdAt, 'dd.MM.yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className={`font-bold text-sm sm:text-base ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} UZS
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.method === 'card' ? 'Карта' : 'Наличные'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Transaction Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className={isMobile ? "w-[95%] max-w-full rounded-lg p-4 top-[5%] sm:max-w-[425px]" : "sm:max-w-[425px]"}>
            <DialogHeader>
              <DialogTitle>
                {transactionType === 'income' ? 'Добавить приход' : 'Добавить расход'}
              </DialogTitle>
              <DialogDescription>
                Заполните данные для добавления в историю платежей
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Transaction Type */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={transactionType === 'income' ? 'default' : 'outline'}
                  onClick={() => setTransactionType('income')}
                  className={transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Приход
                </Button>
                <Button 
                  variant={transactionType === 'expense' ? 'default' : 'outline'}
                  onClick={() => setTransactionType('expense')}
                  className={transactionType === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <MinusCircle className="mr-2 h-4 w-4" />
                  Расход
                </Button>
              </div>
              
              {/* Payment Method */}
              <div>
                <Label className="mb-2 block">Метод оплаты</Label>
                <RadioGroup value={method} onValueChange={(value) => setMethod(value as 'card' | 'cash')} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Карта</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Наличные</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Amount */}
              <div>
                <Label htmlFor="amount">Сумма</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Введите сумму" 
                  className="text-base sm:text-sm"
                />
              </div>
              
              {/* Category */}
              <div>
                <Label htmlFor="category">Статья</Label>
                <select 
                  id="category" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Выберите категорию</option>
                  {transactionType === 'income' ? (
                    incomeCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Comment */}
              <div>
                <Label htmlFor="comment">Комментарий</Label>
                <Textarea 
                  id="comment" 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Добавьте комментарий (необязательно)" 
                  className="text-base sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAddTransaction} 
                disabled={isSaving}
                className="relative"
              >
                {isSaving ? (
                  <>
                    <span className="opacity-0">Сохранить</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-b-transparent border-white rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Transaction Detail Sheet */}
        <Sheet open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
          <SheetContent className={isMobile ? "w-full p-4" : ""}>
            <SheetHeader>
              <SheetTitle>Детали платежа</SheetTitle>
            </SheetHeader>
            
            {selectedTransaction && (
              <div className="mt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {selectedTransaction.type === 'income' ? (
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <PlusCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                        <MinusCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold">
                      {selectedTransaction.type === 'income' ? 'Приход' : 'Расход'}
                    </h3>
                  </div>
                  <p className={`text-xl font-bold ${selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{selectedTransaction.amount.toFixed(2)} UZS
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Дата</p>
                      <p>{format(selectedTransaction.createdAt, 'dd.MM.yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Время</p>
                      <p>{format(selectedTransaction.createdAt, 'HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Метод</p>
                      <p>{selectedTransaction.method === 'card' ? 'Карта' : 'Наличные'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Категория</p>
                    <p>{selectedTransaction.category}</p>
                  </div>
                  
                  {selectedTransaction.comment && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Комментарий</p>
                      <p>{selectedTransaction.comment}</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-6"
                  onClick={() => handleDeleteTransaction(selectedTransaction.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  );
};

export default Payments;
