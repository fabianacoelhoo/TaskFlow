package com.taskflow.backend.dto.auth;

import lombok.Data;

@Data
public class RegistrarComCodigoRequestDTO {

    private String codigoConvite;

    private String nome;

    private String email;

    private String senha;

}
