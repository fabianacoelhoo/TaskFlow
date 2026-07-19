package com.taskflow.backend.controller;

import com.taskflow.backend.dto.pesquisa.ResultadoPesquisaDTO;
import com.taskflow.backend.service.PesquisaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pesquisa")
public class PesquisaController {

    private final PesquisaService pesquisaService;

    public PesquisaController(PesquisaService pesquisaService) {
        this.pesquisaService = pesquisaService;
    }

    @GetMapping
    public List<ResultadoPesquisaDTO> pesquisar(@RequestParam("q") String termo) {
        return pesquisaService.pesquisar(termo);
    }
}
