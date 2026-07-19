package com.taskflow.backend.dto.auth;

import lombok.Data;

@Data
public class RedefinirSenhaRequestDTO {

    private String token;
    private String novaSenha;

}
