package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByEmpresaId(Long empresaId);

    Optional<Usuario> findByCpf(String cpf);

}