package com.taskflow.backend.dto.auth;

import lombok.Data;

@Data
public class RegistrarEmpresaRequestDTO {

    private String nomeEmpresa;

    private String nome;

    private String email;

    private String senha;

}
