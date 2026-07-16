package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Anexo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnexoRepository extends JpaRepository<Anexo, Long> {

    List<Anexo> findByTarefaId(Long tarefaId);

}