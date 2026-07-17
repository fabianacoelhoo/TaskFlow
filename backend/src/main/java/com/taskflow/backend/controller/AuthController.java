package com.taskflow.backend.controller;

import com.taskflow.backend.dto.auth.LoginRequestDTO;
import com.taskflow.backend.dto.auth.LoginResponseDTO;
import com.taskflow.backend.dto.auth.RegistrarComCodigoRequestDTO;
import com.taskflow.backend.dto.auth.RegistrarEmpresaRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.service.AuthService;
import com.taskflow.backend.service.EmpresaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmpresaService empresaService;

    public AuthController(AuthService authService, EmpresaService empresaService) {
        this.authService = authService;
        this.empresaService = empresaService;
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }

    @PostMapping("/registrar-empresa")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO registrarEmpresa(@RequestBody RegistrarEmpresaRequestDTO dto) {
        return empresaService.registrarEmpresaComAdmin(dto);
    }

    @PostMapping("/registrar-com-codigo")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO registrarComCodigo(@RequestBody RegistrarComCodigoRequestDTO dto) {
        return empresaService.registrarMembroComCodigo(dto);
    }
}
