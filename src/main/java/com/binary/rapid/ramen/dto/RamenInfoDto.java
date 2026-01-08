package com.binary.rapid.ramen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RamenInfoDto {
    private String id;
    private String name;
    private String title;
    private String info;
    private String image;
}
