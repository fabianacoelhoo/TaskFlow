package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true)
    private String email;

    private String senha;

    @Enumerated(EnumType.STRING)
    private Papel papel;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    private String cargo;

    @Enumerated(EnumType.STRING)
    private DisponibilidadeUsuario disponibilidade = DisponibilidadeUsuario.DISPONIVEL;

    @ElementCollection
    @CollectionTable(name = "usuario_habilidades", joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "habilidade")
    private List<String> habilidades = new ArrayList<>();
}