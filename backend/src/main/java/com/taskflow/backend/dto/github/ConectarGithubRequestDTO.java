package com.taskflow.backend.dto.github;

import lombok.Data;

@Data
public class ConectarGithubRequestDTO {

    private String repositorioOwner;
    private String repositorioNome;
    private String tokenAcesso;

}
