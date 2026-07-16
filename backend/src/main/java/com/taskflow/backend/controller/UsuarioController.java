package com.taskflow.backend.controller;

import com.taskflow.backend.dto.usuario.UsuarioRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {


    private final UsuarioService usuarioService;


    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO criar(
            @RequestBody UsuarioRequestDTO dto
    ){

        return usuarioService.criarUsuario(dto);

    }

}