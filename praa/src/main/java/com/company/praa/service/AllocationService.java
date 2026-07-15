package com.company.praa.service;

import com.company.praa.dto.*;
import com.company.praa.entity.Employee;
import com.company.praa.entity.Project;
import com.company.praa.entity.ProjectStatus;
import com.company.praa.entity.ResourceAllocation;
import com.company.praa.repository.EmployeeRepository;
import com.company.praa.repository.ProjectRepository;
import com.company.praa.repository.ResourceAllocationRepository;
import com.company.praa.exception.EmployeeNotFoundException;
import com.company.praa.exception.ProjectNotFoundException;
import com.company.praa.exception.AllocationExceededException;
import com.company.praa.exception.ProjectStatusException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AllocationService {

    @Autowired
    private ResourceAllocationRepository allocationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public AllocationResponse createAllocation(AllocationRequest request) {
        Integer currentTotal = allocationRepository.sumAllocationByEmployeeId(request.getEmployeeId());
        if (currentTotal == null) currentTotal = 0;

        if (currentTotal + request.getAllocationPercent() > 100) {
            throw new AllocationExceededException("Employee allocation exceeds 100%");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId()).orElseThrow(() ->
                new EmployeeNotFoundException("Employee not found with ID " + request.getEmployeeId()));

        Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() ->
                new ProjectNotFoundException("Project not found with ID " + request.getProjectId()));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new ProjectStatusException("Cannot allocate to a COMPLETED project");
        }

        ResourceAllocation allocation = ResourceAllocation.builder()
                .employee(employee)
                .project(project)
                .allocationPercent(request.getAllocationPercent())
                .roleInProject(request.getRoleInProject())
                .startDate(LocalDate.parse(request.getStartDate()))
                .endDate(LocalDate.parse(request.getEndDate()))
                .build();

        allocationRepository.save(allocation);
        return toResponse(allocation);
    }

    public AllocationResponse updateAllocation(Long id, AllocationRequest request) {
        ResourceAllocation allocation = allocationRepository.findById(id).orElseThrow(() ->
                new ProjectNotFoundException("Allocation not found with ID " + id));

        Integer currentTotal = allocationRepository.sumAllocationByEmployeeId(request.getEmployeeId());
        if (currentTotal == null) currentTotal = 0;
        currentTotal -= allocation.getAllocationPercent();

        if (currentTotal + request.getAllocationPercent() > 100) {
            throw new AllocationExceededException("Employee allocation exceeds 100%");
        }

        Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() ->
                new ProjectNotFoundException("Project not found with ID " + request.getProjectId()));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new ProjectStatusException("Cannot allocate to a COMPLETED project");
        }

        allocation.setProject(project);
        allocation.setAllocationPercent(request.getAllocationPercent());
        allocation.setRoleInProject(request.getRoleInProject());
        allocation.setStartDate(LocalDate.parse(request.getStartDate()));
        allocation.setEndDate(LocalDate.parse(request.getEndDate()));

        allocationRepository.save(allocation);
        return toResponse(allocation);
    }

    public void deleteAllocation(Long id) {
        allocationRepository.deleteById(id);
    }

    public List<AllocationResponse> getAllAllocations() {
        return allocationRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WorkloadDto getEmployeeWorkload(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                new EmployeeNotFoundException("Employee not found with ID " + employeeId));
        Integer total = allocationRepository.sumAllocationByEmployeeId(employeeId);
        if (total == null) total = 0;
        int available = 100 - total;
        return WorkloadDto.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFullName())
                .totalAllocation(total)
                .available(available)
                .build();
    }

    public List<EmployeeUtilizationDto> getUtilizationReport() {
        return allocationRepository.getUtilizationReport().stream().map(row ->
                EmployeeUtilizationDto.builder()
                        .employeeId((Long) row[0])
                        .employeeName((String) row[1])
                        .totalAllocation(((Number) row[2]).intValue())
                        .build()).collect(Collectors.toList());
    }

    public List<AvailableResourceDto> getAvailableResources() {
        return allocationRepository.getAvailableResources().stream().map(row ->
                AvailableResourceDto.builder()
                        .employeeId((Long) row[0])
                        .employeeName((String) row[1])
                        .role((String) row[2])
                        .department((String) row[3])
                        .available(((Number) row[4]).intValue())
                        .build()).collect(Collectors.toList());
    }

    public List<EmployeeUtilizationDto> getOverloadedEmployees() {
        return allocationRepository.getOverloadedEmployees().stream().map(row ->
                EmployeeUtilizationDto.builder()
                        .employeeId((Long) row[0])
                        .employeeName((String) row[1])
                        .totalAllocation(((Number) row[2]).intValue())
                        .build()).collect(Collectors.toList());
    }

    private AllocationResponse toResponse(ResourceAllocation a) {
        return AllocationResponse.builder()
                .allocationId(a.getAllocationId())
                .employeeId(a.getEmployee().getEmployeeId())
                .employeeName(a.getEmployee().getFullName())
                .projectId(a.getProject().getProjectId())
                .projectName(a.getProject().getProjectName())
                .allocationPercent(a.getAllocationPercent())
                .roleInProject(a.getRoleInProject())
                .startDate(a.getStartDate().toString())
                .endDate(a.getEndDate().toString())
                .build();
    }
}