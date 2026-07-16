package com.taskflow.backend.service;

import com.taskflow.backend.dto.historico.HistoricoResponseDTO;
import com.taskflow.backend.entity.Historico;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.HistoricoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoricoService {

    private final HistoricoRepository historicoRepository;
    private final TarefaRepository tarefaRepository;

    public HistoricoService(HistoricoRepository historicoRepository, TarefaRepository tarefaRepository) {
        this.historicoRepository = historicoRepository;
        this.tarefaRepository = tarefaRepository;
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
        if (!tarefaRepository.existsById(tarefaId)) {
            throw new RecursoNaoEncontradoException("Tarefa não encontrada");
        }

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
