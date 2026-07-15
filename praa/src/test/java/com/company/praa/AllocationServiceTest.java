package com.company.praa;

import com.company.praa.dto.AllocationRequest;
import com.company.praa.dto.AllocationResponse;
import com.company.praa.dto.WorkloadDto;
import com.company.praa.entity.*;
import com.company.praa.exception.AllocationExceededException;
import com.company.praa.exception.ProjectStatusException;
import com.company.praa.repository.EmployeeRepository;
import com.company.praa.repository.ProjectRepository;
import com.company.praa.repository.ResourceAllocationRepository;
import com.company.praa.service.AllocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

    @Mock
    private ResourceAllocationRepository allocationRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private AllocationService allocationService;

    private Employee testEmployee;
    private Project activeProject;
    private Project completedProject;
    private ResourceAllocation testAllocation;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1L);
        testEmployee.setEmployeeCode("EMP001");
        testEmployee.setFullName("Tuan Ho Anh");
        testEmployee.setEmail("tuanha@company.com");
        testEmployee.setRole("Developer");
        testEmployee.setDepartment("FSOFT-Q1");

        activeProject = new Project();
        activeProject.setProjectId(1L);
        activeProject.setProjectCode("NCG");
        activeProject.setProjectName("Next Generation Commerce");
        activeProject.setCustomer("Japan Bank");
        activeProject.setStatus(ProjectStatus.ACTIVE);
        activeProject.setStartDate(LocalDate.of(2026, 1, 1));
        activeProject.setEndDate(LocalDate.of(2026, 12, 31));

        completedProject = new Project();
        completedProject.setProjectId(2L);
        completedProject.setProjectCode("LEGACY");
        completedProject.setProjectName("Legacy System");
        completedProject.setCustomer("Viettel");
        completedProject.setStatus(ProjectStatus.COMPLETED);

        testAllocation = new ResourceAllocation();
        testAllocation.setAllocationId(1L);
        testAllocation.setEmployee(testEmployee);
        testAllocation.setProject(activeProject);
        testAllocation.setAllocationPercent(60);
        testAllocation.setRoleInProject("Backend Developer");
        testAllocation.setStartDate(LocalDate.of(2026, 7, 1));
        testAllocation.setEndDate(LocalDate.of(2026, 7, 31));
    }

    // ===== Allocation Validation Tests =====

    @Test
    void createAllocation_validData_success() {
        AllocationRequest request = AllocationRequest.builder()
                .employeeId(1L)
                .projectId(1L)
                .allocationPercent(30)
                .roleInProject("Developer")
                .startDate("2026-07-01")
                .endDate("2026-07-31")
                .build();

        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(50);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.save(any(ResourceAllocation.class))).thenAnswer(invocation -> {
            ResourceAllocation saved = invocation.getArgument(0);
            saved.setAllocationId(2L);
            return saved;
        });

        AllocationResponse response = allocationService.createAllocation(request);

        assertNotNull(response);
        assertEquals(30, response.getAllocationPercent());
        verify(allocationRepository).save(any(ResourceAllocation.class));
    }

    @Test
    void createAllocation_exceeds100Percent_throwsException() {
        AllocationRequest request = AllocationRequest.builder()
                .employeeId(1L)
                .projectId(1L)
                .allocationPercent(60)
                .roleInProject("Developer")
                .startDate("2026-07-01")
                .endDate("2026-07-31")
                .build();

        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(50);

        AllocationExceededException ex = assertThrows(
                AllocationExceededException.class,
                () -> allocationService.createAllocation(request)
        );
        assertEquals("Employee allocation exceeds 100%", ex.getMessage());
        verify(allocationRepository, never()).save(any());
    }

    @Test
    void createAllocation_exactly100Percent_success() {
        AllocationRequest request = AllocationRequest.builder()
                .employeeId(1L)
                .projectId(1L)
                .allocationPercent(40)
                .roleInProject("Developer")
                .startDate("2026-07-01")
                .endDate("2026-07-31")
                .build();

        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(60);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.save(any(ResourceAllocation.class))).thenReturn(testAllocation);

        AllocationResponse response = allocationService.createAllocation(request);

        assertNotNull(response);
        assertEquals(40, response.getAllocationPercent());
    }

    // ===== Project Status Validation Tests =====

    @Test
    void createAllocation_completedProject_throwsException() {
        AllocationRequest request = AllocationRequest.builder()
                .employeeId(1L)
                .projectId(2L)
                .allocationPercent(30)
                .roleInProject("Developer")
                .startDate("2026-07-01")
                .endDate("2026-07-31")
                .build();

        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(0);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(completedProject));

        ProjectStatusException ex = assertThrows(
                ProjectStatusException.class,
                () -> allocationService.createAllocation(request)
        );
        assertTrue(ex.getMessage().contains("COMPLETED"));
        verify(allocationRepository, never()).save(any());
    }

    // ===== Workload Calculation Tests =====

    @Test
    void getEmployeeWorkload_returnsCorrectCalculation() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(60);

        WorkloadDto workload = allocationService.getEmployeeWorkload(1L);

        assertNotNull(workload);
        assertEquals(1L, workload.getEmployeeId());
        assertEquals("Tuan Ho Anh", workload.getEmployeeName());
        assertEquals(60, workload.getTotalAllocation());
        assertEquals(40, workload.getAvailable());
    }

    @Test
    void getEmployeeWorkload_noAllocations_fullAvailable() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(0);

        WorkloadDto workload = allocationService.getEmployeeWorkload(1L);

        assertEquals(0, workload.getTotalAllocation());
        assertEquals(100, workload.getAvailable());
    }

    // ===== CRUD Tests =====

    @Test
    void getAllAllocations_returnsList() {
        when(allocationRepository.findAll()).thenReturn(Arrays.asList(testAllocation));

        List<AllocationResponse> result = allocationService.getAllAllocations();

        assertEquals(1, result.size());
        assertEquals("Tuan Ho Anh", result.get(0).getEmployeeName());
        assertEquals("Next Generation Commerce", result.get(0).getProjectName());
        assertEquals(60, result.get(0).getAllocationPercent());
    }

    @Test
    void deleteAllocation_callsRepository() {
        allocationService.deleteAllocation(1L);
        verify(allocationRepository).deleteById(1L);
    }
}