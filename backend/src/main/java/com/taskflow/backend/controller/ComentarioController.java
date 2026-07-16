package com.taskflow.backend.controller;

import com.taskflow.backend.dto.comentario.ComentarioRequestDTO;
import com.taskflow.backend.dto.comentario.ComentarioResponseDTO;
import com.taskflow.backend.service.ComentarioService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas/{tarefaId}/comentarios")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComentarioResponseDTO criar(
            @PathVariable Long tarefaId,
            @RequestBody ComentarioRequestDTO dto) {

        return comentarioService.criar(tarefaId, dto);
    }

    @GetMapping
    public List<ComentarioResponseDTO> listar(@PathVariable Long tarefaId) {
        return comentarioService.listarPorTarefa(tarefaId);
    }
}
