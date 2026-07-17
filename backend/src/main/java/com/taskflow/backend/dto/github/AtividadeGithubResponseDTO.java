package com.taskflow.backend.dto.github;

import java.util.List;

public record AtividadeGithubResponseDTO(
        List<BranchGithubDTO> branches,
        List<CommitGithubDTO> commits,
        List<PullRequestGithubDTO> pullRequests
) {
}
