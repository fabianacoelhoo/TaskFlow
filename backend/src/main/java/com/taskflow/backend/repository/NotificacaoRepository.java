package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

    long countByUsuarioIdAndLidaFalse(Long usuarioId);

    boolean existsByTarefaIdAndMensagemAndCriadoEmAfter(Long tarefaId, String mensagem, LocalDateTime apos);

}
