"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { createSurvey } from '@/lib/supabase/actions';
import { useFormStatus } from 'react-dom';


interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number';
  options?: string[];
  required: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4 mr-2" />
      {pending ? 'Salvando...' : 'Salvar Pesquisa'}
    </Button>
  );
}


export default function CreateSurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'single_choice',
      options: [''],
      required: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, '']
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };
  
  const handleFormAction = async (formData: FormData) => {
    const title = formData.get('title') as string;

     if (!title.trim()) {
      toast({
        title: "Erro de Validação",
        description: "O título da pesquisa é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (questions.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "A pesquisa deve ter pelo menos uma pergunta.",
        variant: "destructive"
      });
      return;
    }
    
    formData.append('questions', JSON.stringify(questions.map(({id, ...rest}) => rest)));

    try {
      await createSurvey(formData);
      toast({
        title: "Sucesso!",
        description: "Pesquisa criada e salva no banco de dados.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar a pesquisa. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  }


  return (
    <form action={handleFormAction} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Criar Nova Pesquisa</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/surveys">Cancelar</Link>
          </Button>
          <SubmitButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Pesquisa</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Pesquisa Eleitoral Municipal 2024"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descrição da pesquisa..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Perguntas</CardTitle>
            <Button type="button" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Pergunta {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label>Texto da Pergunta</Label>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                  placeholder="Digite a pergunta..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Pergunta</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value: any) => updateQuestion(question.id, { type: value, options: value.includes('choice') ? [''] : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_choice">Escolha Única</SelectItem>
                      <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                      <SelectItem value="text">Texto Livre</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked) => 
                      updateQuestion(question.id, { required: !!checked })
                    }
                  />
                  <Label htmlFor={`required-${question.id}`}>Obrigatória</Label>
                </div>
              </div>

              {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Opções de Resposta</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Opção
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Opção ${optionIndex + 1}`}
                        />
                        {question.options!.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(question.id, optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma pergunta adicionada ainda.</p>
              <p>Clique em "Adicionar Pergunta" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
