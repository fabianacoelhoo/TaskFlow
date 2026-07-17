package com.taskflow.backend.controller;

import com.taskflow.backend.dto.github.AtividadeGithubResponseDTO;
import com.taskflow.backend.dto.github.ConectarGithubRequestDTO;
import com.taskflow.backend.dto.github.StatusGithubResponseDTO;
import com.taskflow.backend.service.GithubService;
import org.springframework.web.bind.annotation.*;

@RestController
public class GithubController {

    private final GithubService githubService;

    public GithubController(GithubService githubService) {
        this.githubService = githubService;
    }

    @PostMapping("/api/projetos/{projetoId}/github")
    public StatusGithubResponseDTO conectar(@PathVariable Long projetoId, @RequestBody ConectarGithubRequestDTO dto) {
        return githubService.conectar(projetoId, dto);
    }

    @DeleteMapping("/api/projetos/{projetoId}/github")
    public void desconectar(@PathVariable Long projetoId) {
        githubService.desconectar(projetoId);
    }

    @GetMapping("/api/projetos/{projetoId}/github")
    public StatusGithubResponseDTO status(@PathVariable Long projetoId) {
        return githubService.status(projetoId);
    }

    @GetMapping("/api/tarefas/{tarefaId}/github")
    public AtividadeGithubResponseDTO atividade(@PathVariable Long tarefaId) {
        return githubService.buscarAtividade(tarefaId);
    }
}
