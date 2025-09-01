
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


export default function CreateSurveyPage() {
  const [activeTab, setActiveTab] = useState('step1');
  const [date, setDate] = useState<Date>()

  const handleNext = () => {
    const currentStep = parseInt(activeTab.replace('step', ''));
    if (currentStep < 4) {
      setActiveTab(`step${currentStep + 1}`);
    }
  };

  const handlePrevious = () => {
    const currentStep = parseInt(activeTab.replace('step', ''));
    if (currentStep > 1) {
      setActiveTab(`step${currentStep - 1}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Criar Nova Pesquisa</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="step1">1. Definição</TabsTrigger>
          <TabsTrigger value="step2">2. Questionário</TabsTrigger>
          <TabsTrigger value="step3">3. Entrevistadores</TabsTrigger>
          <TabsTrigger value="step4">4. Finalização</TabsTrigger>
        </TabsList>
        
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>
                    {activeTab === 'step1' && 'Definição da Pesquisa'}
                    {activeTab === 'step2' && 'Editor de Questionário'}
                    {activeTab === 'step3' && 'Atribuição de Equipe'}
                    {activeTab === 'step4' && 'Prazos e Regras'}
                </CardTitle>
                 <CardDescription>
                    {activeTab === 'step1' && 'Informações básicas para identificar a pesquisa.'}
                    {activeTab === 'step2' && 'Crie as perguntas que os entrevistadores farão em campo.'}
                    {activeTab === 'step3' && 'Selecione os entrevistadores que participarão desta coleta.'}
                    {activeTab === 'step4' && 'Defina o prazo final e as regras de validação da pesquisa.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TabsContent value="step1" className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título da Pesquisa</Label>
                    <Input id="title" placeholder="Ex: Eleições 2024 - Segundo Turno" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="grid gap-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" placeholder="Ex: São Paulo" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="sample-size">Amostragem (Nº de Entrevistas)</Label>
                        <Input id="sample-size" type="number" placeholder="Ex: 1200" />
                    </div>
                  </div>
                   <div className="grid gap-2">
                        <Label htmlFor="neighborhoods">Bairros/Áreas de Atuação</Label>
                        <Textarea id="neighborhoods" placeholder="Liste os bairros ou regiões, um por linha." />
                    </div>
                </TabsContent>

                <TabsContent value="step2" className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                        <Label>Pergunta 1: Gênero</Label>
                        <Input disabled value="Múltipla Escolha: Masculino, Feminino, Outro, Não responder" />
                    </div>
                    <div className="p-4 border rounded-lg space-y-4">
                        <Label>Pergunta 2: Faixa Etária</Label>
                        <Input disabled value="Múltipla Escolha: 16-24, 25-34, 35-44, 45-59, 60+" />
                    </div>
                     <div className="p-4 border-2 border-dashed rounded-lg flex items-center justify-center text-center min-h-[100px]">
                        <Button variant="outline">
                            <PlusCircle className="mr-2"/>
                            Adicionar Nova Pergunta
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="step3" className="space-y-4">
                   <div className="border rounded-md">
                        <div className="flex items-center p-4 border-b">
                           <Checkbox id="select-all"/>
                           <Label htmlFor="select-all" className="ml-3 font-medium">Selecionar Todos</Label>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                           {['João Silva', 'Maria Oliveira', 'Carlos Pereira', 'Ana Costa', 'Beatriz Lima', 'Ricardo Alves'].map(name => (
                               <div key={name} className="flex items-center p-4 border-b last:border-b-0">
                                   <Checkbox id={name} />
                                   <Label htmlFor={name} className="ml-3 w-full">{name}</Label>
                                   <span className="text-sm text-muted-foreground">São Paulo</span>
                               </div>
                           ))}
                        </div>
                   </div>
                </TabsContent>

                <TabsContent value="step4" className="space-y-6">
                    <div className="grid gap-2 max-w-sm">
                        <Label>Prazo Final</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium">Regras de Validação</h3>
                         <div className="flex items-center space-x-2">
                           <Checkbox id="require-gps" defaultChecked/>
                           <Label htmlFor="require-gps">Exigir validação por GPS no início da entrevista</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox id="allow-offline" defaultChecked/>
                           <Label htmlFor="allow-offline">Permitir que a entrevista seja realizada offline</Label>
                        </div>
                    </div>
                </TabsContent>

                 <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handlePrevious} disabled={activeTab === 'step1'}>
                        Anterior
                    </Button>
                     {activeTab !== 'step4' ? (
                        <Button onClick={handleNext}>Próximo</Button>
                    ) : (
                        <Button>Salvar Pesquisa</Button>
                    )}
                </div>
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
