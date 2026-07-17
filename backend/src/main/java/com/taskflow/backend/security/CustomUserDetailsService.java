package com.taskflow.backend.security;

import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuário não encontrado."));

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities("ROLE_" + usuario.getPapel())
                .build();
    }
}