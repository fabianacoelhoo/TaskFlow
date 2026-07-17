package com.taskflow.backend.dto.sprint;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SprintRequestDTO {

    private String nome;
    private String objetivo;
    private LocalDate dataInicio;
    private LocalDate dataFim;

}
