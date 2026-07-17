package com.taskflow.backend.service;

import com.taskflow.backend.dto.tag.TagRequestDTO;
import com.taskflow.backend.dto.tag.TagResponseDTO;
import com.taskflow.backend.entity.Tag;
import com.taskflow.backend.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<TagResponseDTO> listar() {
        return tagRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public TagResponseDTO criar(TagRequestDTO dto) {
        Tag tag = tagRepository.findByNomeIgnoreCase(dto.getNome())
                .orElseGet(() -> {
                    Tag nova = new Tag();
                    nova.setNome(dto.getNome());
                    nova.setCor(dto.getCor());
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
