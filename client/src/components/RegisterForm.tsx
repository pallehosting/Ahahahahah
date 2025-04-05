import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/lib/auth';
import { useLocation } from 'wouter';

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Il nome utente deve essere di almeno 3 caratteri' }),
  password: z.string().min(6, { message: 'La password deve essere di almeno 6 caratteri' }),
  name: z.string().optional(),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido' }).optional(),
});

const RegisterForm: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
    },
  });
  
  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;
  
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      await registerUser(data.username, data.password, data.name, data.email);
      toast({
        title: 'Registrazione completata',
        description: 'Benvenuto su VoiceNotes!',
      });
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: 'Errore di registrazione',
        description: error instanceof Error ? error.message : 'Errore durante la registrazione. Riprova.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Registrati</CardTitle>
        <CardDescription>
          Crea un nuovo account per iniziare a usare VoiceNotes
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
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Mario Rossi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opzionale)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="mario.rossi@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Hai già un account?{' '}
          <Button variant="link" className="p-0" onClick={() => setLocation('/login')}>
            Accedi
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
