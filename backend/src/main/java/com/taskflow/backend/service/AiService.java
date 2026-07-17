package com.taskflow.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import com.taskflow.backend.dto.ai.AnaliseRiscoGerada;
import com.taskflow.backend.dto.ai.AnaliseRiscoResponseDTO;
import com.taskflow.backend.dto.ai.DocumentoGerado;
import com.taskflow.backend.dto.ai.GerarDocumentoRequestDTO;
import com.taskflow.backend.dto.ai.GerarPlanoBacklogRequestDTO;
import com.taskflow.backend.dto.ai.GerarTarefasRequestDTO;
import com.taskflow.backend.dto.ai.PlanoBacklogGerado;
import com.taskflow.backend.dto.ai.PlanoBacklogResponseDTO;
import com.taskflow.backend.dto.ai.PlanoGerado;
import com.taskflow.backend.dto.ai.PrazoGerado;
import com.taskflow.backend.dto.ai.PrazoSugeridoDTO;
import com.taskflow.backend.dto.ai.ResponsavelGerado;
import com.taskflow.backend.dto.ai.SugerirPrazoRequestDTO;
import com.taskflow.backend.dto.ai.SugerirResponsavelRequestDTO;
import com.taskflow.backend.dto.ai.SugestaoResponsavelDTO;
import com.taskflow.backend.dto.documento.DocumentoProjetoRequestDTO;
import com.taskflow.backend.dto.documento.DocumentoProjetoResponseDTO;
import com.taskflow.backend.dto.epico.EpicoRequestDTO;
import com.taskflow.backend.dto.epico.EpicoResponseDTO;
import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioRequestDTO;
import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioResponseDTO;
import com.taskflow.backend.dto.tarefa.TarefaRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.entity.HistoriaUsuario;
import com.taskflow.backend.entity.Historico;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Sprint;
import com.taskflow.backend.entity.StatusHistoria;
import com.taskflow.backend.entity.StatusSprint;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.HistoricoRepository;
import com.taskflow.backend.repository.HistoriaUsuarioRepository;
import com.taskflow.backend.repository.SprintRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ProjetoService projetoService;
    private final TarefaRepository tarefaRepository;
    private final TarefaService tarefaService;
    private final EpicoService epicoService;
    private final HistoriaUsuarioService historiaUsuarioService;
    private final DocumentoProjetoService documentoProjetoService;
    private final SprintRepository sprintRepository;
    private final HistoriaUsuarioRepository historiaUsuarioRepository;
    private final HistoricoRepository historicoRepository;
    private final NotificacaoService notificacaoService;
    private final UsuarioRepository usuarioRepository;
    private final AutenticacaoService autenticacaoService;

    private final String apiKey;
    private final String model;
    private final String baseUrl;

    private static final int LIMIAR_DIAS_PARADA = 5;

    public AiService(HttpClient httpClient,
                      ObjectMapper objectMapper,
                      ProjetoService projetoService,
                      TarefaRepository tarefaRepository,
                      TarefaService tarefaService,
                      EpicoService epicoService,
                      HistoriaUsuarioService historiaUsuarioService,
                      DocumentoProjetoService documentoProjetoService,
                      SprintRepository sprintRepository,
                      HistoriaUsuarioRepository historiaUsuarioRepository,
                      HistoricoRepository historicoRepository,
                      NotificacaoService notificacaoService,
                      UsuarioRepository usuarioRepository,
                      AutenticacaoService autenticacaoService,
                      @Value("${gemini.api-key}") String apiKey,
                      @Value("${gemini.model}") String model,
                      @Value("${gemini.base-url}") String baseUrl) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.projetoService = projetoService;
        this.tarefaRepository = tarefaRepository;
        this.tarefaService = tarefaService;
        this.epicoService = epicoService;
        this.historiaUsuarioService = historiaUsuarioService;
        this.documentoProjetoService = documentoProjetoService;
        this.sprintRepository = sprintRepository;
        this.historiaUsuarioRepository = historiaUsuarioRepository;
        this.historicoRepository = historicoRepository;
        this.notificacaoService = notificacaoService;
        this.usuarioRepository = usuarioRepository;
        this.autenticacaoService = autenticacaoService;
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    private void garantirChaveConfigurada() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ValidacaoException(
                    "O assistente de IA não está configurado. Defina a variável de ambiente GEMINI_API_KEY e reinicie o backend.");
        }
    }

    public String perguntar(String pergunta) {
        garantirChaveConfigurada();

        Usuario autor = autenticacaoService.usuarioAutenticado();
        String contexto = montarContextoAtual(autor);
        String sistema = """
                Você é o AI Project Manager do TaskFlow, um assistente que ajuda a equipe a \
                entender o andamento dos projetos. Responda SOMENTE com base nos dados fornecidos, \
                em português, de forma direta e objetiva. Se a pergunta não puder ser respondida \
                com esses dados, diga isso claramente.""";

        JsonNode resposta = enviar(sistema, contexto + "\n\nPergunta: " + pergunta, null);
        return extrairTexto(resposta);
    }

    public List<TarefaResponseDTO> gerarTarefas(Long projetoId, GerarTarefasRequestDTO dto) {
        garantirChaveConfigurada();

        Projeto projeto = projetoService.buscarPorId(projetoId);

        String sistema = """
                Você é um gerente de projetos de software sênior. Quebre a ideia descrita pelo \
                usuário em tarefas de desenvolvimento pequenas, claras e acionáveis, prontas para \
                entrar em um quadro Kanban. Gere entre 3 e 10 tarefas.""";
        String entrada = "Projeto: " + projeto.getNome() + "\n\nIdeia: " + dto.getDescricao();

        JsonNode resposta = enviar(sistema, entrada, construirEsquemaPlano());
        String textoJson = extrairTexto(resposta);

        PlanoGerado plano;
        try {
            plano = objectMapper.readValue(textoJson, PlanoGerado.class);
        } catch (RuntimeException e) {
            throw new ValidacaoException("A IA retornou uma resposta em um formato inesperado.");
        }

        if (plano.tarefas() == null || plano.tarefas().isEmpty()) {
            throw new ValidacaoException("A IA não retornou nenhuma tarefa.");
        }

        return plano.tarefas().stream()
                .map(tarefaGerada -> criarTarefaGerada(projetoId, dto.getResponsavelId(), tarefaGerada))
                .toList();
    }

    public PlanoBacklogResponseDTO gerarPlanoBacklog(Long projetoId, GerarPlanoBacklogRequestDTO dto) {
        garantirChaveConfigurada();

        Projeto projeto = projetoService.buscarPorId(projetoId);

        String sistema = """
                Você é um gerente de projetos de software sênior especialista em Scrum. A partir da \
                ideia descrita pelo usuário, planeje um pedaço de backlog pronto para uso: um épico, \
                de 2 a 6 histórias de usuário (no formato "Como um <papel>, quero <funcionalidade>, \
                para que <motivo>", com critérios de aceitação, prioridade BAIXA/MEDIA/ALTA e uma \
                estimativa em pontos de história de 1, 2, 3, 5, 8 ou 13), cada uma com 2 a 5 tarefas \
                técnicas pequenas e acionáveis, e uma lista de riscos ou pontos de atenção do plano.""";
        String entrada = "Projeto: " + projeto.getNome() + "\n\nIdeia: " + dto.getDescricao();

        JsonNode resposta = enviar(sistema, entrada, construirEsquemaPlanoBacklog());
        String textoJson = extrairTexto(resposta);

        PlanoBacklogGerado plano;
        try {
            plano = objectMapper.readValue(textoJson, PlanoBacklogGerado.class);
        } catch (RuntimeException e) {
            throw new ValidacaoException("A IA retornou uma resposta em um formato inesperado.");
        }

        if (plano.historias() == null || plano.historias().isEmpty()) {
            throw new ValidacaoException("A IA não retornou nenhuma história de usuário.");
        }

        EpicoRequestDTO epicoDto = new EpicoRequestDTO();
        epicoDto.setTitulo(plano.epico() != null ? plano.epico().titulo() : dto.getDescricao());
        epicoDto.setDescricao(plano.epico() != null ? plano.epico().descricao() : null);
        EpicoResponseDTO epicoCriado = epicoService.criar(projetoId, epicoDto);

        List<HistoriaUsuarioResponseDTO> historiasCriadas = new ArrayList<>();
        for (PlanoBacklogGerado.HistoriaGerada historiaGerada : plano.historias()) {
            HistoriaUsuarioRequestDTO historiaDto = new HistoriaUsuarioRequestDTO();
            historiaDto.setTitulo(historiaGerada.titulo());
            historiaDto.setDescricao(historiaGerada.descricao());
            historiaDto.setCriteriosAceitacao(historiaGerada.criteriosAceitacao());
            historiaDto.setPrioridade(historiaGerada.prioridade());
            historiaDto.setPontos(historiaGerada.pontos());
            historiaDto.setEpicoId(epicoCriado.getId());
            historiaDto.setSprintId(null);

            HistoriaUsuarioResponseDTO historiaCriada = historiaUsuarioService.criar(projetoId, historiaDto);
            historiasCriadas.add(historiaCriada);

            if (historiaGerada.tarefas() != null) {
                for (String tituloTarefa : historiaGerada.tarefas()) {
                    criarTarefaDaHistoria(projetoId, dto.getResponsavelId(), tituloTarefa, historiaGerada.prioridade(), historiaCriada.getId());
                }
            }
        }

        return new PlanoBacklogResponseDTO(epicoCriado, historiasCriadas, plano.riscos());
    }

    private void criarTarefaDaHistoria(Long projetoId, Long responsavelId, String titulo, String prioridade, Long historiaUsuarioId) {
        TarefaRequestDTO dto = new TarefaRequestDTO();
        dto.setTitulo(titulo);
        dto.setDescricao("");
        dto.setStatus(StatusTarefa.A_FAZER);
        dto.setPrioridade(prioridade);
        dto.setPrazo(null);
        dto.setTagIds(List.of());
        dto.setDependenciaIds(List.of());
        dto.setHistoriaUsuarioId(historiaUsuarioId);

        tarefaService.criar(dto, projetoId, responsavelId);
    }

    public DocumentoProjetoResponseDTO gerarDocumento(Long projetoId, GerarDocumentoRequestDTO dto) {
        garantirChaveConfigurada();

        Projeto projeto = projetoService.buscarPorId(projetoId);

        String sistema = """
                Você é um redator técnico sênior de software. Escreva um documento em Markdown \
                bem estruturado (use títulos com #, listas e blocos de código quando fizer \
                sentido) sobre o que foi pedido. Seja objetivo e use português. Não inclua nada \
                fora do conteúdo do documento em si.""";
        String entrada = "Projeto: " + projeto.getNome()
                + "\nCategoria do documento: " + dto.getCategoria()
                + "\nTítulo: " + dto.getTitulo()
                + (dto.getInstrucoes() != null && !dto.getInstrucoes().isBlank() ? "\n\nInstruções: " + dto.getInstrucoes() : "");

        JsonNode resposta = enviar(sistema, entrada, construirEsquemaDocumento());
        String textoJson = extrairTexto(resposta);

        DocumentoGerado gerado;
        try {
            gerado = objectMapper.readValue(textoJson, DocumentoGerado.class);
        } catch (RuntimeException e) {
            throw new ValidacaoException("A IA retornou uma resposta em um formato inesperado.");
        }

        DocumentoProjetoRequestDTO documentoDto = new DocumentoProjetoRequestDTO();
        documentoDto.setTitulo(dto.getTitulo());
        documentoDto.setCategoria(dto.getCategoria());
        documentoDto.setConteudo(gerado.conteudo());

        return documentoProjetoService.criar(projetoId, documentoDto);
    }

    private ObjectNode construirEsquemaDocumento() {
        ObjectNode propriedades = objectMapper.createObjectNode();
        propriedades.set("conteudo", campoTexto("O documento completo, em Markdown, em português"));

        ObjectNode esquema = objectMapper.createObjectNode();
        esquema.put("type", "object");
        esquema.set("properties", propriedades);
        esquema.set("required", objectMapper.createArrayNode().add("conteudo"));

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", esquema);
        return responseFormat;
    }

    public AnaliseRiscoResponseDTO analisarRiscos(Long projetoId) {
        garantirChaveConfigurada();

        Projeto projeto = projetoService.buscarPorId(projetoId);
        String contexto = montarContextoRiscos(projeto);

        String sistema = """
                Você é um assistente de gestão de projetos de software sênior. Com base SOMENTE nos \
                dados fornecidos sobre o estado atual do projeto, identifique riscos reais de atraso \
                ou problemas de andamento e gere no máximo 5 alertas curtos, objetivos e em português. \
                Informe o id da tarefa quando o alerta for sobre uma tarefa específica; omita o id \
                quando o risco for do projeto ou da sprint como um todo. Se não houver nenhum risco \
                real com base nos dados, retorne uma lista vazia — não invente problemas.""";

        JsonNode resposta = enviar(sistema, contexto, construirEsquemaAnaliseRiscos());
        String textoJson = extrairTexto(resposta);

        AnaliseRiscoGerada analise;
        try {
            analise = objectMapper.readValue(textoJson, AnaliseRiscoGerada.class);
        } catch (RuntimeException e) {
            throw new ValidacaoException("A IA retornou uma resposta em um formato inesperado.");
        }

        if (analise.alertas() == null || analise.alertas().isEmpty()) {
            return new AnaliseRiscoResponseDTO(0);
        }

        Map<Long, Tarefa> tarefasDoProjeto = tarefaRepository.findByProjetoId(projetoId).stream()
                .collect(Collectors.toMap(Tarefa::getId, t -> t));

        for (AnaliseRiscoGerada.AlertaRiscoGerado alerta : analise.alertas()) {
            Tarefa tarefa = alerta.tarefaId() != null ? tarefasDoProjeto.get(alerta.tarefaId()) : null;

            if (tarefa != null) {
                notificacaoService.criar(tarefa.getResponsavel(), alerta.mensagem(), tarefa);
            } else {
                for (Usuario membro : projeto.getMembros()) {
                    notificacaoService.criar(membro, alerta.mensagem(), null);
                }
            }
        }

        return new AnaliseRiscoResponseDTO(analise.alertas().size());
    }

    private String montarContextoRiscos(Projeto projeto) {
        List<Tarefa> tarefas = tarefaRepository.findByProjetoId(projeto.getId());
        LocalDate hoje = LocalDate.now();
        LocalDateTime agora = LocalDateTime.now();

        List<Tarefa> atrasadas = tarefas.stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO)
                .filter(t -> t.getPrazo() != null && t.getPrazo().isBefore(hoje))
                .toList();

        List<Tarefa> paradas = tarefas.stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO)
                .filter(t -> diasParada(t, agora) >= LIMIAR_DIAS_PARADA)
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("Projeto: ").append(projeto.getNome()).append("\n");
        sb.append("Data de hoje: ").append(hoje).append("\n\n");

        sb.append("Tarefas atrasadas (prazo já passou, não concluídas):\n");
        sb.append(atrasadas.isEmpty() ? "  (nenhuma)\n" : "");
        for (Tarefa t : atrasadas) {
            sb.append("  - [id ").append(t.getId()).append("] \"").append(t.getTitulo()).append("\"")
                    .append(" | responsável: ").append(t.getResponsavel().getNome())
                    .append(" | prazo: ").append(t.getPrazo())
                    .append("\n");
        }

        sb.append("\nTarefas paradas (sem nenhuma atualização há ").append(LIMIAR_DIAS_PARADA)
                .append(" dias ou mais, não concluídas):\n");
        sb.append(paradas.isEmpty() ? "  (nenhuma)\n" : "");
        for (Tarefa t : paradas) {
            sb.append("  - [id ").append(t.getId()).append("] \"").append(t.getTitulo()).append("\"")
                    .append(" | responsável: ").append(t.getResponsavel().getNome())
                    .append(" | parada há ").append(diasParada(t, agora)).append(" dia(s)")
                    .append("\n");
        }

        List<Sprint> sprintsAtivas = sprintRepository.findByProjetoIdAndStatus(projeto.getId(), StatusSprint.ATIVA);
        sb.append("\nSprint ativa:\n");
        if (sprintsAtivas.isEmpty()) {
            sb.append("  (nenhuma sprint ativa)\n");
        }
        for (Sprint sprint : sprintsAtivas) {
            List<HistoriaUsuario> historias = historiaUsuarioRepository.findBySprintId(sprint.getId());
            int totalPontos = historias.stream().mapToInt(h -> h.getPontos() != null ? h.getPontos() : 0).sum();
            int pontosRestantes = historias.stream()
                    .filter(h -> h.getStatus() != StatusHistoria.CONCLUIDA)
                    .mapToInt(h -> h.getPontos() != null ? h.getPontos() : 0)
                    .sum();
            long diasRestantes = sprint.getDataFim() != null ? ChronoUnit.DAYS.between(hoje, sprint.getDataFim()) : 0;
            sb.append("  - \"").append(sprint.getNome()).append("\" termina em ").append(diasRestantes).append(" dia(s)")
                    .append(" | ").append(pontosRestantes).append(" de ").append(totalPontos)
                    .append(" pontos ainda não concluídos\n");
        }

        return sb.toString();
    }

    private long diasParada(Tarefa tarefa, LocalDateTime agora) {
        List<Historico> historico = historicoRepository.findByTarefaIdOrderByDataAsc(tarefa.getId());
        if (historico.isEmpty()) {
            return 0;
        }
        LocalDateTime ultima = historico.get(historico.size() - 1).getData();
        return ChronoUnit.DAYS.between(ultima, agora);
    }

    private ObjectNode construirEsquemaAnaliseRiscos() {
        ObjectNode propriedadesAlerta = objectMapper.createObjectNode();
        propriedadesAlerta.set("tarefaId", campoNumero("Id da tarefa relacionada ao risco, se houver uma específica"));
        propriedadesAlerta.set("mensagem", campoTexto("Alerta curto e objetivo, em português, explicando o risco"));

        ObjectNode itemAlerta = objectMapper.createObjectNode();
        itemAlerta.put("type", "object");
        itemAlerta.set("properties", propriedadesAlerta);
        itemAlerta.set("required", objectMapper.createArrayNode().add("mensagem"));

        ObjectNode arrayAlertas = objectMapper.createObjectNode();
        arrayAlertas.put("type", "array");
        arrayAlertas.set("items", itemAlerta);

        ObjectNode propriedadesEsquema = objectMapper.createObjectNode();
        propriedadesEsquema.set("alertas", arrayAlertas);

        ObjectNode esquema = objectMapper.createObjectNode();
        esquema.put("type", "object");
        esquema.set("properties", propriedadesEsquema);
        esquema.set("required", objectMapper.createArrayNode().add("alertas"));

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", esquema);
        return responseFormat;
    }

    public PrazoSugeridoDTO sugerirPrazo(SugerirPrazoRequestDTO dto) {
        garantirChaveConfigurada();

        Usuario autor = autenticacaoService.usuarioAutenticado();

        Usuario responsavel = usuarioRepository.findById(dto.getResponsavelId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!responsavel.getEmpresa().getId().equals(autor.getEmpresa().getId())) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }

        LocalDate hoje = LocalDate.now();

        List<Tarefa> tarefasAbertas = tarefaRepository.findByResponsavelId(responsavel.getId()).stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO)
                .sorted(Comparator.comparing(Tarefa::getPrazo, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        StringBuilder contexto = new StringBuilder();
        contexto.append("Data de hoje: ").append(hoje).append("\n");
        contexto.append("Responsável: ").append(responsavel.getNome()).append("\n");
        contexto.append("Tarefas abertas do responsável (").append(tarefasAbertas.size()).append("):\n");
        for (Tarefa t : tarefasAbertas) {
            contexto.append("  - \"").append(t.getTitulo()).append("\"")
                    .append(" | prioridade: ").append(t.getPrioridade())
                    .append(t.getPrazo() != null ? " | prazo: " + t.getPrazo() : " | sem prazo definido")
                    .append("\n");
        }
        contexto.append("\nNova tarefa a agendar: \"").append(dto.getTitulo()).append("\"")
                .append(" | prioridade: ").append(dto.getPrioridade() != null ? dto.getPrioridade() : "MEDIA");

        String sistema = """
                Você é um assistente de planejamento de projetos. Sugira uma data de entrega \
                realista para a nova tarefa, considerando a carga de trabalho atual do responsável \
                (evite concentrar muitas tarefas no mesmo dia) e a prioridade informada. Tarefas de \
                prioridade ALTA devem ter prazos mais próximos. Nunca sugira uma data no passado. \
                Responda com a data (formato AAAA-MM-DD) e uma justificativa curta em português.""";

        JsonNode resposta = enviar(sistema, contexto.toString(), construirEsquemaPrazo());
        String textoJson = extrairTexto(resposta);

        PrazoGerado gerado;
        try {
            gerado = objectMapper.readValue(textoJson, PrazoGerado.class);
        } catch (RuntimeException e) {
            throw new ValidacaoException("A IA retornou uma resposta em um formato inesperado.");
        }

        LocalDate prazoSugerido;
        try {
            prazoSugerido = LocalDate.parse(gerado.prazo());
        } catch (DateTimeParseException e) {
            throw new ValidacaoException("A IA sugeriu uma data em um formato inesperado.");
        }

        return new PrazoSugeridoDTO(prazoSugerido, gerado.justificativa());
    }

    private ObjectNode construirEsquemaPrazo() {
        ObjectNode propriedades = objectMapper.createObjectNode();
        propriedades.set("prazo", campoTexto("Data sugerida no formato AAAA-MM-DD"));
        propriedades.set("justificativa", campoTexto("Justificativa curta e objetiva, em português"));

        ObjectNode esquema = objectMapper.createObjectNode();
        esquema.put("type", "object");
        esquema.set("properties", propriedades);
        esquema.set("required", objectMapper.createArrayNode().add("prazo").add("justificativa"));

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", esquema);
        return responseFormat;
    }

    public SugestaoResponsavelDTO sugerirResponsavel(Long projetoId, SugerirResponsavelRequestDTO dto) {
        garantirChaveConfigurada();

        Projeto projeto = projetoService.buscarPorId(projetoId);
        List<Usuario> membros = projeto.getMembros();

        if (membros.isEmpty()) {
            throw new ValidacaoException("Este projeto ainda não tem membros para sugerir um responsável.");
        }

        String contexto = montarContextoMembros(projeto, membros, dto);

        String sistema = """
                Você é um assistente de gestão de equipes de software. Com base no cargo, nas \
                habilidades, na disponibilidade e na quantidade de tarefas abertas de cada membro \
                do projeto, escolha quem é o mais adequado para a nova tarefa descrita. Priorize \
                quem tem habilidades relacionadas ao assunto da tarefa e está com disponibilidade \
                melhor (evite escolher alguém indisponível se houver outra opção viável). Responda \
                com o id do responsável escolhido e uma justificativa curta e objetiva em português.""";

        JsonNode resposta = enviar(sistema, contexto, construirEsquemaResponsavel());
        String textoJson = extrairTexto(resposta);

        ResponsavelGerado gerado;
        try {
            gerado = objectMapper.readValue(textoJson, ResponsavelGerado.class);
        } catch (RuntimeException e) {
            throw new ValidacaoException("A IA retornou uma resposta em um formato inesperado.");
        }

        Usuario escolhido = membros.stream()
                .filter(m -> m.getId().equals(gerado.responsavelId()))
                .findFirst()
                .orElseThrow(() -> new ValidacaoException("A IA sugeriu alguém que não é membro deste projeto."));

        return new SugestaoResponsavelDTO(escolhido.getId(), escolhido.getNome(), gerado.justificativa());
    }

    private String montarContextoMembros(Projeto projeto, List<Usuario> membros, SugerirResponsavelRequestDTO dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("Projeto: ").append(projeto.getNome()).append("\n\n");
        sb.append("Membros do projeto:\n");
        for (Usuario membro : membros) {
            long tarefasAbertas = tarefaRepository.findByResponsavelId(membro.getId()).stream()
                    .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO)
                    .count();

            sb.append("  - [id ").append(membro.getId()).append("] ").append(membro.getNome())
                    .append(" | cargo: ").append(membro.getCargo() != null ? membro.getCargo() : "não informado")
                    .append(" | habilidades: ").append(membro.getHabilidades().isEmpty() ? "não informadas" : String.join(", ", membro.getHabilidades()))
                    .append(" | disponibilidade: ").append(membro.getDisponibilidade())
                    .append(" | tarefas abertas no momento: ").append(tarefasAbertas)
                    .append("\n");
        }

        sb.append("\nNova tarefa: \"").append(dto.getTitulo()).append("\"");
        if (dto.getDescricao() != null && !dto.getDescricao().isBlank()) {
            sb.append("\nDescrição: ").append(dto.getDescricao());
        }

        return sb.toString();
    }

    private ObjectNode construirEsquemaResponsavel() {
        ObjectNode propriedades = objectMapper.createObjectNode();
        propriedades.set("responsavelId", campoNumero("Id do membro escolhido como responsável"));
        propriedades.set("justificativa", campoTexto("Justificativa curta e objetiva, em português"));

        ObjectNode esquema = objectMapper.createObjectNode();
        esquema.put("type", "object");
        esquema.set("properties", propriedades);
        esquema.set("required", objectMapper.createArrayNode().add("responsavelId").add("justificativa"));

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", esquema);
        return responseFormat;
    }

    private TarefaResponseDTO criarTarefaGerada(Long projetoId, Long responsavelId, PlanoGerado.TarefaGerada gerada) {
        TarefaRequestDTO dto = new TarefaRequestDTO();
        dto.setTitulo(gerada.titulo());
        dto.setDescricao(gerada.descricao());
        dto.setStatus(StatusTarefa.A_FAZER);
        dto.setPrioridade(gerada.prioridade());
        dto.setPrazo(null);
        dto.setTagIds(List.of());
        dto.setDependenciaIds(List.of());

        return tarefaService.criar(dto, projetoId, responsavelId);
    }

    private static final int MAX_TENTATIVAS_GEMINI = 3;

    private JsonNode enviar(String systemInstruction, String input, ObjectNode responseFormat) {
        ObjectNode corpo = objectMapper.createObjectNode();
        corpo.put("model", model);
        corpo.put("system_instruction", systemInstruction);
        corpo.put("input", input);
        if (responseFormat != null) {
            corpo.set("response_format", responseFormat);
        }

        for (int tentativa = 1; tentativa <= MAX_TENTATIVAS_GEMINI; tentativa++) {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(baseUrl))
                        .header("x-goog-api-key", apiKey)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(corpo)))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 300) {
                    log.warn("Gemini retornou status {} (tentativa {}/{}): {}",
                            response.statusCode(), tentativa, MAX_TENTATIVAS_GEMINI, response.body());

                    boolean transitorio = response.statusCode() == 429 || response.statusCode() >= 500;
                    if (transitorio && tentativa < MAX_TENTATIVAS_GEMINI) {
                        aguardarAntesDeTentarNovamente(tentativa);
                        continue;
                    }
                    throw new ValidacaoException("Erro ao chamar o assistente de IA (Gemini): " + response.statusCode());
                }

                return objectMapper.readTree(response.body());
            } catch (IOException e) {
                if (tentativa == MAX_TENTATIVAS_GEMINI) {
                    throw new ValidacaoException("Não foi possível se comunicar com o assistente de IA.");
                }
                aguardarAntesDeTentarNovamente(tentativa);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ValidacaoException("Não foi possível se comunicar com o assistente de IA.");
            }
        }

        throw new ValidacaoException("Não foi possível se comunicar com o assistente de IA.");
    }

    /**
     * Espera curta antes de tentar de novo (1s, depois 2s) — só pra picos passageiros de
     * demanda/latência do Gemini (status 429 ou 5xx). Não resolve cota diária esgotada.
     */
    private void aguardarAntesDeTentarNovamente(int tentativa) {
        try {
            Thread.sleep(1000L * tentativa);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String extrairTexto(JsonNode respostaJson) {
        JsonNode outputText = respostaJson.get("output_text");
        if (outputText != null && !outputText.isNull() && !outputText.asText().isBlank()) {
            return outputText.asText();
        }

        StringBuilder sb = new StringBuilder();
        for (JsonNode step : respostaJson.path("steps")) {
            if (!"model_output".equals(step.path("type").asText())) {
                continue;
            }
            for (JsonNode bloco : step.path("content")) {
                if ("text".equals(bloco.path("type").asText())) {
                    sb.append(bloco.path("text").asText());
                }
            }
        }

        if (sb.isEmpty()) {
            throw new ValidacaoException("Não foi possível interpretar a resposta do assistente de IA.");
        }

        return sb.toString();
    }

    private ObjectNode construirEsquemaPlano() {
        ObjectNode propriedadesTarefa = objectMapper.createObjectNode();
        propriedadesTarefa.set("titulo", campoTexto("Título curto e objetivo da tarefa"));
        propriedadesTarefa.set("descricao", campoTexto("Descrição detalhada do que precisa ser feito"));
        propriedadesTarefa.set("prioridade", campoTexto("Prioridade da tarefa: BAIXA, MEDIA ou ALTA"));

        ObjectNode itemTarefa = objectMapper.createObjectNode();
        itemTarefa.put("type", "object");
        itemTarefa.set("properties", propriedadesTarefa);
        itemTarefa.set("required", objectMapper.createArrayNode().add("titulo").add("descricao").add("prioridade"));

        ObjectNode arrayTarefas = objectMapper.createObjectNode();
        arrayTarefas.put("type", "array");
        arrayTarefas.set("items", itemTarefa);

        ObjectNode propriedadesEsquema = objectMapper.createObjectNode();
        propriedadesEsquema.set("tarefas", arrayTarefas);

        ObjectNode esquema = objectMapper.createObjectNode();
        esquema.put("type", "object");
        esquema.set("properties", propriedadesEsquema);
        esquema.set("required", objectMapper.createArrayNode().add("tarefas"));

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", esquema);
        return responseFormat;
    }

    private ObjectNode construirEsquemaPlanoBacklog() {
        ObjectNode propriedadesEpico = objectMapper.createObjectNode();
        propriedadesEpico.set("titulo", campoTexto("Título curto do épico"));
        propriedadesEpico.set("descricao", campoTexto("Descrição do épico"));
        ObjectNode itemEpico = objectMapper.createObjectNode();
        itemEpico.put("type", "object");
        itemEpico.set("properties", propriedadesEpico);
        itemEpico.set("required", objectMapper.createArrayNode().add("titulo").add("descricao"));

        ObjectNode arrayTarefas = objectMapper.createObjectNode();
        arrayTarefas.put("type", "array");
        arrayTarefas.set("items", campoTexto("Título curto e objetivo da tarefa técnica"));

        ObjectNode propriedadesHistoria = objectMapper.createObjectNode();
        propriedadesHistoria.set("titulo", campoTexto("Título curto da história de usuário"));
        propriedadesHistoria.set("descricao", campoTexto("Como um <papel>, quero <funcionalidade>, para que <motivo>"));
        propriedadesHistoria.set("criteriosAceitacao", campoTexto("Critérios de aceitação da história"));
        propriedadesHistoria.set("prioridade", campoTexto("Prioridade da história: BAIXA, MEDIA ou ALTA"));
        propriedadesHistoria.set("pontos", campoNumero("Estimativa em pontos de história: 1, 2, 3, 5, 8 ou 13"));
        propriedadesHistoria.set("tarefas", arrayTarefas);

        ObjectNode itemHistoria = objectMapper.createObjectNode();
        itemHistoria.put("type", "object");
        itemHistoria.set("properties", propriedadesHistoria);
        itemHistoria.set("required", objectMapper.createArrayNode()
                .add("titulo").add("descricao").add("criteriosAceitacao").add("prioridade").add("pontos").add("tarefas"));

        ObjectNode arrayHistorias = objectMapper.createObjectNode();
        arrayHistorias.put("type", "array");
        arrayHistorias.set("items", itemHistoria);

        ObjectNode arrayRiscos = objectMapper.createObjectNode();
        arrayRiscos.put("type", "array");
        arrayRiscos.set("items", campoTexto("Um risco ou ponto de atenção do plano, em português"));

        ObjectNode propriedadesEsquema = objectMapper.createObjectNode();
        propriedadesEsquema.set("epico", itemEpico);
        propriedadesEsquema.set("historias", arrayHistorias);
        propriedadesEsquema.set("riscos", arrayRiscos);

        ObjectNode esquema = objectMapper.createObjectNode();
        esquema.put("type", "object");
        esquema.set("properties", propriedadesEsquema);
        esquema.set("required", objectMapper.createArrayNode().add("epico").add("historias").add("riscos"));

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", esquema);
        return responseFormat;
    }

    private ObjectNode campoNumero(String descricao) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "integer");
        node.put("description", descricao);
        return node;
    }

    private ObjectNode campoTexto(String descricao) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "string");
        node.put("description", descricao);
        return node;
    }

    private String montarContextoAtual(Usuario autor) {
        List<Projeto> projetos = projetoService.listarProjetosAcessiveis(autor);
        List<Long> projetoIds = projetos.stream().map(Projeto::getId).toList();
        List<Tarefa> tarefas = tarefaRepository.findByProjetoIdIn(projetoIds);
        LocalDate hoje = LocalDate.now();

        StringBuilder sb = new StringBuilder();
        sb.append("=== Estado atual do TaskFlow ===\n");
        sb.append("Total de projetos: ").append(projetos.size()).append("\n");
        sb.append("Total de tarefas: ").append(tarefas.size()).append("\n\n");

        for (Projeto projeto : projetos) {
            List<Tarefa> tarefasDoProjeto = tarefas.stream()
                    .filter(t -> t.getProjeto().getId().equals(projeto.getId()))
                    .toList();

            sb.append("Projeto \"").append(projeto.getNome()).append("\" (id ").append(projeto.getId()).append("): ")
                    .append(tarefasDoProjeto.size()).append(" tarefa(s)\n");

            for (Tarefa tarefa : tarefasDoProjeto) {
                boolean atrasada = tarefa.getStatus() != StatusTarefa.CONCLUIDO
                        && tarefa.getPrazo() != null
                        && tarefa.getPrazo().isBefore(hoje);

                Usuario responsavel = tarefa.getResponsavel();
                sb.append("  - [").append(tarefa.getStatus()).append("] ")
                        .append(tarefa.getTitulo())
                        .append(" | responsável: ").append(responsavel != null ? responsavel.getNome() : "sem responsável")
                        .append(" | prioridade: ").append(tarefa.getPrioridade())
                        .append(tarefa.getPrazo() != null ? " | prazo: " + tarefa.getPrazo() : "")
                        .append(atrasada ? " | ATRASADA" : "")
                        .append("\n");
            }
        }

        return sb.toString();
    }
}
