package com.taskflow.backend.service;

import com.taskflow.backend.dto.comentario.ComentarioRequestDTO;
import com.taskflow.backend.dto.comentario.ComentarioResponseDTO;
import com.taskflow.backend.entity.Comentario;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.ComentarioRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final TarefaRepository tarefaRepository;
    private final NotificacaoService notificacaoService;
    private final AutenticacaoService autenticacaoService;

    public ComentarioService(ComentarioRepository comentarioRepository,
                              TarefaRepository tarefaRepository,
                              NotificacaoService notificacaoService,
                              AutenticacaoService autenticacaoService) {
        this.comentarioRepository = comentarioRepository;
        this.tarefaRepository = tarefaRepository;
        this.notificacaoService = notificacaoService;
        this.autenticacaoService = autenticacaoService;
    }

    public ComentarioResponseDTO criar(Long tarefaId, ComentarioRequestDTO dto) {

        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();

        Comentario comentario = new Comentario();
        comentario.setTexto(dto.getTexto());
        comentario.setCriadoEm(LocalDateTime.now());
        comentario.setTarefa(tarefa);
        comentario.setUsuario(autor);

        Comentario salvo = comentarioRepository.save(comentario);

        Usuario responsavel = tarefa.getResponsavel();
        if (!responsavel.getId().equals(autor.getId())) {
            notificacaoService.criar(responsavel,
                    autor.getNome() + " comentou em '" + tarefa.getTitulo() + "'.", tarefa);
        }

        return toResponseDTO(salvo);
    }

    public List<ComentarioResponseDTO> listarPorTarefa(Long tarefaId) {
        if (!tarefaRepository.existsById(tarefaId)) {
            throw new RecursoNaoEncontradoException("Tarefa não encontrada");
        }

        return comentarioRepository.findByTarefaIdOrderByCriadoEmAsc(tarefaId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private ComentarioResponseDTO toResponseDTO(Comentario comentario) {
        ComentarioResponseDTO dto = new ComentarioResponseDTO();
        dto.setId(comentario.getId());
        dto.setTexto(comentario.getTexto());
        dto.setCriadoEm(comentario.getCriadoEm());
        dto.setTarefaId(comentario.getTarefa().getId());
        dto.setUsuarioId(comentario.getUsuario().getId());
        dto.setUsuarioNome(comentario.getUsuario().getNome());
        return dto;
    }
}
