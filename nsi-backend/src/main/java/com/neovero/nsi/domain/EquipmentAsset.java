package com.neovero.nsi.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAsset {
    private String abbreviation; // SIGLA_EQUIPAMENTO
    private String family;       // EQUIPAMENTO
    private String model;
    private String manufacturer;
    private String patrimony;
    private String serialNumber;
    private String sectorCode;   // COD_SETOR
    private String situation;    // SITUACAO
    private String acquisitionValue; // VALOR_AQUISICAO
    private String observation;
    private String legacyCode;   // COD_EQUIPAMENTO_EXTRA
    
    // UI Metadata
    private boolean isDuplicateSerial;
}
