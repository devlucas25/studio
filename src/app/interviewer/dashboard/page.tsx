
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Bell, MapPin, LogOut, Settings, Wifi, Download, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/logo";
import Link from "next/link";
import { ConnectionStatus } from "@/components/connection-status";
import { OfflineMap } from "@/components/offline-map";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { getAllSurveys } from "@/lib/supabase/queries";
import { Survey } from "@/types/database";


const SyncManager = () => {
    "use client";
    const { isInstallable, installApp, shareApp, canShare } = usePWA();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncOfflineData();
            console.log('Sync result:', result);
            setLastSync(new Date().toLocaleString('pt-BR'));
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };
    
    // Import PWA and Offline functionality only on client
    const { usePWA } = require("@/hooks/use-pwa");
    const { syncOfflineData } = require("@/lib/offline-storage");
    const { useState } = require("react");

    return (
        <>
             <div className="flex items-center gap-4">
                    <ConnectionStatus />
                    
                    {isSyncing && (
                        <Badge variant="secondary" className="animate-pulse">
                            <Wifi className="mr-2 h-4 w-4 animate-spin" />
                            Sincronizando...
                        </Badge>
                    )}
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="hidden sm:flex"
                    >
                        <Wifi className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="h-9 w-9 cursor-pointer">
                                <AvatarImage src="https://picsum.photos/101" alt="Interviewer" data-ai-hint="person" />
                                <AvatarFallback>JS</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleManualSync} disabled={isSyncing}>
                                <Wifi className="mr-2 h-4 w-4" />
                                {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                            </DropdownMenuItem>
                            {isInstallable && (
                                <DropdownMenuItem onClick={installApp}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Instalar App
                                </DropdownMenuItem>
                            )}
                            {canShare && (
                                <DropdownMenuItem onClick={shareApp}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Compartilhar
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem><Settings className="mr-2 h-4 w-4"/>Configurações</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/"><LogOut className="mr-2 h-4 w-4"/>Sair</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {lastSync && (
                    <div className="text-right text-sm text-muted-foreground mt-2">
                        <p>Última sincronização:</p>
                        <p className="font-medium">{lastSync}</p>
                    </div>
                )}
        </>
    )
}


export default async function InterviewerDashboard() {
    const electoralSurveys: Survey[] = await getAllSurveys();

    // Mock area for map, replace with actual survey data later
    const mapMarkers = electoralSurveys.map(survey => ({
        id: survey.id,
        position: [-23.5505 + Math.random() * 0.1, -46.6333 + Math.random() * 0.1] as [number, number], // Mock location
        title: survey.title,
        status: survey.status === 'completed' ? 'completed' as const : 
                survey.status === 'active' ? 'in-progress' as const : 'pending' as const
    }));

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-headline text-lg font-semibold sr-only sm:not-sr-only">London</span>
                </Link>

                <SyncManager />
            </header>
            <main className="flex-1 p-4 sm:p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-headline text-2xl font-semibold">Minhas Pesquisas Eleitorais</h1>
                            <p className="text-muted-foreground">Pesquisas eleitorais atribuídas a você. Toque para iniciar coleta.</p>
                        </div>
                    </div>
                </div>
                
                {/* Mapa das áreas de pesquisa */}
                <div className="mb-6">
                    <OfflineMap
                        center={[-23.5505, -46.6333]}
                        zoom={11}
                        markers={mapMarkers}
                        showCurrentLocation={true}
                        className="h-64"
                    />
                </div>
                <div className="grid gap-6">
                    {electoralSurveys.map((survey, index) => {
                        const completed = parseInt(survey.progress?.split('/')[0] || '0');
                        const total = parseInt(survey.progress?.split('/')[1] || '100');
                        const progressValue = total > 0 ? (completed / total) * 100 : 0;
                        return (
                            <Card key={survey.id} className="shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>{survey.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 pt-1">
                                        <MapPin className="h-4 w-4" />
                                        {survey.city || 'Local não definido'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                                        <span>Progresso</span>
                                        <span>{survey.progress || '0/100'}</span>
                                    </div>
                                    <Progress value={progressValue} />
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <Badge variant="outline">{survey.status}</Badge>
                                    <Button asChild>
                                        <Link href={`/interviewer/survey/${survey.id}`}>Iniciar Pesquisa</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                     {electoralSurveys.length === 0 && (
                        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                             <CardHeader>
                                <CardTitle>Nenhuma pesquisa eleitoral atribuída</CardTitle>
                                <CardDescription>Aguarde novas instruções do seu administrador.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
                
                {/* Resumo diário */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Resumo do Dia</CardTitle>
                        <CardDescription>Suas metas e progresso hoje</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">12</div>
                                <div className="text-sm text-muted-foreground">Entrevistas Hoje</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">130</div>
                                <div className="text-sm text-muted-foreground">Total Concluídas</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">2</div>
                                <div className="text-sm text-muted-foreground">Pendentes Sync</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">98%</div>
                                <div className="text-sm text-muted-foreground">Precisão GPS</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
            
            <PWAInstallPrompt />
        </div>
    );
}
