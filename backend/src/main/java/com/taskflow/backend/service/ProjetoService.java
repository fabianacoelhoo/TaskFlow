package com.taskflow.backend.service;

import com.taskflow.backend.dto.projeto.ProjetoRequestDTO;
import com.taskflow.backend.dto.projeto.ProjetoResponseDTO;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.ProjetoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjetoService {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;
    private final AutenticacaoService autenticacaoService;

    public ProjetoService(ProjetoRepository projetoRepository,
                           TarefaRepository tarefaRepository,
                           AutenticacaoService autenticacaoService) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public ProjetoResponseDTO criarProjeto(ProjetoRequestDTO dto) {

        Projeto projeto = new Projeto();

        projeto.setNome(dto.getNome());
        projeto.setDescricao(dto.getDescricao());

        Projeto salvo = projetoRepository.save(projeto);

        ProjetoResponseDTO resposta = new ProjetoResponseDTO();

        resposta.setId(salvo.getId());
        resposta.setNome(salvo.getNome());
        resposta.setDescricao(salvo.getDescricao());

        return resposta;
    }

    public List<ProjetoResponseDTO> listarProjetos() {
        return projetoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public Projeto buscarPorId(Long id) {
        return projetoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado."));
    }

    public ProjetoResponseDTO buscarDTOPorId(Long id) {
        return toResponseDTO(buscarPorId(id));
    }

    public ProjetoResponseDTO atualizar(Long id, ProjetoRequestDTO dto) {

        Projeto projeto = buscarPorId(id);

        projeto.setNome(dto.getNome());
        projeto.setDescricao(dto.getDescricao());

        return toResponseDTO(projetoRepository.save(projeto));
    }

    public void excluir(Long id) {

        if (autenticacaoService.usuarioAutenticado().getPapel() != Papel.ADMIN) {
            throw new AcessoNegadoException("Apenas administradores podem excluir projetos.");
        }

        Projeto projeto = buscarPorId(id);

        projetoRepository.delete(projeto);
    }

    private ProjetoResponseDTO toResponseDTO(Projeto projeto) {
        ProjetoResponseDTO dto = new ProjetoResponseDTO();
        dto.setId(projeto.getId());
        dto.setNome(projeto.getNome());
        dto.setDescricao(projeto.getDescricao());
        dto.setTotalTarefas(tarefaRepository.countByProjetoId(projeto.getId()));
        dto.setTarefasConcluidas(tarefaRepository.countByProjetoIdAndStatus(projeto.getId(), StatusTarefa.CONCLUIDO));
        return dto;
    }
}