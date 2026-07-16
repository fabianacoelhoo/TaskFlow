package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

}