package com.taskflow.backend.controller;

import com.taskflow.backend.dto.projeto.ProjetoRequestDTO;
import com.taskflow.backend.dto.projeto.ProjetoResponseDTO;
import com.taskflow.backend.service.ProjetoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    private final ProjetoService projetoService;

    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjetoResponseDTO criar(@RequestBody ProjetoRequestDTO dto) {

        return projetoService.criarProjeto(dto);

    }

    @GetMapping
    public List<ProjetoResponseDTO> listar() {
        return projetoService.listarProjetos();
}

@GetMapping("/{id}")
public ProjetoResponseDTO buscarPorId(@PathVariable Long id) {
    return projetoService.buscarDTOPorId(id);
}

@PutMapping("/{id}")
public ProjetoResponseDTO atualizar(
        @PathVariable Long id,
        @RequestBody ProjetoRequestDTO dto) {

    return projetoService.atualizar(id, dto);
}

@DeleteMapping("/{id}")
public void excluir(@PathVariable Long id) {
    projetoService.excluir(id);
}
}