package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    List<Projeto> findByEmpresaId(Long empresaId);

    List<Projeto> findByEmpresaIdAndMembrosId(Long empresaId, Long usuarioId);

}