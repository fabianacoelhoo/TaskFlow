package com.taskflow.backend.service;

import com.taskflow.backend.dto.usuario.UsuarioRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import com.taskflow.backend.exception.EmailJaCadastradoException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;


    public UsuarioService(
        UsuarioRepository usuarioRepository,
        BCryptPasswordEncoder passwordEncoder) {

    this.usuarioRepository = usuarioRepository;
    this.passwordEncoder = passwordEncoder;
}


    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dto) {

    if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
        throw new EmailJaCadastradoException("Email já cadastrado.");
    }

    Usuario usuario = new Usuario();

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        // Enquanto não existir nenhum ADMIN no sistema, o próximo usuário criado
        // assume o papel automaticamente (bootstrap); depois disso, entra como MEMBRO.
        usuario.setPapel(usuarioRepository.existsByPapel(Papel.ADMIN) ? Papel.MEMBRO : Papel.ADMIN);

        Usuario salvo = usuarioRepository.save(usuario);

        return toResponseDTO(salvo);
    }

    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UsuarioResponseDTO alterarPapel(Long id, Papel novoPapel, Usuario autor) {
        // Se já existe um ADMIN no sistema, só um ADMIN pode promover/rebaixar.
        // Enquanto não existir nenhum, qualquer autenticado pode assumir o papel
        // (mesma lógica de bootstrap usada no cadastro).
        if (usuarioRepository.existsByPapel(Papel.ADMIN) && autor.getPapel() != Papel.ADMIN) {
            throw new AcessoNegadoException("Apenas administradores podem alterar papéis.");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        usuario.setPapel(novoPapel);

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPapel(usuario.getPapel());
        return dto;
    }
}
