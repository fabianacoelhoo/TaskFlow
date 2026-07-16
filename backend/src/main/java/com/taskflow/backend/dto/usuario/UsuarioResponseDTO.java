package com.taskflow.backend.dto.usuario;

import lombok.Data;

@Data
public class UsuarioResponseDTO {

    private Long id;

    private String nome;

    private String email;

}