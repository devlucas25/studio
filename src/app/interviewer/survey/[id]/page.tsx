
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Flag, PauseCircle, Save } from 'lucide-react';
import Link from 'next/link';

// Mock data, to be replaced with data from Supabase
const feedbackSurvey = {
  title: 'Pesquisa de Satisfação - Pós-venda',
  questions: [
    { id: 'q1', text: 'No geral, qual o seu nível de satisfação com o nosso produto/serviço?', type: 'multiple_choice', options: ['Muito Satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito', 'Muito Insatisfeito'] },
    { id: 'q2', text: 'Qual a probabilidade de você recomendar nosso produto/serviço a um amigo ou colega?', type: 'multiple_choice', options: ['0 - Nada Provável', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10 - Muito Provável'] },
    { id: 'q3', text: 'Quais aspectos do nosso produto/serviço você considera mais satisfatórios?', type: 'open_text' },
    { id: 'q4', text: 'Quais aspectos você acha que poderíamos melhorar?', type: 'open_text' },
    { id: 'q5', text: 'Você gostaria de deixar algum comentário adicional?', type: 'open_text' },
  ],
};

export default function SurveyPage({ params }: { params: { id: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = feedbackSurvey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / feedbackSurvey.questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < feedbackSurvey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };
  
  const isLastQuestion = currentQuestionIndex === feedbackSurvey.questions.length - 1;

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 justify-center items-center">
        <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader>
                <Progress value={progress} className="mb-4" />
                <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                <CardDescription>Pergunta {currentQuestionIndex + 1} de {feedbackSurvey.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[250px] flex items-center">
                {currentQuestion.type === 'multiple_choice' && (
                    <RadioGroup 
                        className="space-y-4" 
                        value={answers[currentQuestion.id]}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                    {currentQuestion.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                            <RadioGroupItem value={option} id={option} className="h-6 w-6"/>
                            <Label htmlFor={option} className="text-lg">{option}</Label>
                        </div>
                    ))}
                    </RadioGroup>
                )}
                {currentQuestion.type === 'open_text' && (
                     <Textarea 
                        placeholder="Digite a resposta aqui..." 
                        className="h-40 text-lg"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    <ChevronLeft/>
                    Anterior
                </Button>
                {isLastQuestion ? (
                     <Button size="lg" className="bg-accent hover:bg-accent/90">
                        <Flag/>
                        Finalizar Pesquisa
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Próxima
                        <ChevronRight/>
                    </Button>
                )}
            </CardFooter>
            <CardFooter className="justify-center border-t pt-4">
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/interviewer/dashboard"><PauseCircle/>Pausar e Sair</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
