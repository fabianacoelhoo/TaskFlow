package com.taskflow.backend.dto.automacao;

import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.TipoAcaoAutomacao;
import lombok.Data;

@Data
public class AcaoAutomacaoResponseDTO {

    private Long id;
    private TipoAcaoAutomacao tipo;
    private String mensagem;
    private StatusTarefa statusDestino;
    private Long tagId;
    private String tagNome;

}
