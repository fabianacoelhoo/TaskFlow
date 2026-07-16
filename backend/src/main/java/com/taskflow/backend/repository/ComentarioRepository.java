package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

}