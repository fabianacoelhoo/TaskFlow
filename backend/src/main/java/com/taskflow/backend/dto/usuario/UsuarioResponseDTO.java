package com.taskflow.backend.dto.usuario;

import com.taskflow.backend.entity.Papel;
import lombok.Data;

@Data
public class UsuarioResponseDTO {

    private Long id;

    private String nome;

    private String email;

    private Papel papel;

}