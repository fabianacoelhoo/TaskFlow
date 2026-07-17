package com.taskflow.backend.controller;

import com.taskflow.backend.dto.automacao.RegraAutomacaoRequestDTO;
import com.taskflow.backend.dto.automacao.RegraAutomacaoResponseDTO;
import com.taskflow.backend.service.RegraAutomacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class RegraAutomacaoController {

    private final RegraAutomacaoService regraAutomacaoService;

    public RegraAutomacaoController(RegraAutomacaoService regraAutomacaoService) {
        this.regraAutomacaoService = regraAutomacaoService;
    }

    @PostMapping("/api/projetos/{projetoId}/automacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public RegraAutomacaoResponseDTO criar(@PathVariable Long projetoId, @RequestBody RegraAutomacaoRequestDTO dto) {
        return regraAutomacaoService.criar(projetoId, dto);
    }

    @GetMapping("/api/projetos/{projetoId}/automacoes")
    public List<RegraAutomacaoResponseDTO> listar(@PathVariable Long projetoId) {
        return regraAutomacaoService.listarPorProjeto(projetoId);
    }

    @PutMapping("/api/automacoes/{id}")
    public RegraAutomacaoResponseDTO atualizar(@PathVariable Long id, @RequestBody RegraAutomacaoRequestDTO dto) {
        return regraAutomacaoService.atualizar(id, dto);
    }

    @DeleteMapping("/api/automacoes/{id}")
    public void excluir(@PathVariable Long id) {
        regraAutomacaoService.excluir(id);
    }
}
