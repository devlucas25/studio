
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Bell, MapPin, CheckCircle, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/logo";
import Link from "next/link";

// TODO: Fetch this data from Supabase
const surveys = [
    { id: "1", name: "Eleições Municipais 2024 - Centro", location: "São Paulo, SP", completed: 40, total: 100, deadline: "3 dias" },
    { id: "2", name: "Avaliação de Gestão - Zona Leste", location: "São Paulo, SP", completed: 78, total: 80, deadline: "5 dias" },
    { id: "3", name: "Pesquisa de Opinião - Saúde", location: "Rio de Janeiro, RJ", completed: 12, total: 150, deadline: "10 dias" },
];

const pendingSyncCount = 5;

export default function InterviewerDashboard() {
    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-headline text-lg font-semibold sr-only sm:not-sr-only">London</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Badge variant={pendingSyncCount > 0 ? "destructive" : "secondary"}>
                        <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                        Online {pendingSyncCount > 0 && `(${pendingSyncCount} pendentes)`}
                    </Badge>
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
                            <DropdownMenuItem><Settings className="mr-2 h-4 w-4"/>Configurações</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/"><LogOut className="mr-2 h-4 w-4"/>Sair</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">
                <div className="mb-6">
                    <h1 className="font-headline text-2xl font-semibold">Minhas Pesquisas</h1>
                    <p className="text-muted-foreground">Pesquisas atribuídas a você. Toque para iniciar.</p>
                </div>
                <div className="grid gap-6">
                    {surveys.map((survey, index) => (
                        <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle>{survey.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-1">
                                    <MapPin className="h-4 w-4" />
                                    {survey.location}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                                    <span>Progresso</span>
                                    <span>{survey.completed} / {survey.total}</span>
                                </div>
                                <Progress value={(survey.completed / survey.total) * 100} />
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Prazo: {survey.deadline}</span>
                                <Button asChild>
                                    <Link href={`/interviewer/survey/${survey.id}`}>Iniciar Entrevista</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                     {surveys.length === 0 && (
                        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                             <CardHeader>
                                <CardTitle>Nenhuma pesquisa atribuída</CardTitle>
                                <CardDescription>Aguarde novas instruções do seu administrador.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
