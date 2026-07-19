package com.taskflow.backend.service;

import com.taskflow.backend.entity.TokenRedefinicaoSenha;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.TokenRedefinicaoSenhaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RedefinicaoSenhaService {

    private static final Logger log = LoggerFactory.getLogger(RedefinicaoSenhaService.class);

    private final UsuarioRepository usuarioRepository;
    private final TokenRedefinicaoSenhaRepository tokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public RedefinicaoSenhaService(UsuarioRepository usuarioRepository,
                                    TokenRedefinicaoSenhaRepository tokenRepository,
                                    BCryptPasswordEncoder passwordEncoder,
                                    JavaMailSender mailSender,
                                    @Value("${app.frontend-url}") String frontendUrl) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Nunca lança exceção nem revela se o e-mail existe: tanto "usuário não encontrado" quanto
     * "falha ao enviar o e-mail" terminam do mesmo jeito silencioso pro chamador.
     */
    public void solicitar(String email) {
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            try {
                criarTokenEEnviarEmail(usuario);
            } catch (Exception e) {
                log.warn("Falha ao enviar e-mail de redefinição de senha para {}: {}", usuario.getEmail(), e.getMessage());
            }
        });
    }

    private void criarTokenEEnviarEmail(Usuario usuario) {
        List<TokenRedefinicaoSenha> antigos = tokenRepository.findByUsuarioIdAndUsadoFalse(usuario.getId());
        tokenRepository.deleteAll(antigos);

        TokenRedefinicaoSenha token = new TokenRedefinicaoSenha();
        token.setUsuario(usuario);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiraEm(LocalDateTime.now().plusHours(1));
        token.setUsado(false);
        tokenRepository.save(token);

        String link = frontendUrl + "/redefinir-senha?token=" + token.getToken();

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(usuario.getEmail());
        mensagem.setSubject("Redefinir sua senha no TaskFlow");
        mensagem.setText("Olá, " + usuario.getNome() + "!\n\n"
                + "Recebemos um pedido para redefinir sua senha no TaskFlow. Clique no link abaixo "
                + "para criar uma nova senha:\n\n"
                + link + "\n\n"
                + "Esse link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail.");

        mailSender.send(mensagem);
    }

    public void redefinir(String token, String novaSenha) {
        TokenRedefinicaoSenha tokenEntity = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ValidacaoException("Link inválido ou expirado."));

        if (tokenEntity.isUsado() || tokenEntity.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new ValidacaoException("Link inválido ou expirado.");
        }

        Usuario usuario = tokenEntity.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        tokenEntity.setUsado(true);
        tokenRepository.save(tokenEntity);
    }
}
