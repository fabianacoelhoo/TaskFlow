package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tarefas")
@Data
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String titulo;

    @Column(columnDefinition = "TEXT")
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

    @ManyToMany
    @JoinTable(
            name = "tarefa_tags",
            joinColumns = @JoinColumn(name = "tarefa_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "tarefa_dependencias",
            joinColumns = @JoinColumn(name = "tarefa_id"),
            inverseJoinColumns = @JoinColumn(name = "depende_de_id")
    )
    private List<Tarefa> dependencias = new ArrayList<>();
}