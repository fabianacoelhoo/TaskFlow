package com.taskflow.backend.service;

import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioRequestDTO;
import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioResponseDTO;
import com.taskflow.backend.entity.Epico;
import com.taskflow.backend.entity.HistoriaUsuario;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Sprint;
import com.taskflow.backend.entity.StatusHistoria;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.EpicoRepository;
import com.taskflow.backend.repository.HistoriaUsuarioRepository;
import com.taskflow.backend.repository.SprintRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoriaUsuarioService {

    private final HistoriaUsuarioRepository historiaUsuarioRepository;
    private final EpicoRepository epicoRepository;
    private final SprintRepository sprintRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public HistoriaUsuarioService(HistoriaUsuarioRepository historiaUsuarioRepository,
                                   EpicoRepository epicoRepository,
                                   SprintRepository sprintRepository,
                                   ProjetoService projetoService,
                                   AutenticacaoService autenticacaoService) {
        this.historiaUsuarioRepository = historiaUsuarioRepository;
        this.epicoRepository = epicoRepository;
        this.sprintRepository = sprintRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public HistoriaUsuarioResponseDTO criar(Long projetoId, HistoriaUsuarioRequestDTO dto) {
        Projeto projeto = projetoService.buscarPorId(projetoId);

        HistoriaUsuario historia = new HistoriaUsuario();
        historia.setProjeto(projeto);
        historia.setStatus(StatusHistoria.PENDENTE);
        aplicarCampos(historia, dto, projeto);

        return toResponseDTO(historiaUsuarioRepository.save(historia));
    }

    public List<HistoriaUsuarioResponseDTO> listarPorProjeto(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return historiaUsuarioRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public HistoriaUsuarioResponseDTO atualizar(Long id, HistoriaUsuarioRequestDTO dto) {
        HistoriaUsuario historia = buscarComAcesso(id);
        aplicarCampos(historia, dto, historia.getProjeto());
        if (dto.getStatus() != null) {
            historia.setStatus(dto.getStatus());
        }

        return toResponseDTO(historiaUsuarioRepository.save(historia));
    }

    public void excluir(Long id) {
        HistoriaUsuario historia = buscarComAcesso(id);
        historiaUsuarioRepository.delete(historia);
    }

    private void aplicarCampos(HistoriaUsuario historia, HistoriaUsuarioRequestDTO dto, Projeto projeto) {
        historia.setTitulo(dto.getTitulo());
        historia.setDescricao(dto.getDescricao());
        historia.setCriteriosAceitacao(dto.getCriteriosAceitacao());
        historia.setPontos(dto.getPontos());
        historia.setPrioridade(dto.getPrioridade());

        if (dto.getEpicoId() == null) {
            historia.setEpico(null);
        } else {
            Epico epico = epicoRepository.findById(dto.getEpicoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Épico não encontrado"));
            if (!epico.getProjeto().getId().equals(projeto.getId())) {
                throw new RecursoNaoEncontradoException("Épico não encontrado");
            }
            historia.setEpico(epico);
        }

        if (dto.getSprintId() == null) {
            historia.setSprint(null);
        } else {
            Sprint sprint = sprintRepository.findById(dto.getSprintId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Sprint não encontrada"));
            if (!sprint.getProjeto().getId().equals(projeto.getId())) {
                throw new RecursoNaoEncontradoException("Sprint não encontrada");
            }
            historia.setSprint(sprint);
        }
    }

    private HistoriaUsuario buscarComAcesso(Long id) {
        HistoriaUsuario historia = historiaUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("História não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, historia.getProjeto());

        return historia;
    }

    private HistoriaUsuarioResponseDTO toResponseDTO(HistoriaUsuario historia) {
        HistoriaUsuarioResponseDTO dto = new HistoriaUsuarioResponseDTO();
        dto.setId(historia.getId());
        dto.setTitulo(historia.getTitulo());
        dto.setDescricao(historia.getDescricao());
        dto.setCriteriosAceitacao(historia.getCriteriosAceitacao());
        dto.setPontos(historia.getPontos());
        dto.setPrioridade(historia.getPrioridade());
        dto.setStatus(historia.getStatus());
        dto.setProjetoId(historia.getProjeto().getId());
        dto.setEpicoId(historia.getEpico() != null ? historia.getEpico().getId() : null);
        dto.setSprintId(historia.getSprint() != null ? historia.getSprint().getId() : null);
        return dto;
    }
}
