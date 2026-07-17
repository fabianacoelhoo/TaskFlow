package com.taskflow.backend.controller;

import com.taskflow.backend.dto.documento.DocumentoProjetoRequestDTO;
import com.taskflow.backend.dto.documento.DocumentoProjetoResponseDTO;
import com.taskflow.backend.service.DocumentoProjetoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DocumentoProjetoController {

    private final DocumentoProjetoService documentoProjetoService;

    public DocumentoProjetoController(DocumentoProjetoService documentoProjetoService) {
        this.documentoProjetoService = documentoProjetoService;
    }

    @PostMapping("/api/projetos/{projetoId}/documentos")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoProjetoResponseDTO criar(@PathVariable Long projetoId, @RequestBody DocumentoProjetoRequestDTO dto) {
        return documentoProjetoService.criar(projetoId, dto);
    }

    @GetMapping("/api/projetos/{projetoId}/documentos")
    public List<DocumentoProjetoResponseDTO> listar(@PathVariable Long projetoId) {
        return documentoProjetoService.listarPorProjeto(projetoId);
    }

    @PutMapping("/api/documentos/{id}")
    public DocumentoProjetoResponseDTO atualizar(@PathVariable Long id, @RequestBody DocumentoProjetoRequestDTO dto) {
        return documentoProjetoService.atualizar(id, dto);
    }

    @DeleteMapping("/api/documentos/{id}")
    public void excluir(@PathVariable Long id) {
        documentoProjetoService.excluir(id);
    }
}
