package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Epico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EpicoRepository extends JpaRepository<Epico, Long> {

    List<Epico> findByProjetoId(Long projetoId);

}
