package com.taskflow.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import com.taskflow.backend.dto.ai.GerarTarefasRequestDTO;
import com.taskflow.backend.dto.ai.PlanoGerado;
import com.taskflow.backend.dto.ai.PrazoGerado;
import com.taskflow.backend.dto.ai.PrazoSugeridoDTO;
import com.taskflow.backend.dto.ai.SugerirPrazoRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.ProjetoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;
    private final TarefaService tarefaService;
    private final UsuarioRepository usuarioRepository;

    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public AiService(HttpClient httpClient,
                      ObjectMapper objectMapper,
                      ProjetoRepository projetoRepository,
                      TarefaRepository tarefaRepository,
                      TarefaService tarefaService,
                      UsuarioRepository usuarioRepository,
                      @Value("${gemini.api-key}") String apiKey,
                      @Value("${gemini.model}") String model,
                      @Value("${gemini.base-url}") String baseUrl) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
        this.tarefaService = tarefaService;
        this.usuarioRepository = usuarioRepository;
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

        String contexto = montarContextoAtual();
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

        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado"));

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

    public PrazoSugeridoDTO sugerirPrazo(SugerirPrazoRequestDTO dto) {
        garantirChaveConfigurada();

        Usuario responsavel = usuarioRepository.findById(dto.getResponsavelId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

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

    private JsonNode enviar(String systemInstruction, String input, ObjectNode responseFormat) {
        ObjectNode corpo = objectMapper.createObjectNode();
        corpo.put("model", model);
        corpo.put("system_instruction", systemInstruction);
        corpo.put("input", input);
        if (responseFormat != null) {
            corpo.set("response_format", responseFormat);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl))
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(corpo)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                log.warn("Gemini retornou status {}: {}", response.statusCode(), response.body());
                throw new ValidacaoException("Erro ao chamar o assistente de IA (Gemini): " + response.statusCode());
            }

            return objectMapper.readTree(response.body());
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ValidacaoException("Não foi possível se comunicar com o assistente de IA.");
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

    private ObjectNode campoTexto(String descricao) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "string");
        node.put("description", descricao);
        return node;
    }

    private String montarContextoAtual() {
        List<Projeto> projetos = projetoRepository.findAll();
        List<Tarefa> tarefas = tarefaRepository.findAll();
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
