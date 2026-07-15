package com.company.praa.repository;

import com.company.praa.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    @Query("SELECT e.employeeCode FROM Employee e ORDER BY e.employeeCode DESC LIMIT 1")
    Optional<String> findMaxEmployeeCode();
}