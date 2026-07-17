package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tags", uniqueConstraints = @UniqueConstraint(columnNames = {"nome", "empresa_id"}))
@Data
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String cor;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;
}
