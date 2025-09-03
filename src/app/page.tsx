
"use client";

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
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";
import { ArrowRight, TestTube, Download, Smartphone, Wifi, Shield, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { usePWA } from "@/hooks/use-pwa";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { isInstallable, isInstalled, isOnline, installApp, canShare } = usePWA();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Show features after a brief delay
    const timer = setTimeout(() => setShowFeatures(true), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-16 w-16 mb-4 text-primary" />
          <CardTitle className="font-headline text-3xl">
            London Pesquisas
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
        
        {isInstallable && (
          <CardContent className="pt-0">
            <Button onClick={installApp} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Instalar como App
            </Button>
          </CardContent>
        )}
        
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
                <Link href="/interviewer/dashboard?mode=test">
                    Entrevistador
                </Link>
            </Button>
             <Button asChild variant="secondary" className="w-full">
                <Link href="/admin/dashboard?mode=test">
                    Administrador
                </Link>
            </Button>
           </div>
        </CardFooter>
      </Card>
      
      {showFeatures && (
        <div className="w-full max-w-4xl mt-8 space-y-6">
          <div className="text-center">
            <h2 className="font-headline text-2xl font-semibold mb-2">Sistema Profissional Completo</h2>
            <p className="text-muted-foreground">Desenvolvido especificamente para pesquisas eleitorais</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wifi className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Operação Offline</h3>
                <p className="text-sm text-muted-foreground">Funciona sem internet com sincronização automática</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Validação GPS</h3>
                <p className="text-sm text-muted-foreground">Localização rigorosa para garantir qualidade</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Segurança Total</h3>
                <p className="text-sm text-muted-foreground">Dados criptografados e protegidos</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">App Nativo</h3>
                <p className="text-sm text-muted-foreground">Installável como aplicativo no celular</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center gap-4 text-sm">
            <Badge variant={isOnline ? "secondary" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {isInstalled && (
              <Badge variant="secondary">
                App Instalado
              </Badge>
            )}
            <Badge variant="outline">
              Versão 2.0
            </Badge>
          </div>
        </div>
      )}
      
      <PWAInstallPrompt />
    </main>
  );
}
