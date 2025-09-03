# London Pesquisas - Sistema Eleitoral

Sistema profissional de coleta e análise de dados eleitorais com operação offline completa, desenvolvido especificamente para a London Pesquisas.

## 🚀 Funcionalidades Principais

### Para Entrevistadores
- **Operação 100% Offline**: Funciona sem internet com sincronização automática
- **Validação GPS Rigorosa**: Localização obrigatória para garantir qualidade dos dados
- **Interface Otimizada para Campo**: Botões grandes, alto contraste, uso sob luz solar
- **Salvamento Automático**: Dados salvos localmente com criptografia
- **Mapas Offline**: Visualização das áreas de pesquisa sem internet
- **PWA Nativo**: Instalável como aplicativo no celular

### Para Administradores
- **Dashboard Completo**: Métricas em tempo real e visualizações geográficas
- **Relatórios Profissionais**: PDF e Excel prontos para apresentação
- **Monitoramento GPS**: Acompanhamento da equipe em tempo real
- **Análise com IA**: Resumos executivos e sugestões automáticas
- **Alertas Inteligentes**: Notificações para problemas na coleta
- **Gestão de Equipe**: Controle completo dos entrevistadores

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **PWA**: Service Workers, Cache API, Background Sync
- **Mapas**: Leaflet (OpenStreetMap)
- **Relatórios**: jsPDF, XLSX
- **IA**: Google Gemini AI
- **Deploy**: Vercel com CI/CD

## 📱 PWA (Progressive Web App)

O sistema funciona como um aplicativo nativo quando instalado:

- Instalação direta do navegador
- Funciona offline completamente
- Notificações push
- Ícone na tela inicial
- Experiência de app nativo

## 🗺️ Funcionalidades Offline

### Armazenamento Local
- IndexedDB para dados estruturados
- Cache de mapas e recursos
- Criptografia de dados sensíveis
- Sincronização automática quando online

### Validação GPS
- Precisão mínima configurável
- Validação de área geográfica
- Justificativa para localizações fora da área
- Histórico de localizações

## 📊 Sistema de Relatórios

### Tipos de Relatório
1. **Intenção de Voto**: Percentuais por candidato com análise demográfica
2. **Avaliação de Gestão**: Aprovação/rejeição segmentada
3. **Comparativo**: Entre períodos ou regiões
4. **Progresso**: Acompanhamento da coleta

### Formatos Disponíveis
- **PDF**: Relatórios profissionais com gráficos
- **Excel**: Dados estruturados para análise
- **Word**: Documentos editáveis

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS)
- Criptografia de dados sensíveis
- Validação de permissões por perfil
- Auditoria de ações

## 🚀 Deploy e CI/CD

### Ambientes
- **Desenvolvimento**: Local com hot reload
- **Staging**: Preview deployments no Vercel
- **Produção**: Deploy automático na main branch

### Pipeline CI/CD
- Linting e type checking
- Build e testes automatizados
- Deploy automático no Vercel
- Verificações de segurança

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no Vercel (para deploy)

### Configuração Local

1. **Clone o repositório**
```bash
git clone https://github.com/london-pesquisas/sistema-eleitoral.git
cd sistema-eleitoral
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
GEMINI_API_KEY=sua-chave-do-gemini
```

4. **Execute as migrações do banco**
```bash
# No Supabase SQL Editor, execute:
# supabase/migrations/001_initial_electoral_schema.sql
# supabase/migrations/002_seed_data.sql
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse http://localhost:3000

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- `user_roles`: Perfis de usuário (entrevistador/administrador)
- `interviewers`: Dados dos entrevistadores
- `surveys`: Templates de pesquisas
- `interviews`: Entrevistas realizadas
- `reports`: Relatórios gerados
- `messages`: Sistema de mensagens

### Políticas RLS
- Entrevistadores: acesso apenas aos próprios dados
- Administradores: acesso completo
- Dados sensíveis criptografados

## 📱 Uso do Sistema

### Como Entrevistador
1. Acesse o sistema pelo navegador ou app instalado
2. Faça login com suas credenciais
3. Visualize suas pesquisas atribuídas no dashboard
4. Clique em "Iniciar Pesquisa" para uma entrevista
5. Permita acesso à localização (obrigatório)
6. Aguarde validação GPS da área
7. Preencha dados do entrevistado
8. Responda as perguntas uma por vez
9. Finalize e sincronize automaticamente

### Como Administrador
1. Acesse o dashboard administrativo
2. Monitore progresso em tempo real
3. Visualize mapas com localização da equipe
4. Crie novas pesquisas e atribua entrevistadores
5. Gere relatórios profissionais
6. Analise dados com IA integrada
7. Gerencie alertas e notificações

## 🔧 Configurações Avançadas

### PWA
- Configuração em `next.config.ts`
- Service Worker em `public/sw.js`
- Manifest em `public/manifest.json`

### Mapas Offline
- Cache automático de tiles do OpenStreetMap
- Marcadores customizados por status
- Geolocalização com alta precisão

### Sincronização
- Background sync quando online
- Resolução de conflitos automática
- Retry automático para falhas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da London Pesquisas. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@londonpesquisas.com.br
- Telefone: (11) 9999-9999
- Website: https://londonpesquisas.com.br

---

**London Pesquisas** - Sistema Profissional de Pesquisas Eleitorais
Versão 2.0 - 2024