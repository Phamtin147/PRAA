package com.company.praa.service;

import com.company.praa.dto.ProjectDto;
import com.company.praa.entity.Project;
import com.company.praa.entity.ProjectStatus;
import com.company.praa.repository.ProjectRepository;
import com.company.praa.exception.ProjectNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository repository;

    public ProjectDto createProject(ProjectDto dto) {
        Project project = Project.builder()
                .projectCode(dto.getProjectCode())
                .projectName(dto.getProjectName())
                .customer(dto.getCustomer())
                .status(ProjectStatus.valueOf(dto.getStatus()))
                .startDate(dto.getStartDate() != null ? LocalDate.parse(dto.getStartDate()) : null)
                .endDate(dto.getEndDate() != null ? LocalDate.parse(dto.getEndDate()) : null)
                .build();
        repository.save(project);
        dto.setProjectId(project.getProjectId());
        return dto;
    }

    public ProjectDto getProjectById(Long id) {
        Project project = repository.findById(id).orElseThrow(() ->
                new ProjectNotFoundException("Project not found with ID " + id));
        return toDto(project);
    }

    public List<ProjectDto> getAllProjects() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProjectDto updateProject(Long id, ProjectDto dto) {
        Project project = repository.findById(id).orElseThrow(() ->
                new ProjectNotFoundException("Project not found with ID " + id));
        project.setProjectName(dto.getProjectName());
        project.setCustomer(dto.getCustomer());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        if (dto.getStartDate() != null) project.setStartDate(LocalDate.parse(dto.getStartDate()));
        if (dto.getEndDate() != null) project.setEndDate(LocalDate.parse(dto.getEndDate()));
        repository.save(project);
        return toDto(project);
    }

    public void deleteProject(Long id) {
        if (!repository.existsById(id)) {
            throw new ProjectNotFoundException("Project not found with ID " + id);
        }
        repository.deleteById(id);
    }

    private ProjectDto toDto(Project p) {
        return ProjectDto.builder()
                .projectId(p.getProjectId())
                .projectCode(p.getProjectCode())
                .projectName(p.getProjectName())
                .customer(p.getCustomer())
                .status(p.getStatus().name())
                .startDate(p.getStartDate() != null ? p.getStartDate().toString() : null)
                .endDate(p.getEndDate() != null ? p.getEndDate().toString() : null)
                .build();
    }
}