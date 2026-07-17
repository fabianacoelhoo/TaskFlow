package com.taskflow.backend.dto.github;

public record CommitGithubDTO(String sha, String mensagem, String autor, String data, String url) {
}
