package com.taskflow.backend.controller;

import com.taskflow.backend.dto.sprint.BurndownResponseDTO;
import com.taskflow.backend.dto.sprint.SprintRequestDTO;
import com.taskflow.backend.dto.sprint.SprintResponseDTO;
import com.taskflow.backend.dto.sprint.VelocidadeItemDTO;
import com.taskflow.backend.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping("/api/projetos/{projetoId}/sprints")
    @ResponseStatus(HttpStatus.CREATED)
    public SprintResponseDTO criar(@PathVariable Long projetoId, @RequestBody SprintRequestDTO dto) {
        return sprintService.criar(projetoId, dto);
    }

    @GetMapping("/api/projetos/{projetoId}/sprints")
    public List<SprintResponseDTO> listar(@PathVariable Long projetoId) {
        return sprintService.listarPorProjeto(projetoId);
    }

    @GetMapping("/api/projetos/{projetoId}/velocidade")
    public List<VelocidadeItemDTO> velocidade(@PathVariable Long projetoId) {
        return sprintService.velocidade(projetoId);
    }

    @PutMapping("/api/sprints/{id}")
    public SprintResponseDTO atualizar(@PathVariable Long id, @RequestBody SprintRequestDTO dto) {
        return sprintService.atualizar(id, dto);
    }

    @DeleteMapping("/api/sprints/{id}")
    public void excluir(@PathVariable Long id) {
        sprintService.excluir(id);
    }

    @PutMapping("/api/sprints/{id}/iniciar")
    public SprintResponseDTO iniciar(@PathVariable Long id) {
        return sprintService.iniciar(id);
    }

    @PutMapping("/api/sprints/{id}/concluir")
    public SprintResponseDTO concluir(@PathVariable Long id) {
        return sprintService.concluir(id);
    }

    @GetMapping("/api/sprints/{id}/burndown")
    public BurndownResponseDTO burndown(@PathVariable Long id) {
        return sprintService.burndown(id);
    }
}
