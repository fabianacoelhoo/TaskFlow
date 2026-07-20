package com.taskflow.backend.service;

import com.taskflow.backend.dto.usuario.UsuarioPerfilRequestDTO;
import com.taskflow.backend.dto.usuario.UsuarioResponseDTO;
import com.taskflow.backend.entity.Papel;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.UsuarioRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AutenticacaoService autenticacaoService;

    public UsuarioService(UsuarioRepository usuarioRepository, AutenticacaoService autenticacaoService) {
        this.usuarioRepository = usuarioRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public List<UsuarioResponseDTO> listarUsuarios() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        return usuarioRepository.findByEmpresaId(autor.getEmpresa().getId()).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UsuarioResponseDTO alterarPapel(Long id, Papel novoPapel, Usuario autor) {
        if (autor.getPapel() != Papel.ADMIN) {
            throw new AcessoNegadoException("Apenas administradores podem alterar papéis.");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!usuario.getEmpresa().getId().equals(autor.getEmpresa().getId())) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }

        usuario.setPapel(novoPapel);

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO atualizarPerfil(Usuario autor, UsuarioPerfilRequestDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new ValidacaoException("O nome não pode ficar em branco.");
        }

        autor.setNome(dto.getNome());
        autor.setCargo(dto.getCargo());
        autor.setDisponibilidade(dto.getDisponibilidade());
        autor.setHabilidades(dto.getHabilidades() != null ? new ArrayList<>(dto.getHabilidades()) : new ArrayList<>());

        // CPF e data de nascimento só podem ser definidos uma vez: depois de gravados,
        // qualquer tentativa de troca é ignorada.
        if (autor.getCpf() == null && dto.getCpf() != null && !dto.getCpf().isBlank()) {
            String cpfNormalizado = validarENormalizarCpf(dto.getCpf());

            usuarioRepository.findByCpf(cpfNormalizado).ifPresent(outro -> {
                throw new ValidacaoException("Esse CPF já está cadastrado em outra conta.");
            });

            autor.setCpf(cpfNormalizado);
        }
        if (autor.getDataNascimento() == null && dto.getDataNascimento() != null) {
            autor.setDataNascimento(dto.getDataNascimento());
        }

        return toResponseDTO(usuarioRepository.save(autor));
    }

    private String validarENormalizarCpf(String cpfBruto) {
        String cpf = cpfBruto.replaceAll("\\D", "");
        if (!cpfValido(cpf)) {
            throw new ValidacaoException("CPF inválido.");
        }
        return cpf;
    }

    private boolean cpfValido(String cpf) {
        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            return false;
        }

        int[] digitos = cpf.chars().map(c -> c - '0').toArray();

        int soma1 = 0;
        for (int i = 0; i < 9; i++) {
            soma1 += digitos[i] * (10 - i);
        }
        int resto1 = (soma1 * 10) % 11;
        if (resto1 == 10) resto1 = 0;
        if (resto1 != digitos[9]) {
            return false;
        }

        int soma2 = 0;
        for (int i = 0; i < 10; i++) {
            soma2 += digitos[i] * (11 - i);
        }
        int resto2 = (soma2 * 10) % 11;
        if (resto2 == 10) resto2 = 0;

        return resto2 == digitos[10];
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPapel(usuario.getPapel());
        dto.setCargo(usuario.getCargo());
        dto.setCpf(usuario.getCpf());
        dto.setDataNascimento(usuario.getDataNascimento());
        dto.setDisponibilidade(usuario.getDisponibilidade());
        dto.setHabilidades(usuario.getHabilidades());
        return dto;
    }
}
