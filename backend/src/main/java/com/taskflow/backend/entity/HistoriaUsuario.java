package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "historias_usuario")
@Data
public class HistoriaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(columnDefinition = "TEXT")
    private String criteriosAceitacao;

    private Integer pontos;

    private String prioridade;

    @Enumerated(EnumType.STRING)
    private StatusHistoria status;

    @ManyToOne
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    @ManyToOne
    @JoinColumn(name = "epico_id")
    private Epico epico;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;
}
