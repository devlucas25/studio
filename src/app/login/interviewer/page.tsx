
import Link from 'next/link';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from '@/components/logo';

export default function InterviewerLoginPage({ searchParams }: { searchParams: { message: string } }) {
  const signIn = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect('/login/interviewer?message=Could not authenticate user');
    }

    return redirect('/interviewer/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Logo className="h-16 w-16 mb-4" />
          <CardTitle className="font-headline text-3xl">Login do Entrevistador</CardTitle>
          <CardDescription>Acesse suas pesquisas</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">Lembrar-me</Label>
            </div>
            {searchParams?.message && (
                <p className="text-sm font-medium text-destructive">{searchParams.message}</p>
            )}
            <Button formAction={signIn} className="w-full">
              Entrar
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/">Voltar</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
