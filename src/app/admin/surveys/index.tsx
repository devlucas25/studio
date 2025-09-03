
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const surveys = [
  {
    title: 'Eleições Municipais 2024 - 1º Turno',
    city: 'São Paulo',
    progress: '75/100',
    status: 'active',
  },
  {
    title: 'Avaliação de Gestão - Bairros da Zona Sul',
    city: 'Rio de Janeiro',
    progress: '100/100',
    status: 'completed',
  },
  {
    title: 'Pesquisa de Intenção de Voto - Curitiba',
    city: 'Curitiba',
    progress: '20/100',
    status: 'active',
  },
   {
    title: 'Pesquisa Eleitoral - Belo Horizonte',
    city: 'Belo Horizonte',
    progress: '0/100',
    status: 'pending',
  },
];

export default function SurveysPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Pesquisas</h1>
        <Button asChild>
          <Link href="/admin/surveys/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Pesquisa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pesquisas</CardTitle>
          <CardDescription>Visualize e gerencie todas as suas pesquisas ativas e concluídas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título da Pesquisa</TableHead>
                <TableHead>Cidade/Bairro</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.title}>
                  <TableCell className="font-medium">{survey.title}</TableCell>
                  <TableCell>{survey.city}</TableCell>
                  <TableCell>{survey.progress}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={
                            survey.status === 'active' ? 'default' 
                            : survey.status === 'completed' ? 'outline'
                            : 'secondary'
                        }
                    >
                      {survey.status === 'active' ? 'Em Andamento' : survey.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Monitorar</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Relatório</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Arquivar</DropdownMenuItem>
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
