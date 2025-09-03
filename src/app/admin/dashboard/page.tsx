
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Activity, ArrowUp, Loader2, BrainCircuit, Download, MapPin, AlertTriangle, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import Link from "next/link";
import { generateExecutiveSummary } from "@/ai/flows/generate-executive-summary";
import { suggestImprovements } from "@/ai/flows/suggest-improvements";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OfflineMap } from "@/components/offline-map";
import { ReportGenerator } from "@/lib/report-generator";
import { useToast } from "@/hooks/use-toast";


const kpiData = [
  { title: "Pesquisas Ativas", value: "12", icon: FileText, change: "+2" },
  { title: "Progresso Geral", value: "68%", icon: Activity, change: "+5.2%" },
  { title: "Entrevistadores Ativos", value: "45", icon: Users, change: "-1" },
];

const voteIntentionData = [
  { name: "Candidato A", votes: 45 },
  { name: "Candidato B", votes: 32 },
  { name: "Candidato C", votes: 15 },
  { name: "Brancos/Nulos", votes: 8 },
];

const approvalData = [
    { name: 'Aprova', value: 65, color: 'hsl(var(--chart-2))' },
    { name: 'Rejeita', value: 35, color: 'hsl(var(--destructive))' },
];

const interviewersData = [
  { name: "João Silva", interviews: 125, avgTime: "12 min", validation: "98", status: "online", location: "Centro" },
  { name: "Maria Oliveira", interviews: 110, avgTime: "14 min", validation: "95", status: "online", location: "Zona Sul" },
  { name: "Carlos Pereira", interviews: 98, avgTime: "11 min", validation: "99", status: "offline", location: "Vila Madalena" },
  { name: "Ana Costa", interviews: 95, avgTime: "15 min", validation: "92", status: "online", location: "Zona Norte" },
];

const progressData = [
  { day: 'Seg', completed: 45, target: 50 },
  { day: 'Ter', completed: 52, target: 50 },
  { day: 'Qua', completed: 48, target: 50 },
  { day: 'Qui', completed: 61, target: 50 },
  { day: 'Sex', completed: 55, target: 50 },
  { day: 'Sáb', completed: 42, target: 40 },
  { day: 'Dom', completed: 38, target: 40 },
];

const alertsData = [
  { id: 1, type: 'warning', message: 'Entrevista fora da área - João Silva', time: '10:30', location: [-23.5505, -46.6333] },
  { id: 2, type: 'info', message: 'Meta diária atingida - Maria Oliveira', time: '14:20', location: [-23.6181, -46.6647] },
  { id: 3, type: 'error', message: 'GPS com baixa precisão - Carlos Pereira', time: '16:45', location: [-23.5368, -46.6918] },
];


