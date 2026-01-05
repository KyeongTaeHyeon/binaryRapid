package com.binary.rapid.ramen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RamenPopupDto {
    private String id;
    private String name;
    private String soup;
    private String richness;
    private String rich;
    private String thickness;
}
