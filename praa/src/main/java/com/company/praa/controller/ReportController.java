package com.company.praa.controller;

import com.company.praa.dto.AvailableResourceDto;
import com.company.praa.dto.EmployeeUtilizationDto;
import com.company.praa.service.AllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private AllocationService service;

    @GetMapping("/utilization")
    public ResponseEntity<List<EmployeeUtilizationDto>> getUtilizationReport() {
        return ResponseEntity.ok(service.getUtilizationReport());
    }

    @GetMapping("/available")
    public ResponseEntity<List<AvailableResourceDto>> getAvailableResources() {
        return ResponseEntity.ok(service.getAvailableResources());
    }

    @GetMapping("/overloaded")
    public ResponseEntity<List<EmployeeUtilizationDto>> getOverloadedEmployees() {
        return ResponseEntity.ok(service.getOverloadedEmployees());
    }
}