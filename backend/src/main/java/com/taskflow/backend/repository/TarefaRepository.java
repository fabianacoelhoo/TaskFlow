package com.taskflow.backend.repository;

import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findByProjetoId(Long projetoId);

    List<Tarefa> findByResponsavelId(Long usuarioId);

    long countByStatus(StatusTarefa status);

    long countByPrazoBeforeAndStatusNot(LocalDate data, StatusTarefa status);

    long countByProjetoId(Long projetoId);

    long countByProjetoIdAndStatus(Long projetoId, StatusTarefa status);

}