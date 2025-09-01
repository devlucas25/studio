import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { ArrowRight, TestTube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-16 w-16 mb-4" />
          <CardTitle className="font-headline text-3xl">
            London Polling Platform
          </CardTitle>
          <CardDescription>
            Selecione seu perfil para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/login/interviewer">
              Entrar como Entrevistador
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login/admin">
              Entrar como Administrador
              <ArrowRight />
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4">
           <div className="relative w-full">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">
              ou
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2"><TestTube className="h-4 w-4"/> Acesso Rápido (Modo Teste)</p>
           <div className="grid grid-cols-2 gap-4 w-full">
             <Button asChild variant="secondary" className="w-full">
                <Link href="/interviewer/dashboard">
                    Entrevistador
                </Link>
            </Button>
             <Button asChild variant="secondary" className="w-full">
                <Link href="/admin/dashboard">
                    Administrador
                </Link>
            </Button>
           </div>
        </CardFooter>
      </Card>
    </main>
  );
}
