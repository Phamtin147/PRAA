package com.company.praa.entity;

/**
 * Enum representing the possible statuses of a project.
 * Used to enforce Business Rule 3: Cannot allocate to COMPLETED projects.
 */
public enum ProjectStatus {
    PLANNING,
    ACTIVE,
    COMPLETED
}