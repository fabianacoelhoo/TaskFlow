package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "tarefas")
@Data
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    private StatusTarefa status;

    private String prioridade;

    private LocalDate prazo;


    @ManyToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;


    @ManyToOne
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;
}