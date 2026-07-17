package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "integracoes_github")
@Data
public class IntegracaoGithub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "projeto_id", nullable = false, unique = true)
    private Projeto projeto;

    private String repositorioOwner;

    private String repositorioNome;

    @Column(columnDefinition = "TEXT")
    private String tokenAcesso;

    private LocalDateTime conectadoEm;
}
