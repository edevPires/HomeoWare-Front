import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const perguntas = [
  "O que posso usar quando meu boi está com carrapatos?",
  "Existe algum tratamento natural para controlar vermes no gado?",
  "O que fazer quando o bezerro tem diarreia frequente?",
  "Como posso ajudar o gado a se recuperar de pneumonia?",
  "Qual tratamento é indicado para intoxicação alimentar em bovinos?",
  "Como posso controlar a sodomia no meu rebanho?",
  "Existe algum tratamento para aumentar a fertilidade das vacas?",
  "O que fazer para melhorar a qualidade do sêmen dos touros?",
  "Qual solução pode ajudar em casos de aborto recorrente no gado?",
  "Como tratar verrugas (papilomatose/figueiras) nos animais?",
  "O que posso usar para prevenir ou tratar mastite nas vacas de leite?",
  "Como reduzir o uso de antibióticos no rebanho sem prejudicar a produção?",
  "Existe alguma forma de aumentar a produção de leite de forma natural?",
  "Como posso melhorar o ganho de peso do gado de corte?",
  "O que ajuda a melhorar a qualidade da carne do meu rebanho?",
  "Como fortalecer a imunidade do gado de forma natural?",
  "Existe alguma forma de reduzir o estresse do gado durante o manejo?",
  "O que usar para prevenir doenças respiratórias no rebanho?",
  "Qual tratamento pode ajudar a controlar parasitas internos e externos ao mesmo tempo?",
  "Como evitar surtos de doenças sem usar produtos químicos fortes?"
];

