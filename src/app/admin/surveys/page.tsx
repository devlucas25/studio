
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const surveys = [
  {
    name: 'Eleições 2024 - Intenção de Voto',
    status: 'active',
    progress: 75,
    city: 'São Paulo',
    deadline: '2024-10-20',
  },
  {
    name: 'Avaliação de Gestão Municipal',
    status: 'active',
    progress: 40,
    city: 'São Paulo',
    deadline: '2024-10-25',
  },
    {
    name: 'Pesquisa de Opinião - Transporte Público',
    status: 'draft',
    progress: 0,
    city: 'Rio de Janeiro',
    deadline: '2024-11-01',
  },
  {
    name: 'Eleições 2022 - Análise de Resultados',
    status: 'completed',
    progress: 100,
    city: 'Belo Horizonte',
    deadline: '2022-10-30',
  },
];

export default function SurveysPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Pesquisas</h1>
        <Button asChild>
          <Link href="/admin/surveys/create">
            <PlusCircle />
            Criar Nova Pesquisa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pesquisas</CardTitle>
          <CardDescription>Visualize e gerencie todas as suas pesquisas ativas, rascunhos e concluídas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Nome da Pesquisa</TableHead>
                <TableHead className="w-[200px]">Progresso</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Prazo Final</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.name}>
                  <TableCell>
                    <Badge variant={
                      survey.status === 'active' ? 'default' : 
                      survey.status === 'completed' ? 'secondary' : 'outline'
                    }
                    className={survey.status === 'active' ? 'bg-accent hover:bg-accent/80' : ''}
                    >
                      {survey.status === 'active' && 'Ativa'}
                      {survey.status === 'draft' && 'Rascunho'}
                      {survey.status === 'completed' && 'Concluída'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{survey.name}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <Progress value={survey.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">{survey.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{survey.city}</TableCell>
                  <TableCell>{new Date(survey.deadline).toLocaleDateString()}</TableCell>
                   <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Visualizar</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
