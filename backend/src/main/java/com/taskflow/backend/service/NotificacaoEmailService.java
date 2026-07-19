package com.taskflow.backend.service;

import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificacaoEmailService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoEmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public NotificacaoEmailService(JavaMailSender mailSender,
                                    @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Roda em thread separada (via @Async) para não atrasar a requisição que disparou a
     * notificação — em fluxos como a análise de riscos, várias notificações podem ser
     * criadas em sequência na mesma chamada. Nunca lança exceção: falha de e-mail (SMTP
     * fora do ar, cota, etc.) não pode afetar a notificação já salva no app.
     */
    @Async
    public void enviar(Usuario destinatario, String mensagem, Tarefa tarefaRelacionada) {
        try {
            StringBuilder corpo = new StringBuilder();
            corpo.append("Olá, ").append(destinatario.getNome()).append("!\n\n");
            corpo.append(mensagem).append("\n");
            if (tarefaRelacionada != null) {
                corpo.append("\nVeja no TaskFlow: ").append(frontendUrl)
                        .append("/projetos/").append(tarefaRelacionada.getProjeto().getId())
                        .append("?tarefaId=").append(tarefaRelacionada.getId());
            }

            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(destinatario.getEmail());
            email.setSubject("TaskFlow: nova notificação");
            email.setText(corpo.toString());
            mailSender.send(email);
        } catch (Exception e) {
            log.warn("Falha ao enviar e-mail de notificação para {}: {}", destinatario.getEmail(), e.getMessage());
        }
    }
}
