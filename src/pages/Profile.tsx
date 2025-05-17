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
import { updateUserProfile } from '@/lib/firebase';
import { getAuth } from "firebase/auth";
import { EmailAuthProvider, updateProfile, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Loader } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // добавлен импорт

const Profile: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const auth = getAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // проверка устройства

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setPhone(userProfile?.phone || '');
      setDataLoaded(true);
    }
  }, [currentUser, userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: name });
        await updateUserProfile(currentUser.uid, {
          displayName: name,
          phone,
        });
      }

      toast({
        title: "Успех",
        description: "Профиль успешно обновлен.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Новые пароли не совпадают.",
      });
      return;
    }

    setLoading(true);

    try {
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);

        toast({
          title: "Успех",
          description: "Пароль успешно изменен.",
        });

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {!isMobile && (
          <div className="w-full md:w-64">
            <ProfileSidebar />
          </div>
        )}

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              Назад
            </Button>
           
          </div>

          {!dataLoaded ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-left">Профиль</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Профиль</TabsTrigger>
                    <TabsTrigger value="password">Пароль</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile">
                    <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-left block">Email</Label>
                        <Input
                          id="email"
                          value={currentUser?.email || ''}
                          disabled
                        />
                        <p className="text-sm text-muted-foreground text-left">
                          Email не может быть изменен
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-left block">Имя</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-left block">Телефон</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+998 XX XXX XX XX"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Обновление..." : "Обновить профиль"}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="password">
                    <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-left block">Текущий пароль</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-left block">Новый пароль</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-left block">Подтвердите новый пароль</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Изменение..." : "Изменить пароль"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
