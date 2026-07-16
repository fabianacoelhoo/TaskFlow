package com.taskflow.backend.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Table(name="historico")
@Data
public class Historico {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String acao;


    private LocalDateTime data;


    @ManyToOne
    @JoinColumn(name="tarefa_id")
    private Tarefa tarefa;


    @ManyToOne
    @JoinColumn(name="usuario_id")
    private Usuario usuario;

}