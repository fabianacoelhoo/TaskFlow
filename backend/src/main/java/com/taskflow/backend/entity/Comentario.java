package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="comentarios")
@Data
public class Comentario {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(columnDefinition = "TEXT")
    private String texto;


    private LocalDateTime criadoEm;


    @ManyToOne
    @JoinColumn(name="tarefa_id")
    private Tarefa tarefa;


    @ManyToOne
    @JoinColumn(name="usuario_id")
    private Usuario usuario;

}