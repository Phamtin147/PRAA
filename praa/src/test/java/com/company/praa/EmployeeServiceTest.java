package com.company.praa;

import com.company.praa.dto.EmployeeDto;
import com.company.praa.entity.Employee;
import com.company.praa.exception.EmployeeNotFoundException;
import com.company.praa.repository.EmployeeRepository;
import com.company.praa.service.EmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;

    @InjectMocks
    private EmployeeService service;

    private Employee testEmployee;
    private EmployeeDto testDto;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1L);
        testEmployee.setEmployeeCode("EMP001");
        testEmployee.setFullName("Tuan Ho Anh");
        testEmployee.setEmail("tuanha@company.com");
        testEmployee.setRole("Senior Developer");
        testEmployee.setDepartment("FSOFT-Q1");

        testDto = EmployeeDto.builder()
                .employeeCode("EMP001")
                .fullName("Tuan Ho Anh")
                .email("tuanha@company.com")
                .role("Senior Developer")
                .department("FSOFT-Q1")
                .build();
    }

    @Test
    void createEmployee_validData_success() {
        when(repository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee e = invocation.getArgument(0);
            e.setEmployeeId(1L);
            return e;
        });

        EmployeeDto result = service.createEmployee(testDto);

        assertNotNull(result);
        assertEquals("EMP001", result.getEmployeeCode());
        assertEquals(1L, result.getEmployeeId());
        verify(repository).save(any(Employee.class));
    }

    @Test
    void getEmployeeById_exists_returnsEmployee() {
        when(repository.findById(1L)).thenReturn(Optional.of(testEmployee));

        EmployeeDto result = service.getEmployeeById(1L);

        assertNotNull(result);
        assertEquals("Tuan Ho Anh", result.getFullName());
        assertEquals("EMP001", result.getEmployeeCode());
    }

    @Test
    void getEmployeeById_notFound_throwsException() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EmployeeNotFoundException.class, () -> service.getEmployeeById(99L));
    }

    @Test
    void getAllEmployees_returnsList() {
        Employee emp2 = new Employee();
        emp2.setEmployeeId(2L);
        emp2.setEmployeeCode("EMP002");
        emp2.setFullName("Nguyen Van Nam");
        emp2.setEmail("namnv@company.com");
        emp2.setRole("Developer");
        emp2.setDepartment("FSOFT-Q2");

        when(repository.findAll()).thenReturn(Arrays.asList(testEmployee, emp2));

        var result = service.getAllEmployees();

        assertEquals(2, result.size());
    }

    @Test
    void deleteEmployee_exists_success() {
        when(repository.existsById(1L)).thenReturn(true);
        doNothing().when(repository).deleteById(1L);

        assertDoesNotThrow(() -> service.deleteEmployee(1L));
        verify(repository).deleteById(1L);
    }

    @Test
    void deleteEmployee_notFound_throwsException() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThrows(EmployeeNotFoundException.class, () -> service.deleteEmployee(99L));
    }
}