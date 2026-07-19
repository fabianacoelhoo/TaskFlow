package com.taskflow.backend.controller;

import com.taskflow.backend.dto.auth.EsqueciSenhaRequestDTO;
import com.taskflow.backend.dto.auth.LoginRequestDTO;
import com.taskflow.backend.dto.auth.LoginResponseDTO;
import com.taskflow.backend.dto.auth.RedefinirSenhaRequestDTO;
import com.taskflow.backend.dto.auth.RegistrarComCodigoRequestDTO;
import com.taskflow.backend.dto.auth.RegistrarEmpresaRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.service.AuthService;
import com.taskflow.backend.service.EmpresaService;
import com.taskflow.backend.service.RedefinicaoSenhaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmpresaService empresaService;
    private final RedefinicaoSenhaService redefinicaoSenhaService;

    public AuthController(AuthService authService, EmpresaService empresaService,
                           RedefinicaoSenhaService redefinicaoSenhaService) {
        this.authService = authService;
        this.empresaService = empresaService;
        this.redefinicaoSenhaService = redefinicaoSenhaService;
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }

    @PostMapping("/esqueci-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void esqueciSenha(@RequestBody EsqueciSenhaRequestDTO dto) {
        redefinicaoSenhaService.solicitar(dto.getEmail());
    }

    @PostMapping("/redefinir-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void redefinirSenha(@RequestBody RedefinirSenhaRequestDTO dto) {
        redefinicaoSenhaService.redefinir(dto.getToken(), dto.getNovaSenha());
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
