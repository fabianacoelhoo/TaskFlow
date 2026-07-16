package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findByProjetoId(Long projetoId);

    List<Tarefa> findByResponsavelId(Long usuarioId);

}