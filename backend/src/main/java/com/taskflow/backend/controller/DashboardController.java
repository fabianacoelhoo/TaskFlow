package com.taskflow.backend.controller;

import com.taskflow.backend.dto.dashboard.DashboardResponseDTO;
import com.taskflow.backend.service.DashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final char BOM_UTF8 = '﻿';

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponseDTO obter() {
        return dashboardService.gerar();
    }

    @GetMapping("/exportar-csv")
    public ResponseEntity<byte[]> exportarCsv() {
        String csv = dashboardService.gerarCsv();
        byte[] bytes = (BOM_UTF8 + csv).getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-taskflow.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
