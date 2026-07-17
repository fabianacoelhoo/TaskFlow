package com.taskflow.backend.repository;

import com.taskflow.backend.entity.SprintBurndownSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SprintBurndownSnapshotRepository extends JpaRepository<SprintBurndownSnapshot, Long> {

    List<SprintBurndownSnapshot> findBySprintIdOrderByDataAsc(Long sprintId);

    Optional<SprintBurndownSnapshot> findBySprintIdAndData(Long sprintId, LocalDate data);

}
