package com.taskflow.backend.service;

import com.taskflow.backend.dto.anexo.AnexoResponseDTO;
import com.taskflow.backend.entity.Anexo;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.AnexoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class AnexoService {

    private final AnexoRepository anexoRepository;
    private final TarefaRepository tarefaRepository;
    private final HistoricoService historicoService;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;
    private final Path diretorioUpload;

    public AnexoService(AnexoRepository anexoRepository,
                         TarefaRepository tarefaRepository,
                         HistoricoService historicoService,
                         ProjetoService projetoService,
                         AutenticacaoService autenticacaoService,
                         @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.anexoRepository = anexoRepository;
        this.tarefaRepository = tarefaRepository;
        this.historicoService = historicoService;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
        this.diretorioUpload = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(diretorioUpload);
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível criar o diretório de uploads", e);
        }
    }

    public AnexoResponseDTO upload(Long tarefaId, MultipartFile arquivo) {

        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, tarefa.getProjeto());

        String nomeOriginal = Paths.get(
                        Objects.requireNonNullElse(arquivo.getOriginalFilename(), "arquivo"))
                .getFileName().toString();

        String extensao = "";
        int ponto = nomeOriginal.lastIndexOf('.');
        if (ponto >= 0 && ponto < nomeOriginal.length() - 1) {
            extensao = nomeOriginal.substring(ponto).replaceAll("[^a-zA-Z0-9.]", "");
        }

        String nomeArmazenado = UUID.randomUUID() + extensao;

        try {
            Files.copy(arquivo.getInputStream(), diretorioUpload.resolve(nomeArmazenado));
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao salvar o arquivo", e);
        }

        Anexo anexo = new Anexo();
        anexo.setNomeArquivo(nomeOriginal);
        anexo.setCaminho(nomeArmazenado);
        anexo.setTarefa(tarefa);

        Anexo salvo = anexoRepository.save(anexo);

        historicoService.registrar(tarefa, autor, "Anexo adicionado: " + nomeOriginal);

        return toResponseDTO(salvo);
    }

    public List<AnexoResponseDTO> listarPorTarefa(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        projetoService.verificarAcesso(autenticacaoService.usuarioAutenticado(), tarefa.getProjeto());

        return anexoRepository.findByTarefaId(tarefaId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public Anexo buscarPorId(Long id) {
        Anexo anexo = anexoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anexo não encontrado"));

        projetoService.verificarAcesso(autenticacaoService.usuarioAutenticado(), anexo.getTarefa().getProjeto());

        return anexo;
    }

    public Resource carregarArquivo(Anexo anexo) {
        try {
            Path caminho = diretorioUpload.resolve(anexo.getCaminho()).normalize();
            Resource recurso = new UrlResource(caminho.toUri());

            if (!recurso.exists() || !recurso.isReadable()) {
                throw new RecursoNaoEncontradoException("Arquivo não encontrado no servidor");
            }

            return recurso;
        } catch (MalformedURLException e) {
            throw new RecursoNaoEncontradoException("Arquivo não encontrado no servidor");
        }
    }

    private AnexoResponseDTO toResponseDTO(Anexo anexo) {
        AnexoResponseDTO dto = new AnexoResponseDTO();
        dto.setId(anexo.getId());
        dto.setNomeArquivo(anexo.getNomeArquivo());
        dto.setTarefaId(anexo.getTarefa().getId());
        return dto;
    }
}
