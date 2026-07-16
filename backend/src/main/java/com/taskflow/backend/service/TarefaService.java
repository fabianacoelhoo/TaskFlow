package com.taskflow.backend.service;

import com.taskflow.backend.dto.tarefa.TarefaRequestDTO;
import com.taskflow.backend.dto.tarefa.TarefaResponseDTO;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.ProjetoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final ProjetoRepository projetoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistoricoService historicoService;
    private final AutenticacaoService autenticacaoService;

    public TarefaService(TarefaRepository tarefaRepository,
                         ProjetoRepository projetoRepository,
                         UsuarioRepository usuarioRepository,
                         HistoricoService historicoService,
                         AutenticacaoService autenticacaoService) {
        this.tarefaRepository = tarefaRepository;
        this.projetoRepository = projetoRepository;
        this.usuarioRepository = usuarioRepository;
        this.historicoService = historicoService;
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

        Tarefa salva = tarefaRepository.save(tarefa);

        historicoService.registrar(salva, autenticacaoService.usuarioAutenticado(), "Tarefa criada");

        return toResponseDTO(salva);
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

        historicoService.registrar(salva, autenticacaoService.usuarioAutenticado(),
                "Responsável alterado de '" + responsavelAnterior.getNome() + "' para '" + novoResponsavel.getNome() + "'");

        return toResponseDTO(salva);
    }

    public void excluir(Long id) {
        tarefaRepository.deleteById(id);
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
        return dto;
    }
}
