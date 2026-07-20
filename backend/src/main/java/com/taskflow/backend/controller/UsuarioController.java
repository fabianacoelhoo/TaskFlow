package com.taskflow.backend.controller;

import com.taskflow.backend.dto.usuario.UsuarioPerfilRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.security.AutenticacaoService;
import com.taskflow.backend.service.UsuarioService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {


    private final UsuarioService usuarioService;
    private final AutenticacaoService autenticacaoService;


    public UsuarioController(UsuarioService usuarioService, AutenticacaoService autenticacaoService) {
        this.usuarioService = usuarioService;
        this.autenticacaoService = autenticacaoService;
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/me")
    public UsuarioResponseDTO eu() {
        Usuario usuario = autenticacaoService.usuarioAutenticado();

        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPapel(usuario.getPapel());
        dto.setCargo(usuario.getCargo());
        dto.setCpf(usuario.getCpf());
        dto.setDataNascimento(usuario.getDataNascimento());
        dto.setDisponibilidade(usuario.getDisponibilidade());
        dto.setHabilidades(usuario.getHabilidades());
        return dto;
    }

    @PutMapping("/me")
    public UsuarioResponseDTO atualizarPerfil(@RequestBody UsuarioPerfilRequestDTO dto) {
        return usuarioService.atualizarPerfil(autenticacaoService.usuarioAutenticado(), dto);
    }

    @PutMapping("/{id}/papel")
    public UsuarioResponseDTO alterarPapel(
            @PathVariable Long id,
            @RequestParam Papel papel
    ) {
        return usuarioService.alterarPapel(id, papel, autenticacaoService.usuarioAutenticado());
    }

}
