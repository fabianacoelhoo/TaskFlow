package com.taskflow.backend.repository;

import com.taskflow.backend.entity.CodigoConquista;
import com.taskflow.backend.entity.ConquistaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConquistaUsuarioRepository extends JpaRepository<ConquistaUsuario, Long> {

    List<ConquistaUsuario> findByUsuarioId(Long usuarioId);

    Optional<ConquistaUsuario> findByUsuarioIdAndCodigo(Long usuarioId, CodigoConquista codigo);

}
