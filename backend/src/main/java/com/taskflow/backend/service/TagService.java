package com.taskflow.backend.service;

import com.taskflow.backend.dto.tag.TagRequestDTO;
import com.taskflow.backend.dto.tag.TagResponseDTO;
import com.taskflow.backend.entity.Tag;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.TagRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;
    private final AutenticacaoService autenticacaoService;

    public TagService(TagRepository tagRepository, AutenticacaoService autenticacaoService) {
        this.tagRepository = tagRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public List<TagResponseDTO> listar() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        return tagRepository.findByEmpresaId(autor.getEmpresa().getId()).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public TagResponseDTO criar(TagRequestDTO dto) {
        Usuario autor = autenticacaoService.usuarioAutenticado();

        Tag tag = tagRepository.findByNomeIgnoreCaseAndEmpresaId(dto.getNome(), autor.getEmpresa().getId())
                .orElseGet(() -> {
                    Tag nova = new Tag();
                    nova.setNome(dto.getNome());
                    nova.setCor(dto.getCor());
                    nova.setEmpresa(autor.getEmpresa());
                    return tagRepository.save(nova);
                });

        return toResponseDTO(tag);
    }

    private TagResponseDTO toResponseDTO(Tag tag) {
        TagResponseDTO dto = new TagResponseDTO();
        dto.setId(tag.getId());
        dto.setNome(tag.getNome());
        dto.setCor(tag.getCor());
        return dto;
    }
}
