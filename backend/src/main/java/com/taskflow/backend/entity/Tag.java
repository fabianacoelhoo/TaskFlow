package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tags")
@Data
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nome;

    private String cor;
}