export default function AdminDashboardPage() {
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [suggestedImprovements, setSuggestedImprovements] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isImprovementsLoading, setIsImprovementsLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const { toast } = useToast();

  // Generate map markers from interviewers and alerts
  const mapMarkers = [
    ...interviewersData.map(interviewer => ({
      id: interviewer.name,
      position: [-23.5505 + Math.random() * 0.1, -46.6333 + Math.random() * 0.1] as [number, number],
      title: `${interviewer.name} - ${interviewer.location}`,
      status: interviewer.status === 'online' ? 'completed' as const : 'pending' as const
    })),
    ...alertsData.map(alert => ({
      id: alert.id.toString(),
      position: alert.location as [number, number],
      title: alert.message,
      status: alert.type === 'error' ? 'pending' as const : 'in-progress' as const
    }))
  ];

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setExecutiveSummary('');
    try {
      const pollingData = JSON.stringify({ voteIntentionData, approvalData });
      const result = await generateExecutiveSummary({ pollingData });
      setExecutiveSummary(result.summary);
    } catch (error) {
      console.error(error);
      setExecutiveSummary('Falha ao gerar o resumo.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleSuggestImprovements = async () => {
    setIsImprovementsLoading(true);
    setSuggestedImprovements('');
    try {
      const surveyData = JSON.stringify({ voteIntentionData, approvalData, interviewersData });
      const campaignGoals = 'O objetivo é entender a intenção de voto para a eleição municipal e avaliar a gestão atual para orientar a campanha do Candidato A.';
      const result = await suggestImprovements({ surveyData, campaignGoals });
      setSuggestedImprovements(result.suggestedImprovements);
    } catch (error) {
      console.error(error);
      setSuggestedImprovements('Falha ao gerar sugestões.');
    } finally {
      setIsImprovementsLoading(false);
    }
  };

  const generateReport = async (type: 'pdf' | 'excel') => {
    try {
      if (type === 'pdf') {
        const reportData = {
          title: 'Relatório de Intenção de Voto',
          description: 'Pesquisa eleitoral municipal 2024',
          generatedAt: new Date().toISOString(),
          candidates: voteIntentionData.map(item => ({
            name: item.name,
            percentage: item.votes,
            votes: Math.round(item.votes * 10) // Mock calculation
          })),
          totalResponses: 1000,
          marginOfError: 3.1
        };
        
        const blob = ReportGenerator.generateVoteIntentionPDF(reportData);
        ReportGenerator.downloadBlob(blob, `relatorio-intencao-voto-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const data = voteIntentionData.map(item => ({
          Candidato: item.name,
          Percentual: `${item.votes}%`,
          'Data Geração': new Date().toLocaleDateString('pt-BR')
        }));
        
        const blob = ReportGenerator.generateExcelReport(data, 'relatorio-intencao-voto');
        ReportGenerator.downloadBlob(blob, `relatorio-intencao-voto-${new Date().toISOString().split('T')[0]}.xlsx`);
      }
      
      toast({
        title: "Relatório gerado",
        description: `Relatório em ${type.toUpperCase()} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Dashboard Administrativo</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => generateReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button asChild>
            <Link href="/admin/surveys/create">Criar Pesquisa</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className={`h-3 w-3 mr-1 ${kpi.change.startsWith('-') ? 'text-destructive rotate-180' : 'text-accent'}`} />
                {kpi.change} desde ontem
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Intenção de Voto</CardTitle>
            <CardDescription>Percentual de intenção de voto por candidato.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={voteIntentionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis unit="%" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="votes" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avaliação de Gestão</CardTitle>
             <CardDescription>Aprovação e rejeição da gestão atual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={approvalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {approvalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Progresso Semanal</CardTitle>
            <CardDescription>Entrevistas realizadas vs. meta diária.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Realizado" />
                <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Meta"/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Mapa e Alertas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Monitoramento Geográfico
            </CardTitle>
            <CardDescription>Localização dos entrevistadores e alertas em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <OfflineMap
              center={[-23.5505, -46.6333]}
              zoom={12}
              markers={mapMarkers}
              showCurrentLocation={false}
              className="h-80 rounded-none"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recentes
            </CardTitle>
            <CardDescription>Problemas e notificações importantes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsData.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  alert.type === 'error' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Análise Inteligente</CardTitle>
              <CardDescription>Gere resumos e sugestões com base nos dados atuais.</CardDescription>
            </div>
            <div className="flex gap-2">
            <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || isImprovementsLoading} variant="outline" size="icon">
                      {isSummaryLoading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gerar Resumo Executivo</p>
                  </TooltipContent>
                </UITooltip>
                 <UITooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSuggestImprovements} disabled={isSummaryLoading || isImprovementsLoading} variant="outline" size="icon">
                       {isImprovementsLoading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sugerir Melhorias</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        {(isSummaryLoading || isImprovementsLoading || executiveSummary || suggestedImprovements) && (
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Resumo Executivo</h3>
            {isSummaryLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4"/>Analisando dados e gerando resumo...</p>}
            {executiveSummary && <Textarea readOnly value={executiveSummary} className="h-32 bg-muted text-sm" />}
          </div>
          <div>
             <h3 className="font-semibold mb-2">Sugestões de Melhoria</h3>
            {isImprovementsLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4"/>Analisando dados e gerando sugestões...</p>}
            {suggestedImprovements && <Textarea readOnly value={suggestedImprovements} className="h-32 bg-muted text-sm" />}
          </div>
        </CardContent>
        )}
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Entrevistadores</CardTitle>
          <CardDescription>Análise detalhada do desempenho da equipe de campo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Entrevistas</TableHead>
                <TableHead>Tempo Médio</TableHead>
                <TableHead>Validação GPS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviewersData.map((interviewer) => (
                <TableRow key={interviewer.name}>
                  <TableCell className="font-medium">{interviewer.name}</TableCell>
                  <TableCell>
                    <Badge variant={interviewer.status === 'online' ? 'secondary' : 'outline'}>
                      {interviewer.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell>{interviewer.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {interviewer.interviews}
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </TableCell>
                  <TableCell>{interviewer.avgTime}</TableCell>
                  <TableCell>
                    <Badge variant={parseInt(interviewer.validation) >= 95 ? 'secondary' : 'destructive'}>
                      {interviewer.validation}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
