package com.taskflow.backend.repository;

import com.taskflow.backend.entity.HistoriaUsuario;
import com.taskflow.backend.entity.StatusHistoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriaUsuarioRepository extends JpaRepository<HistoriaUsuario, Long> {

    List<HistoriaUsuario> findByProjetoId(Long projetoId);

    List<HistoriaUsuario> findByEpicoId(Long epicoId);

    List<HistoriaUsuario> findBySprintId(Long sprintId);

    List<HistoriaUsuario> findBySprintIdAndStatus(Long sprintId, StatusHistoria status);

}
