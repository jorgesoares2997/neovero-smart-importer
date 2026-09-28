package com.neovero.nsi.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MappingResponse {
    private Integer headerRowIndex;
    private Hierarchy hierarchy;
    private Mappings mappings;
    private Flags flags;

    @Data
    public static class Hierarchy {
        private String centroCustoSourceColumn;
        private String setorSourceColumn;
    }

    @Data
    public static class Mappings {
        private String equipmentFamily;
        private String model;
        private String manufacturer;
        private String patrimony;
        private String serialNumber;
        private String acquisitionDate;
        private String legacyCode;
    }

    @Data
    public static class Flags {
        private Boolean capacityFoundInDescription;
    }
}
