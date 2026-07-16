package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Historico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoRepository extends JpaRepository<Historico, Long> {

    List<Historico> findByTarefaIdOrderByDataAsc(Long tarefaId);

}