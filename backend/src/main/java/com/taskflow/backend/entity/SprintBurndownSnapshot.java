package com.taskflow.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "sprint_burndown_snapshots", uniqueConstraints = @UniqueConstraint(columnNames = {"sprint_id", "data"}))
@Data
public class SprintBurndownSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;

    private LocalDate data;

    private Integer pontosRestantes;
}
