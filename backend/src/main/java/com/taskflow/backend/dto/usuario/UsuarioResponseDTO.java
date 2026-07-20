package com.taskflow.backend.dto.usuario;

import com.taskflow.backend.entity.DisponibilidadeUsuario;
import com.taskflow.backend.entity.Papel;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UsuarioResponseDTO {

    private Long id;

    private String nome;

    private String email;

    private Papel papel;

    private String cargo;

    private String cpf;

    private LocalDate dataNascimento;

    private DisponibilidadeUsuario disponibilidade;

    private List<String> habilidades;

}
