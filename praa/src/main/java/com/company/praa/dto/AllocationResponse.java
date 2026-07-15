package com.company.praa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationResponse {
    private Long allocationId;
    private Long employeeId;
    private String employeeName;
    private Long projectId;
    private String projectName;
    private Integer allocationPercent;
    private String roleInProject;
    private String startDate;
    private String endDate;
}