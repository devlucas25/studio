
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Flag, PauseCircle, Save, MapPin, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import Link from 'next/link';
import { saveInterviewOffline, validateLocationInArea } from '@/lib/offline-storage';
import { Interview, InterviewAnswer } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// Mock data, to be replaced with data from Supabase
const electoralSurvey = {
  title: 'Pesquisa Eleitoral 2024 - Prefeitura',
  questions: [
    { id: 'q1', text: 'Em quem você votaria para prefeito hoje?', type: 'multiple_choice', options: ['Candidato A', 'Candidato B', 'Candidato C', 'Branco/Nulo', 'Não sabe'], required: true },
    { id: 'q2', text: 'Qual é a sua avaliação do atual prefeito?', type: 'multiple_choice', options: ['Péssima', 'Ruim', 'Regular', 'Boa', 'Ótima'], required: true },
    { id: 'q3', text: 'Quais são os principais problemas do município?', type: 'multiple_choice', options: ['Saúde', 'Educação', 'Segurança', 'Transporte', 'Emprego'], required: false },
    { id: 'q4', text: 'Comentários adicionais (opcional)', type: 'open_text', required: false },
  ],
};

export default function SurveyPage({ params }: { params: { id: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'valid' | 'invalid' | 'error'>('checking');
  const [isStarted, setIsStarted] = useState(false);
  const [respondentInfo, setRespondentInfo] = useState({ name: '', age: '', gender: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Survey area (São Paulo Centro)
  const surveyArea: [number, number] = [-23.5505, -46.6333];
  const surveyRadius = 2; // 2km radius

  const currentQuestion = electoralSurvey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / electoralSurvey.questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < electoralSurvey.questions.length - 1) {
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
    // Auto-save draft
    saveDraft();
  };
  
  const isLastQuestion = currentQuestionIndex === electoralSurvey.questions.length - 1;

  // Get current location and validate
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude, accuracy };
        setLocation(newLocation);
        
        // Validate if location is within survey area
        const isValid = validateLocationInArea(latitude, longitude, surveyArea, surveyRadius);
        setLocationStatus(isValid ? 'valid' : 'invalid');
        
        if (isValid) {
          setIsStarted(true);
          toast({
            title: "Localização validada",
            description: "Você está na área correta para realizar a entrevista.",
          });
        } else {
          toast({
            title: "Localização fora da área",
            description: "Você precisa estar na área designada para iniciar a entrevista.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('error');
        toast({
          title: "Erro de localização",
          description: "Não foi possível obter sua localização. Verifique as permissões.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Save draft to offline storage
  const saveDraft = async () => {
    if (!location || !isStarted) return;
    
    try {
      const interview: Interview = {
        id: `draft_${Date.now()}`,
        survey_id: params.id,
        interviewer_id: 'current_user', // TODO: Get from auth
        respondent_name: respondentInfo.name,
        respondent_age: respondentInfo.age ? parseInt(respondentInfo.age) : undefined,
        respondent_gender: respondentInfo.gender,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
        answers: Object.entries(answers).map(([question_id, answer]) => ({
          question_id,
          answer
        })) as InterviewAnswer[],
        status: 'draft',
        is_offline: true,
        offline_synced: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await saveInterviewOffline(interview);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Complete interview
  const completeInterview = async () => {
    if (!location || !isStarted) return;
    
    setIsSaving(true);
    try {
      const interview: Interview = {
        id: `interview_${Date.now()}`,
        survey_id: params.id,
        interviewer_id: 'current_user', // TODO: Get from auth
        respondent_name: respondentInfo.name,
        respondent_age: respondentInfo.age ? parseInt(respondentInfo.age) : undefined,
        respondent_gender: respondentInfo.gender,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
        answers: Object.entries(answers).map(([question_id, answer]) => ({
          question_id,
          answer
        })) as InterviewAnswer[],
        status: 'completed',
        is_offline: true,
        offline_synced: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
      
      await saveInterviewOffline(interview);
      
      toast({
        title: "Entrevista concluída!",
        description: "Os dados foram salvos e serão sincronizados automaticamente.",
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        window.location.href = '/interviewer/dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a entrevista. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Show location validation screen first
  if (!isStarted) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40 p-4 justify-center items-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <MapPin className="h-6 w-6" />
              Validação de Localização
            </CardTitle>
            <CardDescription>
              Verificando se você está na área correta para realizar a entrevista
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              {locationStatus === 'checking' && (
                <div className="space-y-3">
                  <Navigation className="h-12 w-12 mx-auto animate-spin text-primary" />
                  <p>Obtendo localização...</p>
                </div>
              )}
              
              {locationStatus === 'valid' && (
                <div className="space-y-3">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                  <p className="text-green-600 font-medium">Localização validada!</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Precisão: {location?.accuracy?.toFixed(0)}m
                  </Badge>
                </div>
              )}
              
              {locationStatus === 'invalid' && (
                <div className="space-y-3">
                  <AlertTriangle className="h-12 w-12 mx-auto text-orange-600" />
                  <p className="text-orange-600 font-medium">Fora da área designada</p>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Você precisa estar na área da pesquisa para continuar. Mova-se para a área correta e tente novamente.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {locationStatus === 'error' && (
                <div className="space-y-3">
                  <AlertTriangle className="h-12 w-12 mx-auto text-red-600" />
                  <p className="text-red-600 font-medium">Erro de localização</p>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Não foi possível obter sua localização. Verifique se o GPS está ativado e as permissões estão concedidas.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
            
            {/* Respondent info form */}
            {locationStatus === 'valid' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Informações do Entrevistado</h3>
                <Input
                  placeholder="Nome (opcional)"
                  value={respondentInfo.name}
                  onChange={(e) => setRespondentInfo({...respondentInfo, name: e.target.value})}
                />
                <Input
                  placeholder="Idade"
                  type="number"
                  value={respondentInfo.age}
                  onChange={(e) => setRespondentInfo({...respondentInfo, age: e.target.value})}
                />
                <RadioGroup
                  value={respondentInfo.gender}
                  onValueChange={(value) => setRespondentInfo({...respondentInfo, gender: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Masculino" id="masc" />
                    <Label htmlFor="masc">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Feminino" id="fem" />
                    <Label htmlFor="fem">Feminino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Outro" id="outro" />
                    <Label htmlFor="outro">Outro</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/interviewer/dashboard">Cancelar</Link>
            </Button>
            
            {locationStatus === 'valid' ? (
              <Button onClick={() => setIsStarted(true)}>
                Iniciar Entrevista
              </Button>
            ) : (
              <Button onClick={getCurrentLocation} disabled={locationStatus === 'checking'}>
                {locationStatus === 'checking' ? 'Verificando...' : 'Tentar Novamente'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 justify-center items-center">
        <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader>
                <Progress value={progress} className="mb-4" />
                <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                <CardDescription>
                  Pergunta {currentQuestionIndex + 1} de {electoralSurvey.questions.length}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </CardDescription>
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
                     <Button 
                        size="lg" 
                        className="bg-accent hover:bg-accent/90"
                        onClick={completeInterview}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                          <>
                            <Save className="animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Flag/>
                            Finalizar Pesquisa
                          </>
                        )}
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Próxima
                        <ChevronRight/>
                    </Button>
                )}
            </CardFooter>
            <CardFooter className="justify-between border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  GPS: {location?.accuracy?.toFixed(0)}m
                  <Badge variant={location && location.accuracy <= 10 ? "secondary" : "destructive"} className="text-xs">
                    {location && location.accuracy <= 10 ? 'Boa precisão' : 'Baixa precisão'}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={saveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Rascunho
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
