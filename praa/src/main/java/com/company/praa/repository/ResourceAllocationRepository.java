package com.company.praa.repository;

import com.company.praa.entity.ResourceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation, Long> {

    List<ResourceAllocation> findByEmployeeEmployeeId(Long employeeId);

    List<ResourceAllocation> findByProjectProjectId(Long projectId);

    @Query("SELECT COALESCE(SUM(ra.allocationPercent), 0) FROM ResourceAllocation ra WHERE ra.employee.employeeId = :employeeId")
    Integer sumAllocationByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT ra.employee.employeeId, ra.employee.fullName, COALESCE(SUM(ra.allocationPercent), 0) " +
           "FROM ResourceAllocation ra GROUP BY ra.employee.employeeId, ra.employee.fullName " +
           "ORDER BY SUM(ra.allocationPercent) DESC")
    List<Object[]> getUtilizationReport();

    @Query("SELECT ra.employee.employeeId, ra.employee.fullName, ra.employee.role, ra.employee.department, " +
           "(100 - COALESCE(SUM(ra.allocationPercent), 0)) as available " +
           "FROM ResourceAllocation ra GROUP BY ra.employee.employeeId, ra.employee.fullName, ra.employee.role, ra.employee.department " +
           "HAVING SUM(ra.allocationPercent) < 100")
    List<Object[]> getAvailableResources();

    @Query("SELECT ra.employee.employeeId, ra.employee.fullName, COALESCE(SUM(ra.allocationPercent), 0) " +
           "FROM ResourceAllocation ra GROUP BY ra.employee.employeeId, ra.employee.fullName " +
           "HAVING SUM(ra.allocationPercent) > 90")
    List<Object[]> getOverloadedEmployees();
}