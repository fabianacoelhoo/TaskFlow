package com.taskflow.backend.dto.ai;

import com.taskflow.backend.dto.epico.EpicoResponseDTO;
import com.taskflow.backend.dto.historiausuario.HistoriaUsuarioResponseDTO;

import java.util.List;

public record PlanoBacklogResponseDTO(
        EpicoResponseDTO epico,
        List<HistoriaUsuarioResponseDTO> historias,
        List<String> riscos
) {
}
