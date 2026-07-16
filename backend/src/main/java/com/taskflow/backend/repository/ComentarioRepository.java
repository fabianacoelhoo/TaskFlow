package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    List<Comentario> findByTarefaIdOrderByCriadoEmAsc(Long tarefaId);

}