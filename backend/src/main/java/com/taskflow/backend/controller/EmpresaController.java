package com.taskflow.backend.controller;

import com.taskflow.backend.dto.empresa.EmpresaResponseDTO;
import com.taskflow.backend.service.EmpresaService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping("/me")
    public EmpresaResponseDTO minhaEmpresa() {
        return empresaService.minhaEmpresa();
    }

    @PostMapping("/codigo-convite/regenerar")
    public EmpresaResponseDTO regenerarCodigoConvite() {
        return empresaService.regenerarCodigoConvite();
    }
}
