
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileDown, BrainCircuit, FileText, BarChart3, PieChart, TrendingUp, Download, Share2, Calendar } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import { generateExecutiveSummary } from '@/ai/flows/generate-executive-summary';
import { ReportGenerator } from '@/lib/report-generator';
import { useToast } from '@/hooks/use-toast';

const voteIntentionData = [
  { name: "Candidato A", value: 45, color: '#1e40af' },
  { name: "Candidato B", value: 32, color: '#3b82f6' },
  { name: "Candidato C", value: 15, color: '#60a5fa' },
  { name: "Branco/Nulo", value: 8, color: '#9ca3af' },
];

const approvalData = [
    { name: 'Aprova', value: 65, color: '#10b981' },
    { name: 'Rejeita', value: 35, color: '#ef4444' },
];

const demographicData = [
  { age: '18-25', candidateA: 35, candidateB: 40, candidateC: 25 },
  { age: '26-35', candidateA: 45, candidateB: 30, candidateC: 25 },
  { age: '36-50', candidateA: 50, candidateB: 28, candidateC: 22 },
  { age: '51+', candidateA: 48, candidateB: 35, candidateC: 17 },
];

const progressData = [
  { week: 'Sem 1', completed: 120, target: 100 },
  { week: 'Sem 2', completed: 180, target: 150 },
  { week: 'Sem 3', completed: 240, target: 200 },
  { week: 'Sem 4', completed: 320, target: 300 },
];

const reportTemplates = [
  {
    id: 'vote_intention',
    title: 'Relatório de Intenção de Voto',
    description: 'Análise completa da intenção de voto com segmentação demográfica',
    icon: BarChart3,
    color: 'bg-blue-500'
  },
  {
    id: 'management_approval',
    title: 'Relatório de Avaliação de Gestão',
    description: 'Aprovação e rejeição da gestão atual com análise por região',
    icon: PieChart,
    color: 'bg-green-500'
  },
  {
    id: 'comparative',
    title: 'Relatório Comparativo',
    description: 'Comparação entre diferentes períodos ou regiões',
    icon: TrendingUp,
    color: 'bg-purple-500'
  },
  {
    id: 'progress',
    title: 'Relatório de Progresso',
    description: 'Acompanhamento do progresso da coleta de dados',
    icon: Calendar,
    color: 'bg-orange-500'
  }
];


