package com.taskflow.backend.repository;

import com.taskflow.backend.entity.IntegracaoGithub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IntegracaoGithubRepository extends JpaRepository<IntegracaoGithub, Long> {

    Optional<IntegracaoGithub> findByProjetoId(Long projetoId);

}
