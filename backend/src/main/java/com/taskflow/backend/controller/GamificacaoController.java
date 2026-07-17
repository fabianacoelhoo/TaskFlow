package com.taskflow.backend.controller;

import com.taskflow.backend.dto.gamificacao.PerfilGamificacaoResponseDTO;
import com.taskflow.backend.dto.gamificacao.RankingItemDTO;
import com.taskflow.backend.security.AutenticacaoService;
import com.taskflow.backend.service.GamificacaoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/gamificacao")
public class GamificacaoController {

    private final GamificacaoService gamificacaoService;
    private final AutenticacaoService autenticacaoService;

    public GamificacaoController(GamificacaoService gamificacaoService, AutenticacaoService autenticacaoService) {
        this.gamificacaoService = gamificacaoService;
        this.autenticacaoService = autenticacaoService;
    }

    @GetMapping("/me")
    public PerfilGamificacaoResponseDTO perfil() {
        return gamificacaoService.perfil(autenticacaoService.usuarioAutenticado());
    }

    @GetMapping("/ranking")
    public List<RankingItemDTO> ranking() {
        return gamificacaoService.ranking(autenticacaoService.usuarioAutenticado());
    }
}
