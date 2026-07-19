package com.taskflow.backend.repository;

import com.taskflow.backend.entity.TokenRedefinicaoSenha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, Long> {

    Optional<TokenRedefinicaoSenha> findByToken(String token);

    List<TokenRedefinicaoSenha> findByUsuarioIdAndUsadoFalse(Long usuarioId);

}
