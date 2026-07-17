package com.taskflow.backend.service;

import com.taskflow.backend.dto.historico.HistoricoResponseDTO;
import com.taskflow.backend.entity.Historico;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.HistoricoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoricoService {

    private final HistoricoRepository historicoRepository;
    private final TarefaRepository tarefaRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public HistoricoService(HistoricoRepository historicoRepository,
                             TarefaRepository tarefaRepository,
                             ProjetoService projetoService,
                             AutenticacaoService autenticacaoService) {
        this.historicoRepository = historicoRepository;
        this.tarefaRepository = tarefaRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public void registrar(Tarefa tarefa, Usuario usuario, String acao) {
        Historico historico = new Historico();
        historico.setAcao(acao);
        historico.setData(LocalDateTime.now());
        historico.setTarefa(tarefa);
        historico.setUsuario(usuario);

        historicoRepository.save(historico);
    }

    public List<HistoricoResponseDTO> listarPorTarefa(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        projetoService.verificarAcesso(autenticacaoService.usuarioAutenticado(), tarefa.getProjeto());

        return historicoRepository.findByTarefaIdOrderByDataAsc(tarefaId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private HistoricoResponseDTO toResponseDTO(Historico historico) {
        HistoricoResponseDTO dto = new HistoricoResponseDTO();
        dto.setId(historico.getId());
        dto.setAcao(historico.getAcao());
        dto.setData(historico.getData());
        dto.setTarefaId(historico.getTarefa().getId());
        dto.setUsuarioId(historico.getUsuario().getId());
        dto.setUsuarioNome(historico.getUsuario().getNome());
        return dto;
    }
}
