package com.taskflow.backend.service;

import com.taskflow.backend.dto.tag.TagResponseDTO;
import com.taskflow.backend.dto.tarefa.TarefaRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.dto.tarefa.TarefaResumoDTO;
import com.taskflow.backend.entity.HistoriaUsuario;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tag;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.HistoriaUsuarioRepository;
import com.taskflow.backend.repository.TagRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final ProjetoService projetoService;
    private final UsuarioRepository usuarioRepository;
    private final TagRepository tagRepository;
    private final HistoriaUsuarioRepository historiaUsuarioRepository;
    private final HistoricoService historicoService;
    private final NotificacaoService notificacaoService;
    private final AutomacaoExecutorService automacaoExecutorService;
    private final AutenticacaoService autenticacaoService;

    public TarefaService(TarefaRepository tarefaRepository,
                         ProjetoService projetoService,
                         UsuarioRepository usuarioRepository,
                         TagRepository tagRepository,
                         HistoriaUsuarioRepository historiaUsuarioRepository,
                         HistoricoService historicoService,
                         NotificacaoService notificacaoService,
                         AutomacaoExecutorService automacaoExecutorService,
                         AutenticacaoService autenticacaoService) {
        this.tarefaRepository = tarefaRepository;
        this.projetoService = projetoService;
        this.usuarioRepository = usuarioRepository;
        this.tagRepository = tagRepository;
        this.historiaUsuarioRepository = historiaUsuarioRepository;
        this.historicoService = historicoService;
        this.notificacaoService = notificacaoService;
        this.automacaoExecutorService = automacaoExecutorService;
        this.autenticacaoService = autenticacaoService;
    }

    public TarefaResponseDTO criar(TarefaRequestDTO dto, Long projetoId, Long responsavelId) {

        Projeto projeto = projetoService.buscarPorId(projetoId);

        Usuario usuario = usuarioRepository.findById(responsavelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!usuario.getEmpresa().getId().equals(projeto.getEmpresa().getId())) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }

        Tarefa tarefa = new Tarefa();
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setStatus(dto.getStatus());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setProjeto(projeto);
        tarefa.setResponsavel(usuario);
        tarefa.setTags(buscarTags(dto.getTagIds(), projeto.getEmpresa().getId()));
        tarefa.setDependencias(buscarDependencias(dto.getDependenciaIds(), projeto.getEmpresa().getId()));
        tarefa.setHistoriaUsuario(buscarHistoria(dto.getHistoriaUsuarioId(), projeto.getId()));

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
        Usuario autor = autenticacaoService.usuarioAutenticado();
        List<Long> projetoIds = projetoService.listarProjetosAcessiveis(autor).stream()
                .map(Projeto::getId)
                .toList();

        return tarefaRepository.findByProjetoIdIn(projetoIds).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<TarefaResponseDTO> listarPorProjeto(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return tarefaRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<TarefaResponseDTO> listarPorResponsavel(Long usuarioId) {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        List<Long> projetoIds = projetoService.listarProjetosAcessiveis(autor).stream()
                .map(Projeto::getId)
                .toList();

        return tarefaRepository.findByResponsavelId(usuarioId).stream()
                .filter(t -> projetoIds.contains(t.getProjeto().getId()))
                .map(this::toResponseDTO)
                .toList();
    }

    public TarefaResponseDTO atualizar(Long id, TarefaRequestDTO dto) {

        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, tarefa.getProjeto());

        StatusTarefa statusAnterior = tarefa.getStatus();

        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setStatus(dto.getStatus());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setTags(buscarTags(dto.getTagIds(), tarefa.getProjeto().getEmpresa().getId()));

        List<Tarefa> dependencias = buscarDependencias(dto.getDependenciaIds(), tarefa.getProjeto().getEmpresa().getId());
        if (dependencias.stream().anyMatch(dep -> dep.getId().equals(id))) {
            throw new ValidacaoException("Uma tarefa não pode depender de si mesma.");
        }
        tarefa.setDependencias(dependencias);
        tarefa.setHistoriaUsuario(buscarHistoria(dto.getHistoriaUsuarioId(), tarefa.getProjeto().getId()));

        if (tarefa.getStatus() == StatusTarefa.CONCLUIDO) {
            validarDependenciasConcluidas(tarefa.getDependencias());
        }

        Tarefa salva = tarefaRepository.save(tarefa);

        if (!Objects.equals(statusAnterior, salva.getStatus())) {
            historicoService.registrar(salva, autor,
                    "Status alterado de '" + statusAnterior + "' para '" + salva.getStatus() + "'");
            automacaoExecutorService.executar(salva, autor);
        } else {
            historicoService.registrar(salva, autor, "Tarefa atualizada");
        }

        return toResponseDTO(salva);
    }

    public TarefaResponseDTO trocarResponsavel(Long id, Long novoResponsavelId) {

        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, tarefa.getProjeto());

        Usuario responsavelAnterior = tarefa.getResponsavel();

        Usuario novoResponsavel = usuarioRepository.findById(novoResponsavelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!novoResponsavel.getEmpresa().getId().equals(tarefa.getProjeto().getEmpresa().getId())) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }

        tarefa.setResponsavel(novoResponsavel);

        Tarefa salva = tarefaRepository.save(tarefa);

        historicoService.registrar(salva, autor,
                "Responsável alterado de '" + responsavelAnterior.getNome() + "' para '" + novoResponsavel.getNome() + "'");

        if (!novoResponsavel.getId().equals(autor.getId())) {
            notificacaoService.criar(novoResponsavel, "Você foi atribuído à tarefa '" + salva.getTitulo() + "'.", salva);
        }

        return toResponseDTO(salva);
    }

    public void excluir(Long id) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, tarefa.getProjeto());

        tarefaRepository.delete(tarefa);
    }

    private List<Tag> buscarTags(List<Long> tagIds, Long empresaId) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new ArrayList<>();
        }
        return tagRepository.findByIdIn(tagIds).stream()
                .filter(tag -> tag.getEmpresa().getId().equals(empresaId))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private HistoriaUsuario buscarHistoria(Long historiaUsuarioId, Long projetoId) {
        if (historiaUsuarioId == null) {
            return null;
        }
        HistoriaUsuario historia = historiaUsuarioRepository.findById(historiaUsuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("História não encontrada"));
        if (!historia.getProjeto().getId().equals(projetoId)) {
            throw new RecursoNaoEncontradoException("História não encontrada");
        }
        return historia;
    }

    private List<Tarefa> buscarDependencias(List<Long> dependenciaIds, Long empresaId) {
        if (dependenciaIds == null || dependenciaIds.isEmpty()) {
            return new ArrayList<>();
        }
        return tarefaRepository.findAllById(dependenciaIds).stream()
                .filter(dep -> dep.getProjeto().getEmpresa().getId().equals(empresaId))
                .collect(Collectors.toCollection(ArrayList::new));
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
        dto.setHistoriaUsuarioId(tarefa.getHistoriaUsuario() != null ? tarefa.getHistoriaUsuario().getId() : null);
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
