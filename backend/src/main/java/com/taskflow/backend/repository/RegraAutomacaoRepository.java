package com.taskflow.backend.repository;

import com.taskflow.backend.entity.RegraAutomacao;
import com.taskflow.backend.entity.StatusTarefa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegraAutomacaoRepository extends JpaRepository<RegraAutomacao, Long> {

    List<RegraAutomacao> findByProjetoId(Long projetoId);

    List<RegraAutomacao> findByProjetoIdAndStatusGatilhoAndAtivaTrue(Long projetoId, StatusTarefa statusGatilho);

}
