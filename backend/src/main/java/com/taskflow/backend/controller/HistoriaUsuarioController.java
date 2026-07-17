package com.taskflow.backend.controller;

import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioRequestDTO;
import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioResponseDTO;
import com.taskflow.backend.service.HistoriaUsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class HistoriaUsuarioController {

    private final HistoriaUsuarioService historiaUsuarioService;

    public HistoriaUsuarioController(HistoriaUsuarioService historiaUsuarioService) {
        this.historiaUsuarioService = historiaUsuarioService;
    }

    @PostMapping("/api/projetos/{projetoId}/historias")
    @ResponseStatus(HttpStatus.CREATED)
    public HistoriaUsuarioResponseDTO criar(@PathVariable Long projetoId, @RequestBody HistoriaUsuarioRequestDTO dto) {
        return historiaUsuarioService.criar(projetoId, dto);
    }

    @GetMapping("/api/projetos/{projetoId}/historias")
    public List<HistoriaUsuarioResponseDTO> listar(@PathVariable Long projetoId) {
        return historiaUsuarioService.listarPorProjeto(projetoId);
    }

    @PutMapping("/api/historias/{id}")
    public HistoriaUsuarioResponseDTO atualizar(@PathVariable Long id, @RequestBody HistoriaUsuarioRequestDTO dto) {
        return historiaUsuarioService.atualizar(id, dto);
    }

    @DeleteMapping("/api/historias/{id}")
    public void excluir(@PathVariable Long id) {
        historiaUsuarioService.excluir(id);
    }
}
