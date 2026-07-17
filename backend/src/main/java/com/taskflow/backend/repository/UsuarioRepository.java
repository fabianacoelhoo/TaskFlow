package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByPapel(Papel papel);

}