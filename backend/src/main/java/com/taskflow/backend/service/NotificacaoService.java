package com.taskflow.backend.service;

import com.taskflow.backend.dto.notificacao.NotificacaoResponseDTO;
import com.taskflow.backend.entity.Notificacao;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.NotificacaoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificacaoService {

    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final NotificacaoRepository notificacaoRepository;
    private final TarefaRepository tarefaRepository;
    private final AutenticacaoService autenticacaoService;

    public NotificacaoService(NotificacaoRepository notificacaoRepository,
                               TarefaRepository tarefaRepository,
                               AutenticacaoService autenticacaoService) {
        this.notificacaoRepository = notificacaoRepository;
        this.tarefaRepository = tarefaRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public void criar(Usuario destinatario, String mensagem, Tarefa tarefaRelacionada) {
        Notificacao notificacao = new Notificacao();
        notificacao.setMensagem(mensagem);
        notificacao.setUsuario(destinatario);
        notificacao.setTarefa(tarefaRelacionada);
        notificacao.setCriadoEm(LocalDateTime.now());
        notificacao.setLida(false);

        notificacaoRepository.save(notificacao);
    }

    public List<NotificacaoResponseDTO> listarPorUsuarioAtual() {
        Usuario usuario = autenticacaoService.usuarioAutenticado();

        return notificacaoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuario.getId()).stream()
                .limit(50)
                .map(this::toResponseDTO)
                .toList();
    }

    public long contarNaoLidas() {
        Usuario usuario = autenticacaoService.usuarioAutenticado();
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuario.getId());
    }

    public void marcarComoLida(Long id) {
        Usuario usuario = autenticacaoService.usuarioAutenticado();

        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Notificação não encontrada"));

        if (!notificacao.getUsuario().getId().equals(usuario.getId())) {
            throw new AcessoNegadoException("Essa notificação não pertence a você.");
        }

        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }

    public void marcarTodasComoLidas() {
        Usuario usuario = autenticacaoService.usuarioAutenticado();

        List<Notificacao> naoLidas = notificacaoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuario.getId())
                .stream()
                .filter(n -> !n.isLida())
                .toList();

        naoLidas.forEach(n -> n.setLida(true));
        notificacaoRepository.saveAll(naoLidas);
    }

    /**
     * Roda uma vez ao subir a aplicação e depois todo dia às 8h. É idempotente:
     * antes de criar, verifica se já existe um aviso igual para a mesma tarefa
     * nas últimas 20 horas, para não duplicar a cada reinício.
     */
    @PostConstruct
    @Scheduled(cron = "0 0 8 * * *")
    public void verificarPrazosProximos() {
        LocalDate amanha = LocalDate.now().plusDays(1);

        List<Tarefa> tarefasComPrazoProximo = tarefaRepository.findAll().stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO)
                .filter(t -> t.getPrazo() != null && !t.getPrazo().isAfter(amanha) && !t.getPrazo().isBefore(LocalDate.now()))
                .toList();

        for (Tarefa tarefa : tarefasComPrazoProximo) {
            String mensagem = "A tarefa '" + tarefa.getTitulo() + "' vence em " + tarefa.getPrazo().format(FORMATO_DATA) + ".";

            boolean jaNotificado = notificacaoRepository.existsByTarefaIdAndMensagemAndCriadoEmAfter(
                    tarefa.getId(), mensagem, LocalDateTime.now().minusHours(20));

            if (!jaNotificado) {
                criar(tarefa.getResponsavel(), mensagem, tarefa);
            }
        }
    }

    private NotificacaoResponseDTO toResponseDTO(Notificacao notificacao) {
        NotificacaoResponseDTO dto = new NotificacaoResponseDTO();
        dto.setId(notificacao.getId());
        dto.setMensagem(notificacao.getMensagem());
        dto.setLida(notificacao.isLida());
        dto.setCriadoEm(notificacao.getCriadoEm());
        dto.setTarefaId(notificacao.getTarefa() != null ? notificacao.getTarefa().getId() : null);
        return dto;
    }
}
