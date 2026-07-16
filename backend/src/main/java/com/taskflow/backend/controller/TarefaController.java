package com.taskflow.backend.controller;

import com.taskflow.backend.dto.tarefa.TarefaRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.service.TarefaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @PostMapping
    public TarefaResponseDTO criar(
            @RequestBody TarefaRequestDTO tarefa,
            @RequestParam Long projetoId,
            @RequestParam Long responsavelId
    ) {
        return tarefaService.criar(tarefa, projetoId, responsavelId);
    }

    @GetMapping("/projeto/{projetoId}")
    public List<TarefaResponseDTO> listarPorProjeto(@PathVariable Long projetoId) {
        return tarefaService.listarPorProjeto(projetoId);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<TarefaResponseDTO> listarPorResponsavel(@PathVariable Long usuarioId) {
        return tarefaService.listarPorResponsavel(usuarioId);
    }

    @PutMapping("/{id}")
    public TarefaResponseDTO atualizar(
            @PathVariable Long id,
            @RequestBody TarefaRequestDTO tarefa
    ) {
        return tarefaService.atualizar(id, tarefa);
    }

    @PutMapping("/{id}/responsavel")
    public TarefaResponseDTO trocarResponsavel(
            @PathVariable Long id,
            @RequestParam Long responsavelId
    ) {
        return tarefaService.trocarResponsavel(id, responsavelId);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        tarefaService.excluir(id);
    }
}
