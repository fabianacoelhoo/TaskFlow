package com.taskflow.backend.dto.automacao;

import com.taskflow.backend.entity.StatusTarefa;
import lombok.Data;

import java.util.List;

@Data
public class RegraAutomacaoRequestDTO {

    private String nome;
    private StatusTarefa statusGatilho;
    private boolean ativa = true;
    private List<AcaoAutomacaoRequestDTO> acoes;

}
