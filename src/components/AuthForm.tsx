
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await login(email, password, role);
        toast.success('Successfully logged in');
      } else {
        await signup(email, password, name, role);
        toast.success('Account created successfully');
      }
      
      // Redirect based on role
      redirectBasedOnRole(role);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case 'customer':
        navigate('/customer-dashboard');
        break;
      case 'shopkeeper':
        navigate('/shopkeeper-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/');
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto glass animate-scale-in">
      <Tabs defaultValue="login" onValueChange={(value) => setIsLogin(value === 'login')}>
        <CardHeader>
          <div className="flex justify-center mb-2">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Fill in your details to create a new account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-white/50 dark:bg-black/20"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-white/50 dark:bg-black/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-white/50 dark:bg-black/20"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <Label>I am a:</Label>
              <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)} className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2 rounded-md border p-3 bg-white/50 dark:bg-black/20">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer" className="flex-1 cursor-pointer">Customer looking to print</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 bg-white/50 dark:bg-black/20">
                  <RadioGroupItem value="shopkeeper" id="shopkeeper" />
                  <Label htmlFor="shopkeeper" className="flex-1 cursor-pointer">Print Shop Owner</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 bg-white/50 dark:bg-black/20">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex-1 cursor-pointer">Administrator</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button 
              variant="link" 
              onClick={() => setIsLogin(!isLogin)}
              className="p-0 h-auto ml-1"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Button>
          </div>
        </CardFooter>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
