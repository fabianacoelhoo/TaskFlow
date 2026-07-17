package com.taskflow.backend.service;

import com.taskflow.backend.dto.projeto.ProjetoRequestDTO;
import com.taskflow.backend.dto.projeto.ProjetoResponseDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.ProjetoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjetoService {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AutenticacaoService autenticacaoService;

    public ProjetoService(ProjetoRepository projetoRepository,
                           TarefaRepository tarefaRepository,
                           UsuarioRepository usuarioRepository,
                           AutenticacaoService autenticacaoService) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
        this.usuarioRepository = usuarioRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public ProjetoResponseDTO criarProjeto(ProjetoRequestDTO dto) {

        Usuario autor = autenticacaoService.usuarioAutenticado();

        Projeto projeto = new Projeto();
        projeto.setNome(dto.getNome());
        projeto.setDescricao(dto.getDescricao());
        projeto.setEmpresa(autor.getEmpresa());
        projeto.setCriadoPor(autor);
        projeto.getMembros().add(autor);

        return toResponseDTO(projetoRepository.save(projeto));
    }

    public List<ProjetoResponseDTO> listarProjetos() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        return listarProjetosAcessiveis(autor).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    /**
     * ADMIN da empresa enxerga todos os projetos; MEMBRO só os que integra.
     */
    public List<Projeto> listarProjetosAcessiveis(Usuario autor) {
        return autor.getPapel() == Papel.ADMIN
                ? projetoRepository.findByEmpresaId(autor.getEmpresa().getId())
                : projetoRepository.findByEmpresaIdAndMembrosId(autor.getEmpresa().getId(), autor.getId());
    }

    public Projeto buscarPorId(Long id) {
        Usuario autor = autenticacaoService.usuarioAutenticado();

        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado."));

        verificarAcesso(autor, projeto);

        return projeto;
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

        Usuario autor = autenticacaoService.usuarioAutenticado();
        Projeto projeto = buscarPorId(id);

        if (!podeGerenciarMembros(autor, projeto)) {
            throw new AcessoNegadoException("Apenas o administrador da empresa ou o dono do projeto podem excluí-lo.");
        }

        projetoRepository.delete(projeto);
    }

    public ProjetoResponseDTO adicionarMembro(Long id, Long usuarioId) {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        Projeto projeto = buscarPorId(id);

        if (!podeGerenciarMembros(autor, projeto)) {
            throw new AcessoNegadoException("Apenas o administrador da empresa ou o dono do projeto podem gerenciar membros.");
        }

        Usuario novoMembro = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!novoMembro.getEmpresa().getId().equals(projeto.getEmpresa().getId())) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }

        if (projeto.getMembros().stream().noneMatch(m -> m.getId().equals(novoMembro.getId()))) {
            projeto.getMembros().add(novoMembro);
        }

        return toResponseDTO(projetoRepository.save(projeto));
    }

    public ProjetoResponseDTO removerMembro(Long id, Long usuarioId) {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        Projeto projeto = buscarPorId(id);

        if (!podeGerenciarMembros(autor, projeto)) {
            throw new AcessoNegadoException("Apenas o administrador da empresa ou o dono do projeto podem gerenciar membros.");
        }

        if (projeto.getCriadoPor() != null && projeto.getCriadoPor().getId().equals(usuarioId)) {
            throw new ValidacaoException("O dono do projeto não pode ser removido dos membros.");
        }

        projeto.getMembros().removeIf(m -> m.getId().equals(usuarioId));

        return toResponseDTO(projetoRepository.save(projeto));
    }

    /**
     * Nunca lança AcessoNegadoException aqui: se o projeto é de outra empresa ou o
     * usuário não é membro, respondemos como se ele não existisse, para não revelar
     * a existência de recursos de terceiros.
     */
    public void verificarAcesso(Usuario usuario, Projeto projeto) {
        boolean mesmaEmpresa = projeto.getEmpresa().getId().equals(usuario.getEmpresa().getId());
        boolean membro = mesmaEmpresa && (usuario.getPapel() == Papel.ADMIN
                || projeto.getMembros().stream().anyMatch(m -> m.getId().equals(usuario.getId())));

        if (!membro) {
            throw new RecursoNaoEncontradoException("Projeto não encontrado.");
        }
    }

    private boolean podeGerenciarMembros(Usuario autor, Projeto projeto) {
        return autor.getPapel() == Papel.ADMIN
                || (projeto.getCriadoPor() != null && projeto.getCriadoPor().getId().equals(autor.getId()));
    }

    private ProjetoResponseDTO toResponseDTO(Projeto projeto) {
        ProjetoResponseDTO dto = new ProjetoResponseDTO();
        dto.setId(projeto.getId());
        dto.setNome(projeto.getNome());
        dto.setDescricao(projeto.getDescricao());
        dto.setTotalTarefas(tarefaRepository.countByProjetoId(projeto.getId()));
        dto.setTarefasConcluidas(tarefaRepository.countByProjetoIdAndStatus(projeto.getId(), StatusTarefa.CONCLUIDO));
        dto.setCriadoPorId(projeto.getCriadoPor() != null ? projeto.getCriadoPor().getId() : null);
        dto.setMembros(projeto.getMembros().stream().map(this::toUsuarioResponseDTO).toList());
        return dto;
    }

    private UsuarioResponseDTO toUsuarioResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPapel(usuario.getPapel());
        return dto;
    }
}
