package com.taskflow.backend.controller;

import com.taskflow.backend.dto.auth.LoginRequestDTO;
import com.taskflow.backend.dto.auth.LoginResponseDTO;
import com.taskflow.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }
}