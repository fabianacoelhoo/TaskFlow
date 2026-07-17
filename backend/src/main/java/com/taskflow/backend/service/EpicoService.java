package com.taskflow.backend.service;

import com.taskflow.backend.dto.epico.EpicoRequestDTO;
import com.taskflow.backend.dto.epico.EpicoResponseDTO;
import com.taskflow.backend.entity.Epico;
import com.taskflow.backend.entity.HistoriaUsuario;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.EpicoRepository;
import com.taskflow.backend.repository.HistoriaUsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EpicoService {

    private final EpicoRepository epicoRepository;
    private final HistoriaUsuarioRepository historiaUsuarioRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public EpicoService(EpicoRepository epicoRepository,
                         HistoriaUsuarioRepository historiaUsuarioRepository,
                         ProjetoService projetoService,
                         AutenticacaoService autenticacaoService) {
        this.epicoRepository = epicoRepository;
        this.historiaUsuarioRepository = historiaUsuarioRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public EpicoResponseDTO criar(Long projetoId, EpicoRequestDTO dto) {
        Projeto projeto = projetoService.buscarPorId(projetoId);

        Epico epico = new Epico();
        epico.setTitulo(dto.getTitulo());
        epico.setDescricao(dto.getDescricao());
        epico.setProjeto(projeto);
        epico.setCriadoEm(LocalDateTime.now());

        return toResponseDTO(epicoRepository.save(epico));
    }

    public List<EpicoResponseDTO> listarPorProjeto(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return epicoRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public EpicoResponseDTO atualizar(Long id, EpicoRequestDTO dto) {
        Epico epico = buscarComAcesso(id);

        epico.setTitulo(dto.getTitulo());
        epico.setDescricao(dto.getDescricao());

        return toResponseDTO(epicoRepository.save(epico));
    }

    public void excluir(Long id) {
        Epico epico = buscarComAcesso(id);

        List<HistoriaUsuario> historias = historiaUsuarioRepository.findByEpicoId(id);
        historias.forEach(h -> h.setEpico(null));
        historiaUsuarioRepository.saveAll(historias);

        epicoRepository.delete(epico);
    }

    private Epico buscarComAcesso(Long id) {
        Epico epico = epicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Épico não encontrado"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, epico.getProjeto());

        return epico;
    }

    private EpicoResponseDTO toResponseDTO(Epico epico) {
        EpicoResponseDTO dto = new EpicoResponseDTO();
        dto.setId(epico.getId());
        dto.setTitulo(epico.getTitulo());
        dto.setDescricao(epico.getDescricao());
        dto.setProjetoId(epico.getProjeto().getId());
        dto.setCriadoEm(epico.getCriadoEm());
        return dto;
    }
}
