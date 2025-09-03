import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getAllSurveys } from '@/lib/supabase/queries';
import { SurveyStatus } from '@/types/database';

function getStatusVariant(status?: SurveyStatus) {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'outline';
    case 'pending':
    default:
      return 'secondary';
  }
}

function getStatusText(status?: SurveyStatus) {
  switch (status) {
    case 'active':
      return 'Em Andamento';
    case 'completed':
      return 'Concluída';
    case 'pending':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
}

export default async function SurveysPage() {
  const surveys = await getAllSurveys();

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
              {surveys && surveys.length > 0 ? (
                surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">{survey.title}</TableCell>
                    <TableCell>{survey.city || 'N/A'}</TableCell>
                    <TableCell>{survey.progress || '0/0'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(survey.status)}>
                        {getStatusText(survey.status)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma pesquisa encontrada. 
                    <Link href="/admin/surveys/create" className="text-primary underline ml-1">
                      Crie uma para começar.
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
