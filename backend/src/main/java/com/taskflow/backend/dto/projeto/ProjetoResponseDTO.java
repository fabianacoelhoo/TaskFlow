package com.taskflow.backend.dto.projeto;

import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import lombok.Data;

import java.util.List;

@Data
public class ProjetoResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
    private long totalTarefas;
    private long tarefasConcluidas;
    private Long criadoPorId;
    private List<UsuarioResponseDTO> membros;
}
