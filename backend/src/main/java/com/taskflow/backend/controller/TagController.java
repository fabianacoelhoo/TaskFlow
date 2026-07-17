package com.taskflow.backend.controller;

import com.taskflow.backend.dto.tag.TagRequestDTO;
import com.taskflow.backend.dto.tag.TagResponseDTO;
import com.taskflow.backend.service.TagService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagResponseDTO> listar() {
        return tagService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagResponseDTO criar(@RequestBody TagRequestDTO dto) {
        return tagService.criar(dto);
    }
}
