package com.taskflow.backend.repository;

import com.taskflow.backend.entity.DocumentoProjeto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentoProjetoRepository extends JpaRepository<DocumentoProjeto, Long> {

    List<DocumentoProjeto> findByProjetoId(Long projetoId);

    List<DocumentoProjeto> findByProjetoIdIn(List<Long> projetoIds);

}
