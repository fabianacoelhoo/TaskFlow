package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name="anexos")
@Data
public class Anexo {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String nomeArquivo;

    private String caminho;


    @ManyToOne
    @JoinColumn(name="tarefa_id")
    private Tarefa tarefa;

}