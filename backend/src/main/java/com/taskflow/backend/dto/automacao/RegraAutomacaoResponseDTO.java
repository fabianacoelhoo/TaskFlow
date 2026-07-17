package com.taskflow.backend.dto.automacao;

import com.taskflow.backend.entity.StatusTarefa;
import lombok.Data;

import java.util.List;

@Data
public class RegraAutomacaoResponseDTO {

    private Long id;
    private String nome;
    private Long projetoId;
    private StatusTarefa statusGatilho;
    private boolean ativa;
    private List<AcaoAutomacaoResponseDTO> acoes;

}
