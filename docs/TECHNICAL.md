# Documentação Técnica - London Pesquisas

## Arquitetura do Sistema

### Stack Tecnológico

#### Frontend
- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca de interface com hooks modernos
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Framework CSS utilitário
- **Radix UI**: Componentes acessíveis e customizáveis

#### Backend & Infraestrutura
- **Supabase**: Backend-as-a-Service
  - PostgreSQL com Row Level Security
  - Autenticação integrada
  - Storage para arquivos
  - Edge Functions para lógica serverless
- **Vercel**: Plataforma de deploy com CI/CD

#### PWA & Offline
- **Service Workers**: Cache e funcionalidade offline
- **IndexedDB**: Armazenamento local estruturado
- **LocalForage**: Abstração para storage local
- **Background Sync**: Sincronização em background

#### Mapas & Geolocalização
- **Leaflet**: Biblioteca de mapas interativos
- **OpenStreetMap**: Tiles de mapa gratuitos
- **Geolocation API**: Acesso à localização do dispositivo

#### Relatórios & Análise
- **jsPDF**: Geração de PDFs
- **XLSX**: Manipulação de planilhas Excel
- **Recharts**: Gráficos e visualizações
- **Google Gemini AI**: Análise inteligente de dados

## Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── admin/             # Páginas administrativas
│   ├── interviewer/       # Páginas do entrevistador
│   ├── login/             # Autenticação
│   └── api/               # API routes
├── components/            # Componentes reutilizáveis
│   └── ui/               # Componentes base (shadcn/ui)
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   ├── offline-storage.ts # Sistema offline
│   └── report-generator.ts # Geração de relatórios
├── types/                # Definições TypeScript
└── middleware.ts         # Middleware de autenticação
```

## Sistema de Autenticação

### Fluxo de Autenticação
1. Login via Supabase Auth
2. Verificação de perfil (entrevistador/administrador)
3. Redirecionamento baseado no perfil
4. Middleware protege rotas sensíveis

### Perfis de Usuário
```typescript
type UserRole = 'interviewer' | 'administrator';

interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
```

## Sistema Offline

### Estratégia de Cache
- **Static Assets**: Cache indefinido para recursos estáticos
- **API Responses**: Cache com TTL de 5 minutos
- **Images**: Cache por 30 dias
- **Maps**: Cache de tiles por região

### Armazenamento Local
```typescript
// Estrutura de dados offline
interface OfflineInterview {
  id: string;
  survey_id: string;
  interviewer_id: string;
  answers: InterviewAnswer[];
  location: GPSLocation;
  status: 'draft' | 'completed';
  created_at: string;
  is_offline: boolean;
}
```

### Sincronização
1. **Detecção de Conectividade**: Event listeners para online/offline
2. **Queue de Sincronização**: Fila de dados pendentes
3. **Retry Logic**: Tentativas automáticas com backoff exponencial
4. **Conflict Resolution**: Timestamp-based para resolução de conflitos

## Validação GPS

### Precisão Requerida
- **Excelente**: ≤ 5 metros
- **Boa**: ≤ 10 metros
- **Aceitável**: ≤ 20 metros
- **Ruim**: > 20 metros

### Validação de Área
```typescript
function validateLocationInArea(
  lat: number,
  lng: number,
  areaCenter: [number, number],
  radiusKm: number
): boolean {
  // Cálculo de distância usando fórmula de Haversine
  const distance = calculateDistance(lat, lng, areaCenter[0], areaCenter[1]);
  return distance <= radiusKm;
}
```

## Sistema de Relatórios

### Templates Disponíveis
1. **Intenção de Voto**: Análise eleitoral completa
2. **Avaliação de Gestão**: Aprovação/rejeição
3. **Comparativo**: Entre períodos ou regiões
4. **Progresso**: Acompanhamento da coleta

### Geração de PDF
```typescript
class ReportGenerator {
  static generateVoteIntentionPDF(data: VoteIntentionReport): Blob {
    const doc = new jsPDF();
    // Header com branding London Pesquisas
    this.addHeader(doc, data.title);
    // Conteúdo estruturado
    this.addContent(doc, data);
    // Footer com metadados
    this.addFooter(doc, 1);
    return doc.output('blob');
  }
}
```

## Banco de Dados

### Schema Principal
```sql
-- Perfis de usuário
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('interviewer', 'administrator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entrevistadores
CREATE TABLE interviewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Pesquisas
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id)
);

