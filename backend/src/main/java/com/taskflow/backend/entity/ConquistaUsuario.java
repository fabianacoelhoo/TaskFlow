package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "conquistas_usuario", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "codigo"}))
@Data
public class ConquistaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private CodigoConquista codigo;

    private LocalDateTime desbloqueadaEm;
}
