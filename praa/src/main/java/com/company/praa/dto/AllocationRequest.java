package com.company.praa.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Allocation percent is required")
    @Min(value = 1, message = "Allocation must be greater than 0")
    @Max(value = 100, message = "Allocation must not exceed 100")
    private Integer allocationPercent;

    @NotBlank(message = "Role in project is required")
    private String roleInProject;

    @NotNull(message = "Start date is required")
    private String startDate;

    @NotNull(message = "End date is required")
    private String endDate;
}