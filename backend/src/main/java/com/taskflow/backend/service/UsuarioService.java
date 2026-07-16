package com.taskflow.backend.service;

import com.taskflow.backend.dto.usuario.UsuarioRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;


    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }


    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dto) {

        Usuario usuario = new Usuario();

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());

        Usuario salvo = usuarioRepository.save(usuario);


        UsuarioResponseDTO resposta = new UsuarioResponseDTO();

        resposta.setId(salvo.getId());
        resposta.setNome(salvo.getNome());
        resposta.setEmail(salvo.getEmail());


        return resposta;
    }
}