export default function ReportsPage() {
    const [selectedTemplate, setSelectedTemplate] = useState('vote_intention');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [reportTitle, setReportTitle] = useState('Pesquisa Eleitoral Municipal 2024');
    const [reportDescription, setReportDescription] = useState('Análise da intenção de voto para prefeito');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const { toast } = useToast();

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        try {
            const reportData = JSON.stringify(selectedTemplate === 'vote_intention' ? voteIntentionData : approvalData);
            const result = await generateExecutiveSummary({ pollingData: reportData });
            setAnalysis(result.summary);
        } catch(error) {
            console.error(error);
            setAnalysis('Falha ao gerar análise.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateReport = async (format: 'pdf' | 'excel' | 'word') => {
        setIsGeneratingReport(true);
        try {
            if (format === 'pdf') {
                if (selectedTemplate === 'vote_intention') {
                    const reportData = {
                        title: reportTitle,
                        description: reportDescription,
                        generatedAt: new Date().toISOString(),
                        candidates: voteIntentionData.map(item => ({
                            name: item.name,
                            percentage: item.value,
                            votes: Math.round(item.value * 15) // Mock calculation
                        })),
                        totalResponses: 1500,
                        marginOfError: 2.8
                    };
                    
                    const blob = ReportGenerator.generateVoteIntentionPDF(reportData);
                    ReportGenerator.downloadBlob(blob, `${reportTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                } else {
                    const reportData = {
                        title: reportTitle,
                        description: reportDescription,
                        generatedAt: new Date().toISOString(),
                        approval: {
                            approve: approvalData[0].value,
                            disapprove: approvalData[1].value,
                            neutral: 0
                        },
                        demographics: {
                            byAge: {
                                '18-35': { approval: 58 },
                                '36-50': { approval: 62 },
                                '51+': { approval: 70 }
                            },
                            byGender: {
                                'Masculino': { approval: 63 },
                                'Feminino': { approval: 67 }
                            },
                            byLocation: {
                                'Centro': { approval: 65 },
                                'Zona Sul': { approval: 68 },
                                'Zona Norte': { approval: 62 }
                            }
                        }
                    };
                    
                    const blob = ReportGenerator.generateManagementApprovalPDF(reportData);
                    ReportGenerator.downloadBlob(blob, `${reportTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                }
            } else if (format === 'excel') {
                const data = selectedTemplate === 'vote_intention' 
                    ? voteIntentionData.map(item => ({
                        Candidato: item.name,
                        'Percentual (%)': item.value,
                        'Votos Estimados': Math.round(item.value * 15),
                        'Data': new Date().toLocaleDateString('pt-BR')
                    }))
                    : approvalData.map(item => ({
                        'Avaliação': item.name,
                        'Percentual (%)': item.value,
                        'Data': new Date().toLocaleDateString('pt-BR')
                    }));
                
                const blob = ReportGenerator.generateExcelReport(data, reportTitle);
                ReportGenerator.downloadBlob(blob, `${reportTitle.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
            }
            
            toast({
                title: "Relatório gerado com sucesso!",
                description: `Relatório em ${format.toUpperCase()} foi baixado.`,
            });
        } catch (error) {
            console.error('Error generating report:', error);
            toast({
                title: "Erro ao gerar relatório",
                description: "Não foi possível gerar o relatório. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const shareReport = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: reportTitle,
                    text: reportDescription,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copiado!",
                description: "O link do relatório foi copiado para a área de transferência.",
            });
        }
    };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-semibold">Relatórios Profissionais</h1>
          <p className="text-muted-foreground">Gere relatórios prontos para apresentação a prefeitos e stakeholders</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={shareReport}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
            </Button>
            <Button variant="outline" onClick={() => generateReport('excel')} disabled={isGeneratingReport}>
                <Download className="h-4 w-4 mr-2" />
                Excel
            </Button>
            <Button onClick={() => generateReport('pdf')} disabled={isGeneratingReport}>
                {isGeneratingReport ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                {isGeneratingReport ? 'Gerando...' : 'PDF'}
            </Button>
        </div>
      </div>
      
      {/* Templates de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Editor de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Editor de Relatório</CardTitle>
          <CardDescription>
            Personalize seu relatório e visualize os dados antes de gerar o documento final.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Configurações */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Relatório</Label>
                <Input
                  id="title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="mt-1 h-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Informações do Relatório</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrevistas:</span>
                    <span>1.500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margem de erro:</span>
                    <span>±2.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confiança:</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>
              
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Análise IA</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="animate-spin h-4 w-4"/>
                      <span>Analisando...</span>
                    </div>
                  ) : analysis ? (
                    <Textarea readOnly value={analysis} className="h-32 bg-background text-xs"/>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Gere uma análise automática dos dados.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-3">
                  <Button onClick={handleGenerateAnalysis} disabled={isLoading} size="sm" className="w-full">
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    {isLoading ? 'Gerando...' : 'Analisar'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Visualizações */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="main" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="main">Principal</TabsTrigger>
                  <TabsTrigger value="demographic">Demografia</TabsTrigger>
                  <TabsTrigger value="progress">Progresso</TabsTrigger>
                  <TabsTrigger value="preview">Prévia</TabsTrigger>
                </TabsList>
                
                <TabsContent value="main" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {selectedTemplate === 'vote_intention' ? (
                          <><BarChart3 className="h-5 w-5" />Intenção de Voto</>
                        ) : (
                          <><PieChart className="h-5 w-5" />Avaliação de Gestão</>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTemplate === 'vote_intention' ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={voteIntentionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis unit="%" tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {voteIntentionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={approvalData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {approvalData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="demographic" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise Demográfica</CardTitle>
                      <CardDescription>Intenção de voto por faixa etária</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={demographicData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="age" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="candidateA" fill="#1e40af" name="Candidato A" />
                          <Bar dataKey="candidateB" fill="#3b82f6" name="Candidato B" />
                          <Bar dataKey="candidateC" fill="#60a5fa" name="Candidato C" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="progress" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Progresso da Coleta</CardTitle>
                      <CardDescription>Entrevistas realizadas vs. meta semanal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Realizado" />
                          <Line type="monotone" dataKey="target" stroke="#6b7280" strokeDasharray="5 5" name="Meta" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prévia do Relatório</CardTitle>
                      <CardDescription>Como o relatório aparecerá no documento final</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="bg-primary text-primary-foreground p-3 rounded-t-lg">
                          <h2 className="font-bold text-lg">LONDON PESQUISAS</h2>
                          <p className="text-sm opacity-90">Sistema Profissional de Pesquisas Eleitorais</p>
                        </div>
                        <div className="bg-background p-4 rounded-b-lg border">
                          <h3 className="font-bold text-lg mb-2">{reportTitle}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{reportDescription}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Data de geração:</strong><br />
                              {new Date().toLocaleDateString('pt-BR')}
                            </div>
                            <div>
                              <strong>Total de entrevistas:</strong><br />
                              1.500 respondentes
                            </div>
                            <div>
                              <strong>Margem de erro:</strong><br />
                              ±2.8% (95% confiança)
                            </div>
                            <div>
                              <strong>Metodologia:</strong><br />
                              Entrevistas presenciais com GPS
                            </div>
                          </div>
                          
                          {analysis && (
                            <div className="mt-4 p-3 bg-muted/50 rounded">
                              <strong className="text-sm">Resumo Executivo:</strong>
                              <p className="text-xs mt-1 text-muted-foreground">{analysis.substring(0, 200)}...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
