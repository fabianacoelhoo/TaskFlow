package com.taskflow.backend.dto.sprint;

import java.time.LocalDate;

public record PontoBurndownDTO(LocalDate data, int pontos) {
}
