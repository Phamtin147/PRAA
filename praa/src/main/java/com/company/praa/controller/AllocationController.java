package com.company.praa.controller;

import com.company.praa.dto.AllocationRequest;
import com.company.praa.dto.AllocationResponse;
import com.company.praa.dto.WorkloadDto;
import com.company.praa.service.AllocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AllocationController {

    @Autowired
    private AllocationService service;

    @PostMapping("/allocations")
    public ResponseEntity<AllocationResponse> createAllocation(@Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(service.createAllocation(request));
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<AllocationResponse>> getAllAllocations() {
        return ResponseEntity.ok(service.getAllAllocations());
    }

    @PutMapping("/allocations/{id}")
    public ResponseEntity<AllocationResponse> updateAllocation(@PathVariable Long id,
                                                               @Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(service.updateAllocation(id, request));
    }

    @DeleteMapping("/allocations/{id}")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        service.deleteAllocation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employees/{id}/workload")
    public ResponseEntity<WorkloadDto> getEmployeeWorkload(@PathVariable Long id) {
        return ResponseEntity.ok(service.getEmployeeWorkload(id));
    }
}