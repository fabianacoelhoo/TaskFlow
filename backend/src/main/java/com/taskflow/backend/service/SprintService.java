package com.taskflow.backend.service;

import com.taskflow.backend.dto.sprint.BurndownResponseDTO;
import com.taskflow.backend.dto.sprint.PontoBurndownDTO;
import com.taskflow.backend.dto.sprint.SprintRequestDTO;
import com.taskflow.backend.dto.sprint.SprintResponseDTO;
import com.taskflow.backend.dto.sprint.VelocidadeItemDTO;
import com.taskflow.backend.entity.HistoriaUsuario;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Sprint;
import com.taskflow.backend.entity.SprintBurndownSnapshot;
import com.taskflow.backend.entity.StatusHistoria;
import com.taskflow.backend.entity.StatusSprint;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.HistoriaUsuarioRepository;
import com.taskflow.backend.repository.SprintBurndownSnapshotRepository;
import com.taskflow.backend.repository.SprintRepository;
import com.taskflow.backend.security.AutenticacaoService;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final HistoriaUsuarioRepository historiaUsuarioRepository;
    private final SprintBurndownSnapshotRepository snapshotRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public SprintService(SprintRepository sprintRepository,
                          HistoriaUsuarioRepository historiaUsuarioRepository,
                          SprintBurndownSnapshotRepository snapshotRepository,
                          ProjetoService projetoService,
                          AutenticacaoService autenticacaoService) {
        this.sprintRepository = sprintRepository;
        this.historiaUsuarioRepository = historiaUsuarioRepository;
        this.snapshotRepository = snapshotRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public SprintResponseDTO criar(Long projetoId, SprintRequestDTO dto) {
        Projeto projeto = projetoService.buscarPorId(projetoId);

        Sprint sprint = new Sprint();
        sprint.setNome(dto.getNome());
        sprint.setObjetivo(dto.getObjetivo());
        sprint.setDataInicio(dto.getDataInicio());
        sprint.setDataFim(dto.getDataFim());
        sprint.setStatus(StatusSprint.PLANEJADA);
        sprint.setProjeto(projeto);

        return toResponseDTO(sprintRepository.save(sprint));
    }

    public List<SprintResponseDTO> listarPorProjeto(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return sprintRepository.findByProjetoId(projetoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public SprintResponseDTO atualizar(Long id, SprintRequestDTO dto) {
        Sprint sprint = buscarComAcesso(id);

        sprint.setNome(dto.getNome());
        sprint.setObjetivo(dto.getObjetivo());
        sprint.setDataInicio(dto.getDataInicio());
        sprint.setDataFim(dto.getDataFim());

        return toResponseDTO(sprintRepository.save(sprint));
    }

    public void excluir(Long id) {
        Sprint sprint = buscarComAcesso(id);

        List<HistoriaUsuario> historias = historiaUsuarioRepository.findBySprintId(id);
        historias.forEach(h -> h.setSprint(null));
        historiaUsuarioRepository.saveAll(historias);

        snapshotRepository.deleteAll(snapshotRepository.findBySprintIdOrderByDataAsc(id));

        sprintRepository.delete(sprint);
    }

    public SprintResponseDTO iniciar(Long id) {
        Sprint sprint = buscarComAcesso(id);

        if (sprint.getStatus() != StatusSprint.PLANEJADA) {
            throw new ValidacaoException("Só é possível iniciar uma sprint que está planejada.");
        }

        boolean existeAtiva = !sprintRepository
                .findByProjetoIdAndStatus(sprint.getProjeto().getId(), StatusSprint.ATIVA)
                .isEmpty();
        if (existeAtiva) {
            throw new ValidacaoException("Já existe uma sprint ativa neste projeto.");
        }

        sprint.setStatus(StatusSprint.ATIVA);
        Sprint salva = sprintRepository.save(sprint);
        upsertSnapshotHoje(salva);

        return toResponseDTO(salva);
    }

    public SprintResponseDTO concluir(Long id) {
        Sprint sprint = buscarComAcesso(id);

        if (sprint.getStatus() != StatusSprint.ATIVA) {
            throw new ValidacaoException("Só é possível concluir uma sprint que está ativa.");
        }

        upsertSnapshotHoje(sprint);
        sprint.setStatus(StatusSprint.CONCLUIDA);

        return toResponseDTO(sprintRepository.save(sprint));
    }

    public BurndownResponseDTO burndown(Long id) {
        Sprint sprint = buscarComAcesso(id);

        if (sprint.getStatus() == StatusSprint.ATIVA) {
            upsertSnapshotHoje(sprint);
        }

        int totalPontos = calcularTotalPontos(sprint);

        List<PontoBurndownDTO> real = snapshotRepository.findBySprintIdOrderByDataAsc(sprint.getId()).stream()
                .map(s -> new PontoBurndownDTO(s.getData(), s.getPontosRestantes()))
                .toList();

        return new BurndownResponseDTO(totalPontos, calcularLinhaIdeal(sprint, totalPontos), real);
    }

    public List<VelocidadeItemDTO> velocidade(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return sprintRepository.findByProjetoIdAndStatus(projetoId, StatusSprint.CONCLUIDA).stream()
                .sorted(Comparator.comparing(Sprint::getDataFim, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(s -> new VelocidadeItemDTO(s.getId(), s.getNome(), calcularPontosConcluidos(s)))
                .toList();
    }

    /**
     * Roda uma vez ao subir a aplicação e depois todo dia às 23h55, registrando o snapshot do
     * dia para toda sprint em andamento — mesmo padrão de NotificacaoService.verificarPrazosProximos.
     */
    @PostConstruct
    @Scheduled(cron = "0 55 23 * * *")
    public void tirarSnapshotDiario() {
        sprintRepository.findByStatus(StatusSprint.ATIVA).forEach(this::upsertSnapshotHoje);
    }

    private void upsertSnapshotHoje(Sprint sprint) {
        LocalDate hoje = LocalDate.now();
        SprintBurndownSnapshot snapshot = snapshotRepository.findBySprintIdAndData(sprint.getId(), hoje)
                .orElseGet(SprintBurndownSnapshot::new);
        snapshot.setSprint(sprint);
        snapshot.setData(hoje);
        snapshot.setPontosRestantes(calcularPontosRestantes(sprint));
        snapshotRepository.save(snapshot);
    }

    private int calcularPontosRestantes(Sprint sprint) {
        return historiaUsuarioRepository.findBySprintId(sprint.getId()).stream()
                .filter(h -> h.getStatus() != StatusHistoria.CONCLUIDA)
                .mapToInt(h -> h.getPontos() != null ? h.getPontos() : 0)
                .sum();
    }

    private int calcularTotalPontos(Sprint sprint) {
        return historiaUsuarioRepository.findBySprintId(sprint.getId()).stream()
                .mapToInt(h -> h.getPontos() != null ? h.getPontos() : 0)
                .sum();
    }

    private int calcularPontosConcluidos(Sprint sprint) {
        return historiaUsuarioRepository.findBySprintIdAndStatus(sprint.getId(), StatusHistoria.CONCLUIDA).stream()
                .mapToInt(h -> h.getPontos() != null ? h.getPontos() : 0)
                .sum();
    }

    private List<PontoBurndownDTO> calcularLinhaIdeal(Sprint sprint, int totalPontos) {
        List<PontoBurndownDTO> linha = new ArrayList<>();
        if (sprint.getDataInicio() == null || sprint.getDataFim() == null) {
            return linha;
        }

        long totalDias = Math.max(1, ChronoUnit.DAYS.between(sprint.getDataInicio(), sprint.getDataFim()));
        for (long i = 0; i <= totalDias; i++) {
            LocalDate dia = sprint.getDataInicio().plusDays(i);
            int pontos = (int) Math.round(totalPontos * (1 - (double) i / totalDias));
            linha.add(new PontoBurndownDTO(dia, pontos));
        }
        return linha;
    }

    private Sprint buscarComAcesso(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sprint não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, sprint.getProjeto());

        return sprint;
    }

    private SprintResponseDTO toResponseDTO(Sprint sprint) {
        SprintResponseDTO dto = new SprintResponseDTO();
        dto.setId(sprint.getId());
        dto.setNome(sprint.getNome());
        dto.setObjetivo(sprint.getObjetivo());
        dto.setDataInicio(sprint.getDataInicio());
        dto.setDataFim(sprint.getDataFim());
        dto.setStatus(sprint.getStatus());
        dto.setProjetoId(sprint.getProjeto().getId());
        dto.setTotalPontos(calcularTotalPontos(sprint));
        dto.setTotalHistorias(historiaUsuarioRepository.findBySprintId(sprint.getId()).size());
        return dto;
    }
}
