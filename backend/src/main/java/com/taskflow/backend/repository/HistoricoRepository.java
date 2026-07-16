package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Historico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricoRepository extends JpaRepository<Historico, Long> {

}