-- Entrevistas
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES surveys(id),
  interviewer_id UUID REFERENCES interviewers(id),
  respondent_name TEXT,
  respondent_age INTEGER,
  respondent_gender TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  answers JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  is_offline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Entrevistadores só veem seus próprios dados
CREATE POLICY "Interviewers own data" ON interviews
  FOR ALL USING (
    interviewer_id IN (
      SELECT id FROM interviewers 
      WHERE user_id = auth.uid()
    )
  );

-- Administradores veem tudo
CREATE POLICY "Administrators see all" ON interviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'administrator'
    )
  );
```

## Performance

### Otimizações Implementadas
- **Code Splitting**: Carregamento sob demanda
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Análise de tamanho do bundle
- **Lazy Loading**: Componentes carregados quando necessário
- **Memoization**: React.memo e useMemo para componentes pesados

### Métricas de Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Segurança

### Medidas Implementadas
1. **Autenticação**: Supabase Auth com JWT
2. **Autorização**: RLS no banco de dados
3. **Criptografia**: Dados sensíveis criptografados localmente
4. **HTTPS**: Comunicação segura obrigatória
5. **CSP**: Content Security Policy configurada
6. **Input Validation**: Validação client e server-side

### Auditoria
- Logs de ações sensíveis
- Rastreamento de mudanças
- Monitoramento de tentativas de acesso
- Alertas para atividades suspeitas

## Monitoramento

### Métricas Coletadas
- **Uptime**: Disponibilidade do sistema
- **Response Time**: Tempo de resposta das APIs
- **Error Rate**: Taxa de erros
- **User Activity**: Atividade dos usuários
- **Offline Usage**: Uso offline do sistema

### Alertas Configurados
- Sistema fora do ar
- Alta taxa de erros
- Performance degradada
- Falhas de sincronização
- Tentativas de acesso não autorizado

## Deploy e CI/CD

### Pipeline de Deploy
1. **Commit**: Push para repositório Git
2. **Lint & Test**: Verificações automáticas
3. **Build**: Compilação da aplicação
4. **Security Scan**: Verificação de vulnerabilidades
5. **Deploy**: Deploy automático no Vercel
6. **Smoke Tests**: Testes básicos pós-deploy

### Ambientes
- **Development**: Local com hot reload
- **Staging**: Preview deployments (PRs)
- **Production**: Branch main

### Rollback Strategy
- Deploy atômico com rollback instantâneo
- Blue-green deployment
- Feature flags para funcionalidades experimentais

## Troubleshooting

### Problemas Comuns

#### GPS não funciona
- Verificar permissões do navegador
- Confirmar HTTPS (obrigatório para geolocation)
- Testar em ambiente externo (GPS indoor é limitado)

#### Sincronização falha
- Verificar conectividade
- Limpar cache do service worker
- Verificar logs no console do navegador

#### PWA não instala
- Confirmar HTTPS
- Verificar manifest.json
- Testar em navegador compatível

### Logs e Debug
```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'london-pesquisas:*');

// Verificar status do service worker
navigator.serviceWorker.getRegistrations().then(console.log);

// Verificar dados offline
import { getAllOfflineInterviews } from '@/lib/offline-storage';
getAllOfflineInterviews().then(console.log);
```

## Roadmap Técnico

### Próximas Versões
- [ ] Notificações push nativas
- [ ] Modo escuro automático
- [ ] Exportação para Word
- [ ] Integração com WhatsApp Business
- [ ] Dashboard mobile nativo
- [ ] Análise preditiva com ML
- [ ] Integração com TSE (Tribunal Superior Eleitoral)

### Melhorias de Performance
- [ ] Server-side rendering (SSR)
- [ ] Edge caching
- [ ] Database connection pooling
- [ ] CDN para assets estáticos
- [ ] Compressão de imagens WebP/AVIF

---

**Última atualização**: Janeiro 2024  
**Versão do sistema**: 2.0  
**Responsável técnico**: Equipe London Pesquisas