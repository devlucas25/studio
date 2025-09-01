
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, Activity, ArrowUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";

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
    { name: 'Aprova', value: 65, color: 'hsl(var(--accent))' },
    { name: 'Rejeita', value: 35, color: 'hsl(var(--destructive))' },
];

const interviewersData = [
  { name: "João Silva", interviews: 125, avgTime: "12 min", validation: "98%" },
  { name: "Maria Oliveira", interviews: 110, avgTime: "14 min", validation: "95%" },
  { name: "Carlos Pereira", interviews: 98, avgTime: "11 min", validation: "99%" },
  { name: "Ana Costa", interviews: 95, avgTime: "15 min", validation: "92%" },
];


export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/surveys/create">Criar Pesquisa</Link>
        </Button>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Intenção de Voto</CardTitle>
            <CardDescription>Percentual de intenção de voto por candidato.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={voteIntentionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Avaliação de Gestão</CardTitle>
             <CardDescription>Aprovação e rejeição da gestão atual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={approvalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
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
      </div>

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
                <TableHead>Entrevistas</TableHead>
                <TableHead>Tempo Médio</TableHead>
                <TableHead>Validação GPS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviewersData.map((interviewer) => (
                <TableRow key={interviewer.name}>
                  <TableCell className="font-medium">{interviewer.name}</TableCell>
                  <TableCell>{interviewer.interviews}</TableCell>
                  <TableCell>{interviewer.avgTime}</TableCell>
                  <TableCell className={interviewer.validation.replace('%','') < '95' ? 'text-destructive' : 'text-accent'}>{interviewer.validation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
