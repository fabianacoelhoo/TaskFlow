package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByNomeIgnoreCase(String nome);

    List<Tag> findByIdIn(List<Long> ids);

}
