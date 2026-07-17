package com.taskflow.backend.service;

import com.taskflow.backend.dto.tag.TagResponseDTO;
import com.taskflow.backend.dto.tarefa.TarefaRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.dto.tarefa.TarefaResumoDTO;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tag;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.ProjetoRepository;
import com.taskflow.backend.repository.TagRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final ProjetoRepository projetoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TagRepository tagRepository;
    private final HistoricoService historicoService;
    private final NotificacaoService notificacaoService;
    private final AutenticacaoService autenticacaoService;

    public TarefaService(TarefaRepository tarefaRepository,
                         ProjetoRepository projetoRepository,
                         UsuarioRepository usuarioRepository,
                         TagRepository tagRepository,
                         HistoricoService historicoService,
                         NotificacaoService notificacaoService,
                         AutenticacaoService autenticacaoService) {
        this.tarefaRepository = tarefaRepository;
        this.projetoRepository = projetoRepository;
        this.usuarioRepository = usuarioRepository;
        this.tagRepository = tagRepository;
        this.historicoService = historicoService;
        this.notificacaoService = notificacaoService;
        this.autenticacaoService = autenticacaoService;
    }

    public TarefaResponseDTO criar(TarefaRequestDTO dto, Long projetoId, Long responsavelId) {

        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado"));

        Usuario usuario = usuarioRepository.findById(responsavelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        Tarefa tarefa = new Tarefa();
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setStatus(dto.getStatus());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setProjeto(projeto);
        tarefa.setResponsavel(usuario);
        tarefa.setTags(buscarTags(dto.getTagIds()));
        tarefa.setDependencias(buscarDependencias(dto.getDependenciaIds()));

        if (tarefa.getStatus() == StatusTarefa.CONCLUIDO) {
            validarDependenciasConcluidas(tarefa.getDependencias());
        }

        Tarefa salva = tarefaRepository.save(tarefa);

        Usuario autor = autenticacaoService.usuarioAutenticado();
        historicoService.registrar(salva, autor, "Tarefa criada");

        if (!usuario.getId().equals(autor.getId())) {
            notificacaoService.criar(usuario, "Você foi atribuído à tarefa '" + salva.getTitulo() + "'.", salva);
        }

        return toResponseDTO(salva);
    }

    public List<TarefaResponseDTO> listarTodas() {
        return tarefaRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<TarefaResponseDTO> listarPorProjeto(Long projetoId) {
        return tarefaRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<TarefaResponseDTO> listarPorResponsavel(Long usuarioId) {
        return tarefaRepository.findByResponsavelId(usuarioId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public TarefaResponseDTO atualizar(Long id, TarefaRequestDTO dto) {

        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        StatusTarefa statusAnterior = tarefa.getStatus();

        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setStatus(dto.getStatus());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setTags(buscarTags(dto.getTagIds()));

        List<Tarefa> dependencias = buscarDependencias(dto.getDependenciaIds());
        if (dependencias.stream().anyMatch(dep -> dep.getId().equals(id))) {
            throw new ValidacaoException("Uma tarefa não pode depender de si mesma.");
        }
        tarefa.setDependencias(dependencias);

        if (tarefa.getStatus() == StatusTarefa.CONCLUIDO) {
            validarDependenciasConcluidas(tarefa.getDependencias());
        }

        Tarefa salva = tarefaRepository.save(tarefa);

        Usuario autor = autenticacaoService.usuarioAutenticado();
        if (!Objects.equals(statusAnterior, salva.getStatus())) {
            historicoService.registrar(salva, autor,
                    "Status alterado de '" + statusAnterior + "' para '" + salva.getStatus() + "'");
        } else {
            historicoService.registrar(salva, autor, "Tarefa atualizada");
        }

        return toResponseDTO(salva);
    }

    public TarefaResponseDTO trocarResponsavel(Long id, Long novoResponsavelId) {

        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario responsavelAnterior = tarefa.getResponsavel();

        Usuario novoResponsavel = usuarioRepository.findById(novoResponsavelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        tarefa.setResponsavel(novoResponsavel);

        Tarefa salva = tarefaRepository.save(tarefa);

        Usuario autor = autenticacaoService.usuarioAutenticado();
        historicoService.registrar(salva, autor,
                "Responsável alterado de '" + responsavelAnterior.getNome() + "' para '" + novoResponsavel.getNome() + "'");

        if (!novoResponsavel.getId().equals(autor.getId())) {
            notificacaoService.criar(novoResponsavel, "Você foi atribuído à tarefa '" + salva.getTitulo() + "'.", salva);
        }

        return toResponseDTO(salva);
    }

    public void excluir(Long id) {
        tarefaRepository.deleteById(id);
    }

    private List<Tag> buscarTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(tagRepository.findByIdIn(tagIds));
    }

    private List<Tarefa> buscarDependencias(List<Long> dependenciaIds) {
        if (dependenciaIds == null || dependenciaIds.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(tarefaRepository.findAllById(dependenciaIds));
    }

    private void validarDependenciasConcluidas(List<Tarefa> dependencias) {
        List<String> pendentes = dependencias.stream()
                .filter(dep -> dep.getStatus() != StatusTarefa.CONCLUIDO)
                .map(Tarefa::getTitulo)
                .toList();

        if (!pendentes.isEmpty()) {
            throw new ValidacaoException(
                    "Não é possível concluir: existem dependências pendentes (" + String.join(", ", pendentes) + ")");
        }
    }

    private TarefaResponseDTO toResponseDTO(Tarefa tarefa) {
        TarefaResponseDTO dto = new TarefaResponseDTO();
        dto.setId(tarefa.getId());
        dto.setTitulo(tarefa.getTitulo());
        dto.setDescricao(tarefa.getDescricao());
        dto.setStatus(tarefa.getStatus());
        dto.setPrioridade(tarefa.getPrioridade());
        dto.setPrazo(tarefa.getPrazo());
        dto.setProjetoId(tarefa.getProjeto().getId());
        dto.setResponsavelId(tarefa.getResponsavel().getId());
        dto.setTags(tarefa.getTags().stream().map(this::toTagResponseDTO).toList());
        dto.setDependencias(tarefa.getDependencias().stream().map(this::toResumoDTO).toList());
        return dto;
    }

    private TagResponseDTO toTagResponseDTO(Tag tag) {
        TagResponseDTO dto = new TagResponseDTO();
        dto.setId(tag.getId());
        dto.setNome(tag.getNome());
        dto.setCor(tag.getCor());
        return dto;
    }

    private TarefaResumoDTO toResumoDTO(Tarefa tarefa) {
        TarefaResumoDTO dto = new TarefaResumoDTO();
        dto.setId(tarefa.getId());
        dto.setTitulo(tarefa.getTitulo());
        dto.setStatus(tarefa.getStatus());
        return dto;
    }
}
