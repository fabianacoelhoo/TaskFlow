package com.taskflow.backend.service;

import com.taskflow.backend.dto.usuario.UsuarioRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import com.taskflow.backend.exception.EmailJaCadastradoException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
        
        Usuario salvo = usuarioRepository.save(usuario);


        UsuarioResponseDTO resposta = new UsuarioResponseDTO();

        resposta.setId(salvo.getId());
        resposta.setNome(salvo.getNome());
        resposta.setEmail(salvo.getEmail());


        return resposta;
    }
}