package com.company.praa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String customer;
    private String status;
    private String startDate;
    private String endDate;
}