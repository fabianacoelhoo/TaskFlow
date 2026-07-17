package com.taskflow.backend.service;

import com.taskflow.backend.dto.auth.RegistrarComCodigoRequestDTO;
import com.taskflow.backend.dto.auth.RegistrarEmpresaRequestDTO;
import com.taskflow.backend.dto.empresa.EmpresaResponseDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Empresa;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.EmailJaCadastradoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.repository.EmpresaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AutenticacaoService autenticacaoService;

    public EmpresaService(EmpresaRepository empresaRepository,
                           UsuarioRepository usuarioRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           AutenticacaoService autenticacaoService) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.autenticacaoService = autenticacaoService;
    }

    public UsuarioResponseDTO registrarEmpresaComAdmin(RegistrarEmpresaRequestDTO dto) {
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailJaCadastradoException("Email já cadastrado.");
        }

        Empresa empresa = new Empresa();
        empresa.setNome(dto.getNomeEmpresa());
        empresa.setCodigoConvite(gerarCodigoUnico());
        empresa.setCriadoEm(LocalDateTime.now());
        Empresa empresaSalva = empresaRepository.save(empresa);

        Usuario admin = new Usuario();
        admin.setNome(dto.getNome());
        admin.setEmail(dto.getEmail());
        admin.setSenha(passwordEncoder.encode(dto.getSenha()));
        admin.setPapel(Papel.ADMIN);
        admin.setEmpresa(empresaSalva);

        return toUsuarioResponseDTO(usuarioRepository.save(admin));
    }

    public UsuarioResponseDTO registrarMembroComCodigo(RegistrarComCodigoRequestDTO dto) {
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailJaCadastradoException("Email já cadastrado.");
        }

        Empresa empresa = empresaRepository.findByCodigoConvite(dto.getCodigoConvite())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Código de convite inválido."));

        Usuario membro = new Usuario();
        membro.setNome(dto.getNome());
        membro.setEmail(dto.getEmail());
        membro.setSenha(passwordEncoder.encode(dto.getSenha()));
        membro.setPapel(Papel.MEMBRO);
        membro.setEmpresa(empresa);

        return toUsuarioResponseDTO(usuarioRepository.save(membro));
    }

    public EmpresaResponseDTO minhaEmpresa() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        return toEmpresaResponseDTO(autor.getEmpresa(), autor.getPapel() == Papel.ADMIN);
    }

    public EmpresaResponseDTO regenerarCodigoConvite() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        if (autor.getPapel() != Papel.ADMIN) {
            throw new AcessoNegadoException("Apenas administradores podem gerar um novo código de convite.");
        }

        Empresa empresa = autor.getEmpresa();
        empresa.setCodigoConvite(gerarCodigoUnico());
        Empresa salva = empresaRepository.save(empresa);

        return toEmpresaResponseDTO(salva, true);
    }

    private String gerarCodigoUnico() {
        String codigo;
        do {
            codigo = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (empresaRepository.existsByCodigoConvite(codigo));
        return codigo;
    }

    private EmpresaResponseDTO toEmpresaResponseDTO(Empresa empresa, boolean incluirCodigo) {
        EmpresaResponseDTO dto = new EmpresaResponseDTO();
        dto.setId(empresa.getId());
        dto.setNome(empresa.getNome());
        dto.setCodigoConvite(incluirCodigo ? empresa.getCodigoConvite() : null);
        return dto;
    }

    private UsuarioResponseDTO toUsuarioResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPapel(usuario.getPapel());
        dto.setCargo(usuario.getCargo());
        dto.setDisponibilidade(usuario.getDisponibilidade());
        dto.setHabilidades(usuario.getHabilidades());
        return dto;
    }
}