// Função de resposta com IA do Gemini + fallback com contexto
async function responderPergunta(q: string, messages: Message[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('API Key encontrada:', apiKey ? 'SIM' : 'NÃO');
  console.log('Tentando usar IA para:', q);
  
  // Se não tem API key, usa sistema antigo
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('Usando fallback - API key não configurada');
    return responderPerguntaFallback(q);
  }

  try {
    // Construir contexto das últimas 6 mensagens (3 pares pergunta-resposta)
    const recentMessages = messages.slice(-6);
    let conversationContext = '';
    
    if (recentMessages.length > 0) {
      conversationContext = '\n\nContexto da conversa anterior:\n';
      recentMessages.forEach((msg, index) => {
        const role = msg.sender === 'user' ? 'Usuário' : 'Assistente';
        conversationContext += `${role}: ${msg.content}\n`;
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Você é um vendedor especializado em homeopatia veterinária para gado de corte e leite.
Seu papel é apresentar os produtos pelo nome e explicar de forma clara, confiável e acessível o que cada um faz, sem mencionar a marca que os fabrica. 
Seja bem direto nas respostas. A dosagem das homeopatias são de 5 a 3 gramas dependedo da gravidade do animal. 

Ao responder, siga estas regras:

Sempre explique para que serve o produto (ex.: controle de papilomatose, melhora da imunidade, tratamento de mastite, etc.).

Dê exemplos práticos de uso, como: "Esse produto pode ser usado misturado no sal mineral" ou "Indicado para animais que apresentam verrugas".

Use uma linguagem próxima ao produtor rural, simples e sem termos técnicos complexos.

Não cite o nome da marca, apenas o nome do produto e sua finalidade.

Caso o cliente peça comparação, destaque os benefícios práticos: melhora na saúde, menos perdas, redução de antibióticos, aumento da produtividade.

Exemplos de abordagem que você pode usar:

Produto Mastite → ajuda no tratamento e prevenção da mastite em vacas leiteiras.

Produto Papiloma → auxilia no controle de verrugas e figueiras em bovinos.

Produto Diarreia → indicado para bezerros com quadros de diarreia.

Produto Sodomia → reduz o hábito de montar em outros animais, evitando estresse no rebanho.

Produto Pulmonar → atua em problemas respiratórios como tosse e pneumonia.

Produto Imunidade → fortalece as defesas naturais do organismo.

Produto Antitóxico → indicado para casos de intoxicação alimentar ou por plantas.

Seu objetivo é orientar, informar e recomendar os produtos de acordo com a necessidade do cliente.

${conversationContext}

Nova pergunta: ${q}

Se a pergunta se refere ao contexto anterior (como "explique melhor", "me diga mais", "como assim?"), use o contexto para dar uma resposta mais detalhada sobre o tópico anterior.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Resposta inválida da API');
    }
  } catch (error) {
    console.error('Erro na API do Gemini, usando fallback:', error);
    return responderPerguntaFallback(q);
  }
}

// Sistema antigo como fallback
function responderPerguntaFallback(q: string): string {
  const texto = q.toLowerCase();

  // 1 carrapatos
  if (texto.includes('carrapato') || texto.includes('carrapatos')) {
    return 'Para controle de carrapatos, combine manejo do ambiente (rotação de pastagem, limpeza de instalações) com estratégias integradas. Opções naturais e abordagens menos agressivas podem ser consideradas com orientação técnica. Avalie também exames para descartar infestações mistas. Procure um(a) veterinário(a) para um plano seguro.';
  }
  // 2 vermes
  else if (texto.includes('verme') || texto.includes('vermes') || texto.includes('helminto')) {
    return 'Para verminoses, foque em calendário de controle estratégico, análise de OPG (ovos por grama) e manejo de pastagens. Há alternativas menos agressivas que podem ser usadas de forma preventiva, sempre com acompanhamento veterinário e atento ao período de descarte quando aplicável.';
  }
  // 3 diarreia bezerros
  else if (texto.includes('diarreia') || texto.includes('diarréia')) {
    return 'Em diarreia de bezerros, priorize hidratação, sombreamento e correção de manejo do colostro. Avalie causas (nutricional, infecciosa, parasitária). Abordagens de suporte podem ser consideradas, mas, em casos intensos, acione o(a) veterinário(a).';
  }
  // 4 prevenção respiratória (mais específica primeiro)
  else if ((texto.includes('prevenir') || texto.includes('preven')) && (texto.includes('respirat') || texto.includes('pneumonia'))) {
    return 'Previna problemas respiratórios com ventilação, cama seca, lotação adequada e vacinação quando indicada. Medidas de suporte podem ser usadas em períodos de maior risco.';
  }
  // 5 pneumonia / respiratório (geral)
  else if (texto.includes('pneumonia') || texto.includes('respirat')) {
    return 'Para suporte respiratório, reduza estresse térmico, evite superlotação e corrija poeira/umidade no curral. Estratégias de apoio podem auxiliar na recuperação, mas é fundamental avaliação clínica para afastar infecções bacterianas/virais.';
  }
  // 5 intoxicação
  else if (texto.includes('intoxica')) {
    return 'Em suspeita de intoxicação, isole o lote, forneça água limpa e interrompa o possível agente (planta, ração, aditivo). Suportes gerais podem ser úteis, porém intoxicações exigem atendimento veterinário imediato.';
  }
  // 6 sodomia
  else if (texto.includes('sodomia')) {
    return 'Para controle de sodomia, ajuste densidade, espaço de cocho e enriquecimento ambiental. Se persistir, estratégias de suporte comportamental podem ajudar. Consulte um(a) veterinário(a) para investigar causas nutricionais e hormonais.';
  }
  // 7 fertilidade vacas
  else if (texto.includes('fertilidad') || texto.includes('cio') || texto.includes('reprodu')) {
    return 'Para melhorar fertilidade, reforce escore corporal adequado, mineralização, manejo do cio e sanidade uterina. Medidas naturais de suporte podem ser usadas em conjunto com boas práticas reprodutivas.';
  }
  // 8 sêmen touros
  else if (texto.includes('sêmen') || texto.includes('semen') || texto.includes('touro')) {
    return 'Para qualidade de sêmen, foque em nutrição equilibrada, controle térmico e exames andrológicos. Suportes gerais podem contribuir, mas exames periódicos são indispensáveis.';
  }
  // 9 aborto recorrente
  else if (texto.includes('aborto')) {
    return 'Aborto recorrente demanda investigação de causas infecciosas, nutricionais e de manejo. Suporte geral pode atuar como coadjuvante, mas colete material para diagnóstico e consulte o(a) veterinário(a).';
  }
  // 10 papilomatose / verruga
  else if (texto.includes('papiloma') || texto.includes('verruga') || texto.includes('figueira')) {
    return 'Para verrugas (papilomatose), mantenha manejo higiênico, evite ferimentos por contenção e avalie medidas de suporte imunológico. Muitos casos são autolimitados, mas a orientação técnica ajuda a prevenir recidivas.';
  }
  // 11 mastite
  else if (texto.includes('mastite')) {
    return 'No controle da mastite, aplique rotina de pré e pós-dipping, secagem correta e manutenção do equipamento de ordenha. Abordagens de suporte podem auxiliar na imunidade, mas casos clínicos requerem avaliação veterinária.';
  }
  // 12 reduzir antibiótico
  else if (texto.includes('antib') || texto.includes('antimicrob')) {
    return 'Para reduzir antibióticos, invista em biossegurança, vacinação, manejo de estresse e diagnóstico precoce. Medidas de suporte e prevenção bem conduzidas diminuem a necessidade de terapias agressivas.';
  }
  // 13 aumentar leite
  else if (texto.includes('produção de leite') || texto.includes('producao de leite') || (texto.includes('leite') && texto.includes('aument'))) {
    return 'Para elevar produção de leite, garanta dieta balanceada, conforto térmico, água de qualidade e ordenha consistente. Coadjuvantes naturais podem auxiliar, mas o principal é o manejo e a nutrição.';
  }
  // 14 ganho de peso
  else if (texto.includes('ganho de peso') || texto.includes('engorda') || (texto.includes('peso') && texto.includes('aument'))) {
    return 'Para ganho de peso no corte, ajuste plano nutricional (energia/proteína), oferta de pasto e bem-estar. Estratégias complementares podem ajudar, porém o impacto maior vem da nutrição e manejo.';
  }
  // 15 qualidade da carne
  else if (texto.includes('qualidade da carne') || (texto.includes('carne') && texto.includes('qualidade'))) {
    return 'Melhore a qualidade da carne com genética, manejo de estresse (pré-abate), dieta adequada e sanidade. Suportes gerais podem contribuir via bem-estar e imunidade.';
  }
  // 16 imunidade
  else if (texto.includes('imunid') || texto.includes('defesa')) {
    return 'Para fortalecer imunidade: mineralização correta, sombra, água limpa, vacinação em dia e redução de estresse. Abordagens naturais de suporte podem ser incorporadas ao manejo.';
  }
  // 17 estresse
  else if (texto.includes('estresse') || texto.includes('stress')) {
    return 'Reduza estresse com manejo calmo, lotação adequada, sombreamento, piso antiderrapante e transporte humanitário. Suportes comportamentais podem ajudar em lotes mais reativos.';
  }
  // 19 parasitas internos/externos ao mesmo tempo
  else if (texto.includes('parasita') && (texto.includes('interno') || texto.includes('externo'))) {
    return 'Para parasitas internos e externos, adote manejo integrado: rotação de pastos, análise de fezes, higiene de instalações e barreiras físicas. Há alternativas de suporte que podem ser combinadas ao plano sanitário.';
  }
  // 20 prevenção sem químicos fortes
  else if ((texto.includes('evitar') || texto.includes('prevenir') || texto.includes('preven')) && (texto.includes('químic') || texto.includes('quimic') || texto.includes('forte'))) {
    return 'Para prevenção com menor uso de químicos, fortaleça biossegurança, nutrição, vacinação, bem-estar e higiene. Suportes naturais podem ser considerados com acompanhamento técnico.';
  }

  // fallback
  return 'Posso ajudar com manejo, prevenção e estratégias de suporte sem citar marcas. Poderia detalhar o problema (idade do animal, sintomas, tempo de evolução, lote afetado)?';
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: 'Olá! Faça uma pergunta sobre manejo e saúde do gado. Por exemplo: "O que posso usar quando meu boi está com carrapatos?"',
      sender: 'bot',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const question = inputValue.trim();
    if (!question) return;

    const userMessage: Message = {
      content: question,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await responderPergunta(question, messages);
        const botMessage: Message = {
          content: response,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Erro ao obter resposta:', error);
        const errorMessage: Message = {
          content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 800);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="fixed bottom-4 right-2 md:right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-[500px] md:w-96 md:h-[600px] bg-light rounded-lg shadow-2xl border border-light-border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-light-border bg-primary text-dark rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dark/20 flex items-center justify-center text-sm font-bold">
                B
              </div>
              <div>
                <h3 className="font-medium text-sm">Chatbot Pecuária</h3>
                <p className="text-xs opacity-80">Assistente HomeoWare</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-dark/20 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Questions - Compact */}
          <div className="p-2 border-b border-light-border bg-input/50">
            <p className="text-xs text-font/70 mb-1">Perguntas rápidas:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {perguntas.slice(0, 4).map((pergunta, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(pergunta)}
                  className="text-xs bg-input hover:bg-input-border px-2 py-1 rounded text-font/90 hover:text-font transition-colors text-left"
                  title={pergunta}
                >
                  {pergunta.length > (window.innerWidth < 768 ? 35 : 20) ? `${pergunta.substring(0, window.innerWidth < 768 ? 35 : 20)}...` : pergunta}
                </button>
              ))}
            </div>
          </div>

          {/* Messages - Larger area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-dark/30">
            {messages.map((message) => (
              <div
                key={message.timestamp}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-dark'
                      : 'bg-input text-font border border-light-border'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-input border border-light-border rounded-2xl px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-light-border bg-light">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 rounded-lg border border-input-border bg-input text-font px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-font/50"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="rounded-lg bg-primary text-dark p-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-font/60 mt-2">
              Este chatbot oferece conteúdo informativo geral e não substitui orientação veterinária.
            </p>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-primary text-dark hover:bg-primary/90 hover:scale-110"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
}