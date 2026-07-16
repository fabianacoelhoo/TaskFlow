package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "projetos")
@Data
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    private LocalDate dataInicio;

    private LocalDate dataFim;


    @ManyToOne
    @JoinColumn(name = "criado_por")
    private Usuario criadoPor;
}