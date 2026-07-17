package com.taskflow.backend.dto.sprint;

import com.taskflow.backend.entity.StatusSprint;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SprintResponseDTO {

    private Long id;
    private String nome;
    private String objetivo;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private StatusSprint status;
    private Long projetoId;
    private int totalPontos;
    private int totalHistorias;

}
