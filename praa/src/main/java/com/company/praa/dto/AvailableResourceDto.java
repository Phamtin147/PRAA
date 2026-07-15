package com.company.praa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableResourceDto {
    private Long employeeId;
    private String employeeName;
    private Integer available;
    private String role;
    private String department;
}