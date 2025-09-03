
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCandidatePage() {

  return (
    <div className="flex flex-col gap-6">
        <Link href="/admin/candidates" className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'>
            <ArrowLeft/>
            Voltar
        </Link>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Adicionar Novo Candidato</h1>
      </div>

        <Card className="mt-4">
            <CardHeader>
                <CardTitle>
                    Informações do Candidato
                </CardTitle>
                 <CardDescription>
                    Preencha os dados básicos do candidato.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Candidato</Label>
                    <Input id="name" placeholder="Ex: João da Silva" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                    <Label htmlFor="party">Partido</Label>
                    <Input id="party" placeholder="Ex: Partido Progressista" />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="Ex: São Paulo" />
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <Button>Salvar Candidato</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
