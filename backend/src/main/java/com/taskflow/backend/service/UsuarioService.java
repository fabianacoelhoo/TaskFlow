package com.taskflow.backend.service;

import com.taskflow.backend.dto.usuario.UsuarioPerfilRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AutenticacaoService autenticacaoService;

    public UsuarioService(UsuarioRepository usuarioRepository, AutenticacaoService autenticacaoService) {
        this.usuarioRepository = usuarioRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public List<UsuarioResponseDTO> listarUsuarios() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        return usuarioRepository.findByEmpresaId(autor.getEmpresa().getId()).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UsuarioResponseDTO alterarPapel(Long id, Papel novoPapel, Usuario autor) {
        if (autor.getPapel() != Papel.ADMIN) {
            throw new AcessoNegadoException("Apenas administradores podem alterar papéis.");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!usuario.getEmpresa().getId().equals(autor.getEmpresa().getId())) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }

        usuario.setPapel(novoPapel);

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO atualizarPerfil(Usuario autor, UsuarioPerfilRequestDTO dto) {
        autor.setCargo(dto.getCargo());
        autor.setDisponibilidade(dto.getDisponibilidade());
        autor.setHabilidades(dto.getHabilidades() != null ? new ArrayList<>(dto.getHabilidades()) : new ArrayList<>());

        return toResponseDTO(usuarioRepository.save(autor));
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPapel(usuario.getPapel());
        dto.setCargo(usuario.getCargo());
        dto.setDisponibilidade(usuario.getDisponibilidade());
        dto.setHabilidades(usuario.getHabilidades());
        return dto;
    }
}
