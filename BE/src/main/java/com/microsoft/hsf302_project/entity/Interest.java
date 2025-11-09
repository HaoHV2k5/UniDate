package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "interests")
public class Interest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interest_id")
    private Long id;
    //name
    @Column(columnDefinition = "NVARCHAR(50)")
    private String name;
    @Column(columnDefinition = "NVARCHAR(50)")
    private String category;

    public Interest(String name, String category) {
        this.name = name;
        this.category = category;
    }
}
