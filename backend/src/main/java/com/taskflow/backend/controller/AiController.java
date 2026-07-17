package com.taskflow.backend.controller;

import com.taskflow.backend.dto.ai.GerarTarefasRequestDTO;
import com.taskflow.backend.dto.ai.PerguntaRequestDTO;
import com.taskflow.backend.dto.ai.PrazoSugeridoDTO;
import com.taskflow.backend.dto.ai.RespostaIaDTO;
import com.taskflow.backend.dto.ai.SugerirPrazoRequestDTO;
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
}
