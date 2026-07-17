package com.taskflow.backend.controller;

import com.taskflow.backend.dto.notificacao.NotificacaoResponseDTO;
import com.taskflow.backend.service.NotificacaoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public List<NotificacaoResponseDTO> listar() {
        return notificacaoService.listarPorUsuarioAtual();
    }

    @GetMapping("/nao-lidas/contagem")
    public Map<String, Long> contarNaoLidas() {
        return Map.of("quantidade", notificacaoService.contarNaoLidas());
    }

    @PutMapping("/{id}/lida")
    public void marcarComoLida(@PathVariable Long id) {
        notificacaoService.marcarComoLida(id);
    }

    @PutMapping("/lidas")
    public void marcarTodasComoLidas() {
        notificacaoService.marcarTodasComoLidas();
    }
}
