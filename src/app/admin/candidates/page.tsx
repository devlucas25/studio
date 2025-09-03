
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const candidates = [
  {
    name: 'Candidato 1',
    party: 'Partido A',
    city: 'São Paulo',
    status: 'active',
  },
  {
    name: 'Candidato 2',
    party: 'Partido B',
    city: 'Rio de Janeiro',
    status: 'active',
  },
  {
    name: 'Candidato 3',
    party: 'Partido C',
    city: 'Belo Horizonte',
    status: 'inactive',
  },
];

export default function CandidatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Candidatos</h1>
        <Button asChild>
          <Link href="/admin/candidates/create">
            <PlusCircle />
            Adicionar Novo Candidato
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Candidatos</CardTitle>
          <CardDescription>Visualize e gerencie todos os seus candidatos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Candidato</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.name}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.party}</TableCell>
                  <TableCell>{candidate.city}</TableCell>
                  <TableCell>
                    <Badge variant={candidate.status === 'active' ? 'default' : 'outline'}>
                      {candidate.status === 'active' ? 'Ativo' : 'Inativo'}
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
                        <DropdownMenuItem>Visualizar</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}\
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
