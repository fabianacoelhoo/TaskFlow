package com.taskflow.backend.dto.ai;

import java.util.List;

public record AnaliseRiscoGerada(List<AlertaRiscoGerado> alertas) {

    public record AlertaRiscoGerado(Long tarefaId, String mensagem) {
    }
}
