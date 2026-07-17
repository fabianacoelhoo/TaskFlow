package com.taskflow.backend.controller;

import com.taskflow.backend.dto.epico.EpicoRequestDTO;
import com.taskflow.backend.dto.epico.EpicoResponseDTO;
import com.taskflow.backend.service.EpicoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EpicoController {

    private final EpicoService epicoService;

    public EpicoController(EpicoService epicoService) {
        this.epicoService = epicoService;
    }

    @PostMapping("/api/projetos/{projetoId}/epicos")
    @ResponseStatus(HttpStatus.CREATED)
    public EpicoResponseDTO criar(@PathVariable Long projetoId, @RequestBody EpicoRequestDTO dto) {
        return epicoService.criar(projetoId, dto);
    }

    @GetMapping("/api/projetos/{projetoId}/epicos")
    public List<EpicoResponseDTO> listar(@PathVariable Long projetoId) {
        return epicoService.listarPorProjeto(projetoId);
    }

    @PutMapping("/api/epicos/{id}")
    public EpicoResponseDTO atualizar(@PathVariable Long id, @RequestBody EpicoRequestDTO dto) {
        return epicoService.atualizar(id, dto);
    }

    @DeleteMapping("/api/epicos/{id}")
    public void excluir(@PathVariable Long id) {
        epicoService.excluir(id);
    }
}
