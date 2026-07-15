package com.company.praa.service;

import com.company.praa.dto.EmployeeDto;
import com.company.praa.entity.Employee;
import com.company.praa.repository.EmployeeRepository;
import com.company.praa.exception.EmployeeNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    @Autowired
    private EmployeeRepository repository;

    public EmployeeDto createEmployee(EmployeeDto dto) {
        Employee employee = Employee.builder()
                .employeeCode(dto.getEmployeeCode())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .department(dto.getDepartment())
                .build();
        repository.save(employee);
        dto.setEmployeeId(employee.getEmployeeId());
        return dto;
    }

    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = repository.findById(id).orElseThrow(() ->
                new EmployeeNotFoundException("Employee not found with ID " + id));
        return EmployeeDto.builder()
                .employeeId(employee.getEmployeeId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .build();
    }

    public List<EmployeeDto> getAllEmployees() {
        return repository.findAll().stream().map(emp -> EmployeeDto.builder()
                .employeeId(emp.getEmployeeId())
                .employeeCode(emp.getEmployeeCode())
                .fullName(emp.getFullName())
                .email(emp.getEmail())
                .role(emp.getRole())
                .department(emp.getDepartment())
                .build()).collect(Collectors.toList());
    }

    public EmployeeDto updateEmployee(Long id, EmployeeDto dto) {
        Employee employee = repository.findById(id).orElseThrow(() ->
                new EmployeeNotFoundException("Employee not found with ID " + id));
        employee.setFullName(dto.getFullName());
        employee.setEmail(dto.getEmail());
        employee.setRole(dto.getRole());
        employee.setDepartment(dto.getDepartment());
        repository.save(employee);
        return EmployeeDto.builder()
                .employeeId(employee.getEmployeeId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .build();
    }

    public void deleteEmployee(Long id) {
        if (!repository.existsById(id)) {
            throw new EmployeeNotFoundException("Employee not found with ID " + id);
        }
        repository.deleteById(id);
    }
}