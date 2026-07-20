package com.taskflow.backend.dto.usuario;

import com.taskflow.backend.entity.DisponibilidadeUsuario;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UsuarioPerfilRequestDTO {

    private String nome;
    private String cargo;
    private String cpf;
    private LocalDate dataNascimento;
    private DisponibilidadeUsuario disponibilidade;
    private List<String> habilidades;

}
