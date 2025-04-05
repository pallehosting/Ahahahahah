import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/auth';
import { useLocation } from 'wouter';

const loginSchema = z.object({
  username: z.string().min(3, { message: 'Il nome utente deve essere di almeno 3 caratteri' }),
  password: z.string().min(6, { message: 'La password deve essere di almeno 6 caratteri' }),
});

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;
  
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await loginUser(data.username, data.password);
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: 'Errore di accesso',
        description: error instanceof Error ? error.message : 'Credenziali non valide. Riprova.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Accedi</CardTitle>
        <CardDescription>
          Inserisci le tue credenziali per accedere a VoiceNotes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome utente</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Non hai un account?{' '}
          <Button variant="link" className="p-0" onClick={() => setLocation('/register')}>
            Registrati
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
