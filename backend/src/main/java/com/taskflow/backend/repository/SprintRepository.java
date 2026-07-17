package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Sprint;
import com.taskflow.backend.entity.StatusSprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjetoId(Long projetoId);

    List<Sprint> findByProjetoIdAndStatus(Long projetoId, StatusSprint status);

    List<Sprint> findByStatus(StatusSprint status);

}
