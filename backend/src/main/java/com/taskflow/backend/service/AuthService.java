package com.taskflow.backend.service;

import com.taskflow.backend.dto.auth.LoginRequestDTO;
import com.taskflow.backend.dto.auth.LoginResponseDTO;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.taskflow.backend.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                   BCryptPasswordEncoder passwordEncoder,
                   JwtService jwtService) {

    this.usuarioRepository = usuarioRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}

    public LoginResponseDTO login(LoginRequestDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos."));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Email ou senha inválidos.");
        }

        String token = jwtService.gerarToken(usuario.getEmail());

        return new LoginResponseDTO(token);
    }
}