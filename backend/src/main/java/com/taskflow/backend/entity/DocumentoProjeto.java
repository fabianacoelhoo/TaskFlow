package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "documentos_projeto")
@Data
public class DocumentoProjeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Enumerated(EnumType.STRING)
    private CategoriaDocumento categoria;

    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @ManyToOne
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    @ManyToOne
    @JoinColumn(name = "criado_por")
    private Usuario criadoPor;

    private LocalDateTime criadoEm;

    private LocalDateTime atualizadoEm;
}
