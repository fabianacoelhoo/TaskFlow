package com.taskflow.backend.service;

import com.taskflow.backend.dto.automacao.AcaoAutomacaoRequestDTO;
import com.taskflow.backend.dto.automacao.AcaoAutomacaoResponseDTO;
import com.taskflow.backend.dto.automacao.RegraAutomacaoRequestDTO;
import com.taskflow.backend.dto.automacao.RegraAutomacaoResponseDTO;
import com.taskflow.backend.entity.AcaoAutomacao;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.RegraAutomacao;
import com.taskflow.backend.entity.Tag;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.RegraAutomacaoRepository;
import com.taskflow.backend.repository.TagRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RegraAutomacaoService {

    private final RegraAutomacaoRepository regraRepository;
    private final TagRepository tagRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public RegraAutomacaoService(RegraAutomacaoRepository regraRepository,
                                  TagRepository tagRepository,
                                  ProjetoService projetoService,
                                  AutenticacaoService autenticacaoService) {
        this.regraRepository = regraRepository;
        this.tagRepository = tagRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public RegraAutomacaoResponseDTO criar(Long projetoId, RegraAutomacaoRequestDTO dto) {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        Projeto projeto = projetoService.buscarPorId(projetoId);

        verificarPodeGerenciar(autor, projeto);

        RegraAutomacao regra = new RegraAutomacao();
        regra.setProjeto(projeto);
        aplicarCampos(regra, dto, projeto.getEmpresa().getId());

        return toResponseDTO(regraRepository.save(regra));
    }

    public List<RegraAutomacaoResponseDTO> listarPorProjeto(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return regraRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public RegraAutomacaoResponseDTO atualizar(Long id, RegraAutomacaoRequestDTO dto) {
        RegraAutomacao regra = buscarComAcesso(id);
        aplicarCampos(regra, dto, regra.getProjeto().getEmpresa().getId());

        return toResponseDTO(regraRepository.save(regra));
    }

    public void excluir(Long id) {
        RegraAutomacao regra = buscarComAcesso(id);
        regraRepository.delete(regra);
    }

    private void aplicarCampos(RegraAutomacao regra, RegraAutomacaoRequestDTO dto, Long empresaId) {
        regra.setNome(dto.getNome());
        regra.setStatusGatilho(dto.getStatusGatilho());
        regra.setAtiva(dto.isAtiva());

        List<AcaoAutomacao> acoes = new ArrayList<>();
        if (dto.getAcoes() != null) {
            for (AcaoAutomacaoRequestDTO acaoDto : dto.getAcoes()) {
                AcaoAutomacao acao = new AcaoAutomacao();
                acao.setRegra(regra);
                acao.setTipo(acaoDto.getTipo());
                acao.setMensagem(acaoDto.getMensagem());
                acao.setStatusDestino(acaoDto.getStatusDestino());

                if (acaoDto.getTagId() != null) {
                    Tag tag = tagRepository.findById(acaoDto.getTagId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Tag não encontrada"));
                    if (!tag.getEmpresa().getId().equals(empresaId)) {
                        throw new RecursoNaoEncontradoException("Tag não encontrada");
                    }
                    acao.setTag(tag);
                }

                acoes.add(acao);
            }
        }

        regra.getAcoes().clear();
        regra.getAcoes().addAll(acoes);
    }

    private RegraAutomacao buscarComAcesso(Long id) {
        RegraAutomacao regra = regraRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Regra não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, regra.getProjeto());
        verificarPodeGerenciar(autor, regra.getProjeto());

        return regra;
    }

    private void verificarPodeGerenciar(Usuario autor, Projeto projeto) {
        if (!projetoService.podeGerenciarMembros(autor, projeto)) {
            throw new AcessoNegadoException("Apenas o administrador da empresa ou o dono do projeto podem gerenciar automações.");
        }
    }

    private RegraAutomacaoResponseDTO toResponseDTO(RegraAutomacao regra) {
        RegraAutomacaoResponseDTO dto = new RegraAutomacaoResponseDTO();
        dto.setId(regra.getId());
        dto.setNome(regra.getNome());
        dto.setProjetoId(regra.getProjeto().getId());
        dto.setStatusGatilho(regra.getStatusGatilho());
        dto.setAtiva(regra.isAtiva());
        dto.setAcoes(regra.getAcoes().stream().map(this::toAcaoResponseDTO).toList());
        return dto;
    }

    private AcaoAutomacaoResponseDTO toAcaoResponseDTO(AcaoAutomacao acao) {
        AcaoAutomacaoResponseDTO dto = new AcaoAutomacaoResponseDTO();
        dto.setId(acao.getId());
        dto.setTipo(acao.getTipo());
        dto.setMensagem(acao.getMensagem());
        dto.setStatusDestino(acao.getStatusDestino());
        dto.setTagId(acao.getTag() != null ? acao.getTag().getId() : null);
        dto.setTagNome(acao.getTag() != null ? acao.getTag().getNome() : null);
        return dto;
    }
}
