package com.taskflow.backend.controller;

import com.taskflow.backend.dto.ai.AnaliseProgressoSprintDTO;
import com.taskflow.backend.dto.ai.AnaliseRiscoResponseDTO;
import com.taskflow.backend.dto.ai.GerarDocumentoRequestDTO;
import com.taskflow.backend.dto.ai.GerarPlanoBacklogRequestDTO;
import com.taskflow.backend.dto.ai.GerarTarefasRequestDTO;
import com.taskflow.backend.dto.ai.InterpretarTarefaRequestDTO;
import com.taskflow.backend.dto.ai.PerguntaRequestDTO;
import com.taskflow.backend.dto.ai.PlanoBacklogResponseDTO;
import com.taskflow.backend.dto.ai.PrazoSugeridoDTO;
import com.taskflow.backend.dto.ai.RespostaIaDTO;
import com.taskflow.backend.dto.ai.SugerirPrazoRequestDTO;
import com.taskflow.backend.dto.ai.SugerirResponsavelRequestDTO;
import com.taskflow.backend.dto.ai.SugestaoResponsavelDTO;
import com.taskflow.backend.dto.ai.TarefaInterpretadaDTO;
import com.taskflow.backend.dto.documento.DocumentoProjetoResponseDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/perguntar")
    public RespostaIaDTO perguntar(@RequestBody PerguntaRequestDTO dto) {
        return new RespostaIaDTO(aiService.perguntar(dto.getPergunta()));
    }

    @PostMapping("/projetos/{projetoId}/gerar-tarefas")
    public List<TarefaResponseDTO> gerarTarefas(
            @PathVariable Long projetoId,
            @RequestBody GerarTarefasRequestDTO dto) {
        return aiService.gerarTarefas(projetoId, dto);
    }

    @PostMapping("/sugerir-prazo")
    public PrazoSugeridoDTO sugerirPrazo(@RequestBody SugerirPrazoRequestDTO dto) {
        return aiService.sugerirPrazo(dto);
    }

    @PostMapping("/projetos/{projetoId}/gerar-backlog")
    public PlanoBacklogResponseDTO gerarPlanoBacklog(
            @PathVariable Long projetoId,
            @RequestBody GerarPlanoBacklogRequestDTO dto) {
        return aiService.gerarPlanoBacklog(projetoId, dto);
    }

    @PostMapping("/projetos/{projetoId}/analisar-riscos")
    public AnaliseRiscoResponseDTO analisarRiscos(@PathVariable Long projetoId) {
        return aiService.analisarRiscos(projetoId);
    }

    @PostMapping("/projetos/{projetoId}/sugerir-responsavel")
    public SugestaoResponsavelDTO sugerirResponsavel(
            @PathVariable Long projetoId,
            @RequestBody SugerirResponsavelRequestDTO dto) {
        return aiService.sugerirResponsavel(projetoId, dto);
    }

    @PostMapping("/projetos/{projetoId}/interpretar-tarefa")
    public TarefaInterpretadaDTO interpretarTarefa(
            @PathVariable Long projetoId,
            @RequestBody InterpretarTarefaRequestDTO dto) {
        return aiService.interpretarTarefa(projetoId, dto);
    }

    @PostMapping("/projetos/{projetoId}/gerar-documento")
    public DocumentoProjetoResponseDTO gerarDocumento(
            @PathVariable Long projetoId,
            @RequestBody GerarDocumentoRequestDTO dto) {
        return aiService.gerarDocumento(projetoId, dto);
    }

    @PostMapping("/sprints/{sprintId}/gerar-retrospectiva")
    public DocumentoProjetoResponseDTO gerarRetrospectivaSprint(@PathVariable Long sprintId) {
        return aiService.gerarRetrospectivaSprint(sprintId);
    }

    @PostMapping("/sprints/{sprintId}/analisar-progresso")
    public AnaliseProgressoSprintDTO analisarProgressoSprint(@PathVariable Long sprintId) {
        return aiService.analisarProgressoSprint(sprintId);
    }
}
