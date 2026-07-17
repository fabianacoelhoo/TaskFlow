package com.taskflow.backend.service;

import com.taskflow.backend.entity.AcaoAutomacao;
import com.taskflow.backend.entity.RegraAutomacao;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.RegraAutomacaoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutomacaoExecutorService {

    private final RegraAutomacaoRepository regraRepository;
    private final TarefaRepository tarefaRepository;
    private final HistoricoService historicoService;
    private final NotificacaoService notificacaoService;

    public AutomacaoExecutorService(RegraAutomacaoRepository regraRepository,
                                     TarefaRepository tarefaRepository,
                                     HistoricoService historicoService,
                                     NotificacaoService notificacaoService) {
        this.regraRepository = regraRepository;
        this.tarefaRepository = tarefaRepository;
        this.historicoService = historicoService;
        this.notificacaoService = notificacaoService;
    }

    /**
     * Dispara as regras cujo statusGatilho bate com o status atual da tarefa. Ações do tipo
     * MOVER_PARA_STATUS gravam direto no repositório (não chamam TarefaService.atualizar de
     * volta), então não há reentrância nem risco de loop entre regras.
     */
    public void executar(Tarefa tarefa, Usuario autor) {
        List<RegraAutomacao> regras = regraRepository.findByProjetoIdAndStatusGatilhoAndAtivaTrue(
                tarefa.getProjeto().getId(), tarefa.getStatus());

        for (RegraAutomacao regra : regras) {
            for (AcaoAutomacao acao : regra.getAcoes()) {
                executarAcao(regra, acao, tarefa, autor);
            }
        }
    }

    private void executarAcao(RegraAutomacao regra, AcaoAutomacao acao, Tarefa tarefa, Usuario autor) {
        switch (acao.getTipo()) {
            case NOTIFICAR_RESPONSAVEL -> notificacaoService.criar(
                    tarefa.getResponsavel(), mensagemOuPadrao(acao, regra, tarefa), tarefa);

            case NOTIFICAR_MEMBROS_PROJETO -> tarefa.getProjeto().getMembros().forEach(membro ->
                    notificacaoService.criar(membro, mensagemOuPadrao(acao, regra, tarefa), tarefa));

            case MOVER_PARA_STATUS -> {
                if (acao.getStatusDestino() != null && acao.getStatusDestino() != tarefa.getStatus()) {
                    tarefa.setStatus(acao.getStatusDestino());
                    tarefaRepository.save(tarefa);
                    historicoService.registrar(tarefa, autor,
                            "Automação \"" + regra.getNome() + "\" moveu para '" + acao.getStatusDestino() + "'");
                }
            }

            case ADICIONAR_TAG -> {
                if (acao.getTag() != null && tarefa.getTags().stream().noneMatch(t -> t.getId().equals(acao.getTag().getId()))) {
                    tarefa.getTags().add(acao.getTag());
                    tarefaRepository.save(tarefa);
                }
            }
        }
    }

    private String mensagemOuPadrao(AcaoAutomacao acao, RegraAutomacao regra, Tarefa tarefa) {
        if (acao.getMensagem() != null && !acao.getMensagem().isBlank()) {
            return acao.getMensagem();
        }
        return "Automação \"" + regra.getNome() + "\": tarefa '" + tarefa.getTitulo() + "' foi para '" + tarefa.getStatus() + "'.";
    }
}
