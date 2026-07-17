package com.taskflow.backend.dto.sprint;

import java.util.List;

public record BurndownResponseDTO(
        int totalPontos,
        List<PontoBurndownDTO> linhaIdeal,
        List<PontoBurndownDTO> real
) {
}
