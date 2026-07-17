package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "regras_automacao")
@Data
public class RegraAutomacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    @Enumerated(EnumType.STRING)
    private StatusTarefa statusGatilho;

    private boolean ativa = true;

    @OneToMany(mappedBy = "regra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AcaoAutomacao> acoes = new ArrayList<>();
}
