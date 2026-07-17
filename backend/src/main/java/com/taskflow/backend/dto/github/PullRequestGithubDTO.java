package com.taskflow.backend.dto.github;

public record PullRequestGithubDTO(int numero, String titulo, String estado, String autor, String url) {
}
