package com.company.praa.controller;

import com.company.praa.dto.AvailableResourceDto;
import com.company.praa.dto.EmployeeUtilizationDto;
import com.company.praa.service.AllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/ai")
public class AIController {

    @Autowired
    private AllocationService allocationService;

    @PostMapping("/recommend")
    public ResponseEntity<Map<String, Object>> recommendResources(
            @RequestBody Map<String, Object> request) {

        String role = (String) request.getOrDefault("role", "");
        Integer minAvailable = (Integer) request.getOrDefault("minAvailable", 50);
        Integer count = (Integer) request.getOrDefault("count", 3);

        List<AvailableResourceDto> allAvailable = allocationService.getAvailableResources();

        List<Map<String, Object>> recommended = allAvailable.stream()
                .filter(r -> r.getAvailable() >= minAvailable)
                .sorted((a, b) -> b.getAvailable() - a.getAvailable())
                .limit(count)
                .map(r -> {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("employee", r.getEmployeeName());
                    rec.put("available", r.getAvailable());
                    rec.put("matchScore", r.getAvailable() * 10 / minAvailable);
                    return rec;
                })
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("recommendedResources", recommended);
        result.put("totalFound", recommended.size());
        result.put("query", Map.of("role", role, "minAvailable", minAvailable));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/risk-detection")
    public ResponseEntity<Map<String, Object>> detectRisk(
            @RequestBody Map<String, Object> request) {

        Integer neededResources = (Integer) request.getOrDefault("neededResources", 2);
        String role = (String) request.getOrDefault("role", "");

        List<EmployeeUtilizationDto> overloaded = allocationService.getOverloadedEmployees();
        List<AvailableResourceDto> available = allocationService.getAvailableResources();
        List<EmployeeUtilizationDto> utilization = allocationService.getUtilizationReport();

        double avgUtilization = utilization.stream()
                .mapToInt(EmployeeUtilizationDto::getTotalAllocation)
                .average()
                .orElse(0);

        List<Map<String, Object>> risks = new ArrayList<>();

        if (overloaded.size() > 0) {
            Map<String, Object> risk1 = new HashMap<>();
            risk1.put("type", "OVERLOADED_TEAM");
            risk1.put("message", "Team currently has " + overloaded.size() + " overloaded employees");
            risk1.put("severity", "HIGH");
            risk1.put("recommendation", "Consider redistributing workload before assigning new tasks");
            risks.add(risk1);
        }

        if (avgUtilization > 85) {
            Map<String, Object> risk2 = new HashMap<>();
            risk2.put("type", "HIGH_UTILIZATION");
            risk2.put("message", "Team is at " + String.format("%.0f", avgUtilization) + "% average capacity");
            risk2.put("severity", avgUtilization > 90 ? "CRITICAL" : "MEDIUM");
            risk2.put("recommendation", "Available pool is limited. Plan resource acquisition");
            risks.add(risk2);
        }

        if (available.size() < neededResources) {
            Map<String, Object> risk3 = new HashMap<>();
            risk3.put("type", "INSUFFICIENT_RESOURCES");
            risk3.put("message", "Only " + available.size() + " resources available, need " + neededResources);
            risk3.put("severity", "CRITICAL");
            risk3.put("recommendation", "Consider hiring/contracting or extending timelines");
            risks.add(risk3);
        }

        double teamCapacity = 100 - avgUtilization;
        Map<String, Object> result = new HashMap<>();
        result.put("risks", risks);
        result.put("teamCapacity", String.format("%.0f%%", teamCapacity) + " available");
        result.put("availableResourcesCount", available.size());
        result.put("overloadedCount", overloaded.size());
        result.put("riskLevel", risks.isEmpty() ? "LOW" :
                risks.stream().anyMatch(r -> "CRITICAL".equals(r.get("severity"))) ? "HIGH" : "MEDIUM");

        return ResponseEntity.ok(result);
    }
}