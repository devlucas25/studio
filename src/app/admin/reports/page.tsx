
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
import { Loader2, FileDown, BrainCircuit } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import { generateExecutiveSummary } from '@/ai/flows/generate-executive-summary';

const npsData = [
  { name: "Promotores", value: 65, color: 'hsl(var(--primary))' },
  { name: "Neutros", value: 25, color: 'hsl(var(--muted-foreground))' },
  { name: "Detratores", value: 10, color: 'hsl(var(--destructive))' },
];

const csatData = [
    { name: 'Satisfeitos', value: 80, color: 'hsl(var(--primary))' },
    { name: 'Insatisfeitos', value: 20, color: 'hsl(var(--destructive))' },
];


export default function ReportsPage() {
    const [reportType, setReportType] = useState('nps');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        try {
            const reportData = JSON.stringify(reportType === 'nps' ? npsData : csatData);
            const result = await generateExecutiveSummary({ pollingData: reportData });
            setAnalysis(result.summary);
        } catch(error) {
            console.error(error);
            setAnalysis('Falha ao gerar análise.');
        } finally {
            setIsLoading(false);
        }
    }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Relatórios de Satisfação do Cliente</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <FileDown/>
                Exportar PDF
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Construtor de Relatório</CardTitle>
          <CardDescription>
            Selecione o tipo de relatório para visualizar os dados e gerar análises.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-4">
                <Select onValueChange={setReportType} defaultValue={reportType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Tipo de Relatório" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nps">Net Promoter Score (NPS)</SelectItem>
                        <SelectItem value="csat">Customer Satisfaction (CSAT)</SelectItem>
                    </SelectContent>
                </Select>
                
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Análise Automática</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin h-4 w-4"/>
                                <span>Analisando dados...</span>
                            </div>
                        ) : analysis ? (
                            <Textarea readOnly value={analysis} className="h-40 bg-background"/>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Clique no botão abaixo para gerar uma análise textual dos dados exibidos no gráfico.
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleGenerateAnalysis} disabled={isLoading} className="w-full">
                            <BrainCircuit/>
                            {isLoading ? 'Gerando...' : 'Gerar Análise'}
                        </Button>
                    </CardFooter>
                </Card>

            </div>
            <div className="lg:col-span-2">
                <Card className="min-h-[450px]">
                     <CardHeader>
                        <CardTitle>
                            {reportType === 'nps' ? 'Gráfico de NPS' : 'Gráfico de CSAT'}
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        {reportType === 'nps' && (
                             <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={npsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis unit="%" tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} >
                                        {npsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        {reportType === 'csat' && (
                             <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                    data={csatData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                    {csatData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                     </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
