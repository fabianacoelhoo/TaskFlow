package com.taskflow.backend.dto.usuario;

import com.taskflow.backend.entity.DisponibilidadeUsuario;
import lombok.Data;

import java.util.List;

@Data
public class UsuarioPerfilRequestDTO {

    private String cargo;
    private DisponibilidadeUsuario disponibilidade;
    private List<String> habilidades;

}
