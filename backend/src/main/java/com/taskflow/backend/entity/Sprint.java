package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "sprints")
@Data
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(columnDefinition = "TEXT")
    private String objetivo;

    private LocalDate dataInicio;

    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    private StatusSprint status;

    @ManyToOne
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;
}
