
import React, { useState } from 'react';
import { User, Settings, Package, Heart, MapPin, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const Account = () => {
  const { user, login, logout, updateUser } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileForm);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated."
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSigningIn}>
                    {isSigningIn ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>Demo credentials: any email and password</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Change Photo
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <Button type="submit">Update Profile</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-semibold">{user.orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Addresses</span>
                    <span className="font-semibold">{user.addresses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold">Jan 2024</span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={logout}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {user.orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Orders
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{address.firstName} {address.lastName}</p>
                          <p className="text-gray-600">{address.street}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                          {address.isDefault && (
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Add New Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Login Sessions</h3>
                  <p className="text-gray-600 mb-4">
                    Manage where you're logged in
                  </p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
