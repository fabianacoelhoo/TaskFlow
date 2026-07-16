package com.taskflow.backend.controller;

import com.taskflow.backend.dto.historico.HistoricoResponseDTO;
import com.taskflow.backend.service.HistoricoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas/{tarefaId}/historico")
public class HistoricoController {

    private final HistoricoService historicoService;

    public HistoricoController(HistoricoService historicoService) {
        this.historicoService = historicoService;
    }

    @GetMapping
    public List<HistoricoResponseDTO> listar(@PathVariable Long tarefaId) {
        return historicoService.listarPorTarefa(tarefaId);
    }
}
