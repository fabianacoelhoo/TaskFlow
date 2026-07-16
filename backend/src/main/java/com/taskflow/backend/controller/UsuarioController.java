package com.taskflow.backend.controller;

import com.taskflow.backend.dto.usuario.UsuarioRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.security.AutenticacaoService;
import com.taskflow.backend.service.UsuarioService;

import org.springframework.http.HttpStatus;
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


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO criar(
            @RequestBody UsuarioRequestDTO dto
    ){

        return usuarioService.criarUsuario(dto);

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
        return dto;
    }

}