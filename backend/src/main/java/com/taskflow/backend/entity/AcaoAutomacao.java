package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "acoes_automacao")
@Data
public class AcaoAutomacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "regra_id", nullable = false)
    private RegraAutomacao regra;

    @Enumerated(EnumType.STRING)
    private TipoAcaoAutomacao tipo;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @Enumerated(EnumType.STRING)
    private StatusTarefa statusDestino;

    @ManyToOne
    @JoinColumn(name = "tag_id")
    private Tag tag;
}
