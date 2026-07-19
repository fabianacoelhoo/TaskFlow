package com.taskflow.backend.service;

import com.taskflow.backend.dto.pesquisa.ResultadoPesquisaDTO;
import com.taskflow.backend.entity.DocumentoProjeto;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.DocumentoProjetoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PesquisaService {

    private static final int LIMITE_POR_CATEGORIA = 8;

    private final ProjetoService projetoService;
    private final TarefaRepository tarefaRepository;
    private final DocumentoProjetoRepository documentoProjetoRepository;
    private final AutenticacaoService autenticacaoService;

    public PesquisaService(ProjetoService projetoService,
                            TarefaRepository tarefaRepository,
                            DocumentoProjetoRepository documentoProjetoRepository,
                            AutenticacaoService autenticacaoService) {
        this.projetoService = projetoService;
        this.tarefaRepository = tarefaRepository;
        this.documentoProjetoRepository = documentoProjetoRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public List<ResultadoPesquisaDTO> pesquisar(String termo) {
        if (termo == null || termo.trim().length() < 2) {
            return List.of();
        }
        String q = termo.trim().toLowerCase(Locale.ROOT);

        Usuario autor = autenticacaoService.usuarioAutenticado();
        List<Projeto> projetosAcessiveis = projetoService.listarProjetosAcessiveis(autor);
        List<Long> projetoIds = projetosAcessiveis.stream().map(Projeto::getId).toList();

        List<ResultadoPesquisaDTO> resultados = new ArrayList<>();

        projetosAcessiveis.stream()
                .filter(p -> contem(p.getNome(), q) || contem(p.getDescricao(), q))
                .limit(LIMITE_POR_CATEGORIA)
                .forEach(p -> resultados.add(toProjetoDTO(p)));

        tarefaRepository.findByProjetoIdIn(projetoIds).stream()
                .filter(t -> contem(t.getTitulo(), q) || contem(t.getDescricao(), q))
                .limit(LIMITE_POR_CATEGORIA)
                .forEach(t -> resultados.add(toTarefaDTO(t)));

        documentoProjetoRepository.findByProjetoIdIn(projetoIds).stream()
                .filter(d -> contem(d.getTitulo(), q) || contem(d.getConteudo(), q))
                .limit(LIMITE_POR_CATEGORIA)
                .forEach(d -> resultados.add(toDocumentoDTO(d)));

        return resultados;
    }

    private boolean contem(String texto, String q) {
        return texto != null && texto.toLowerCase(Locale.ROOT).contains(q);
    }

    private ResultadoPesquisaDTO toProjetoDTO(Projeto projeto) {
        ResultadoPesquisaDTO dto = new ResultadoPesquisaDTO();
        dto.setTipo("PROJETO");
        dto.setId(projeto.getId());
        dto.setTitulo(projeto.getNome());
        dto.setTrecho(trecho(projeto.getDescricao()));
        dto.setProjetoId(projeto.getId());
        dto.setProjetoNome(projeto.getNome());
        return dto;
    }

    private ResultadoPesquisaDTO toTarefaDTO(Tarefa tarefa) {
        ResultadoPesquisaDTO dto = new ResultadoPesquisaDTO();
        dto.setTipo("TAREFA");
        dto.setId(tarefa.getId());
        dto.setTitulo(tarefa.getTitulo());
        dto.setTrecho(trecho(tarefa.getDescricao()));
        dto.setProjetoId(tarefa.getProjeto().getId());
        dto.setProjetoNome(tarefa.getProjeto().getNome());
        return dto;
    }

    private ResultadoPesquisaDTO toDocumentoDTO(DocumentoProjeto documento) {
        ResultadoPesquisaDTO dto = new ResultadoPesquisaDTO();
        dto.setTipo("DOCUMENTO");
        dto.setId(documento.getId());
        dto.setTitulo(documento.getTitulo());
        dto.setTrecho(trecho(documento.getConteudo()));
        dto.setProjetoId(documento.getProjeto().getId());
        dto.setProjetoNome(documento.getProjeto().getNome());
        return dto;
    }

    private String trecho(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        String limpo = texto.strip();
        return limpo.length() > 120 ? limpo.substring(0, 120) + "…" : limpo;
    }
}
