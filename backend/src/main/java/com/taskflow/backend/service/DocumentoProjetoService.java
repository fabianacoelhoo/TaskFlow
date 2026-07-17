package com.taskflow.backend.service;

import com.taskflow.backend.dto.documento.DocumentoProjetoRequestDTO;
import com.taskflow.backend.dto.documento.DocumentoProjetoResponseDTO;
import com.taskflow.backend.entity.DocumentoProjeto;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.DocumentoProjetoRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentoProjetoService {

    private final DocumentoProjetoRepository documentoRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public DocumentoProjetoService(DocumentoProjetoRepository documentoRepository,
                                    ProjetoService projetoService,
                                    AutenticacaoService autenticacaoService) {
        this.documentoRepository = documentoRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public DocumentoProjetoResponseDTO criar(Long projetoId, DocumentoProjetoRequestDTO dto) {
        Projeto projeto = projetoService.buscarPorId(projetoId);
        Usuario autor = autenticacaoService.usuarioAutenticado();

        DocumentoProjeto documento = new DocumentoProjeto();
        documento.setProjeto(projeto);
        documento.setCriadoPor(autor);
        documento.setCriadoEm(LocalDateTime.now());
        aplicarCampos(documento, dto);

        return toResponseDTO(documentoRepository.save(documento));
    }

    public List<DocumentoProjetoResponseDTO> listarPorProjeto(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return documentoRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public DocumentoProjetoResponseDTO atualizar(Long id, DocumentoProjetoRequestDTO dto) {
        DocumentoProjeto documento = buscarComAcesso(id);
        aplicarCampos(documento, dto);

        return toResponseDTO(documentoRepository.save(documento));
    }

    public void excluir(Long id) {
        DocumentoProjeto documento = buscarComAcesso(id);
        documentoRepository.delete(documento);
    }

    private void aplicarCampos(DocumentoProjeto documento, DocumentoProjetoRequestDTO dto) {
        documento.setTitulo(dto.getTitulo());
        documento.setCategoria(dto.getCategoria());
        documento.setConteudo(dto.getConteudo());
        documento.setAtualizadoEm(LocalDateTime.now());
    }

    private DocumentoProjeto buscarComAcesso(Long id) {
        DocumentoProjeto documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, documento.getProjeto());

        return documento;
    }

    private DocumentoProjetoResponseDTO toResponseDTO(DocumentoProjeto documento) {
        DocumentoProjetoResponseDTO dto = new DocumentoProjetoResponseDTO();
        dto.setId(documento.getId());
        dto.setTitulo(documento.getTitulo());
        dto.setCategoria(documento.getCategoria());
        dto.setConteudo(documento.getConteudo());
        dto.setProjetoId(documento.getProjeto().getId());
        dto.setCriadoPorNome(documento.getCriadoPor() != null ? documento.getCriadoPor().getNome() : null);
        dto.setCriadoEm(documento.getCriadoEm());
        dto.setAtualizadoEm(documento.getAtualizadoEm());
        return dto;
    }
}
