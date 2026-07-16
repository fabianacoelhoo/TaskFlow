package com.taskflow.backend.controller;

import com.taskflow.backend.dto.anexo.AnexoResponseDTO;
import com.taskflow.backend.entity.Anexo;
import com.taskflow.backend.service.AnexoService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class AnexoController {

    private final AnexoService anexoService;

    public AnexoController(AnexoService anexoService) {
        this.anexoService = anexoService;
    }

    @PostMapping("/api/tarefas/{tarefaId}/anexos")
    @ResponseStatus(HttpStatus.CREATED)
    public AnexoResponseDTO upload(
            @PathVariable Long tarefaId,
            @RequestParam("arquivo") MultipartFile arquivo) {

        return anexoService.upload(tarefaId, arquivo);
    }

    @GetMapping("/api/tarefas/{tarefaId}/anexos")
    public List<AnexoResponseDTO> listar(@PathVariable Long tarefaId) {
        return anexoService.listarPorTarefa(tarefaId);
    }

    @GetMapping("/api/anexos/{id}/download")
    public ResponseEntity<Resource> baixar(@PathVariable Long id) {
        Anexo anexo = anexoService.buscarPorId(id);
        Resource arquivo = anexoService.carregarArquivo(anexo);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(anexo.getNomeArquivo(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(arquivo);
    }
}
