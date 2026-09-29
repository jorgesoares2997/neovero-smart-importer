package com.neovero.nsi.service;

import com.neovero.nsi.dto.MappingResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

@Service
public class ExcelImportService {

    private final NeoveroNormalizationService normalizationService;

    public ExcelImportService(NeoveroNormalizationService normalizationService) {
        this.normalizationService = normalizationService;
    }

    public List<List<String>> extractSampleRows(MultipartFile file, int maxRows) throws Exception {
        List<List<String>> rows = new ArrayList<>();
        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (rows.size() >= maxRows) break;
                List<String> rowData = new ArrayList<>();
                for (int c = 0; c < row.getLastCellNum(); c++) {
                    Cell cell = row.getCell(c, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    rowData.add(getCellValueAsString(cell));
                }
                boolean allEmpty = rowData.stream().allMatch(String::isEmpty);
                if (!allEmpty) {
                    rows.add(rowData);
                }
            }
        }
        return rows;
    }

    public byte[] generateFinalExcel(MultipartFile originalFile, MappingResponse mapping) {
        try (InputStream is = originalFile.getInputStream();
             Workbook originalWb = WorkbookFactory.create(is);
             InputStream templateIs = getClass().getResourceAsStream("/template.xlsx");
             org.apache.poi.xssf.usermodel.XSSFWorkbook xssfWb = new org.apache.poi.xssf.usermodel.XSSFWorkbook(templateIs)) {
             
             for (int i = 0; i < xssfWb.getNumberOfSheets(); i++) {
                 org.apache.poi.xssf.usermodel.XSSFSheet s = xssfWb.getSheetAt(i);
                 if (!s.getSheetName().equals("Instruções")) {
                     for (int r = s.getLastRowNum(); r > 0; r--) {
                         Row row = s.getRow(r);
                         if (row != null) s.removeRow(row);
                     }
                 }
             }

             try (SXSSFWorkbook wb = new SXSSFWorkbook(xssfWb, 100)) {
            
            CellStyle redStyle = wb.createCellStyle();
            redStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            redStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font redFont = wb.createFont();
            redFont.setColor(IndexedColors.DARK_RED.getIndex());
            redFont.setBold(true);
            redStyle.setFont(redFont);

            Sheet s2 = wb.getSheet("Centros de Custo");
            if (s2 == null) s2 = wb.createSheet("Centros de Custo");
            Sheet s3 = wb.getSheet("Setores");
            if (s3 == null) s3 = wb.createSheet("Setores");
            Sheet s4 = wb.getSheet("Equipamentos");
            if (s4 == null) s4 = wb.createSheet("Equipamentos");
            
            Sheet origSheet = originalWb.getSheetAt(0);
            int headerIdx = mapping.getHeaderRowIndex() != null ? mapping.getHeaderRowIndex() : 0;
            Row headerRow = origSheet.getRow(headerIdx);
            
            Map<String, Integer> colMap = new HashMap<>();
            if (headerRow != null) {
                for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                    String colName = getCellValueAsString(headerRow.getCell(c)).trim();
                    if (!colName.isEmpty()) colMap.put(colName, c);
                }
            }

            int ccIdx = getIndex(colMap, mapping.getHierarchy() != null ? mapping.getHierarchy().getCentroCustoSourceColumn() : null);
            int ccIdIdx = getIndex(colMap, mapping.getHierarchy() != null ? mapping.getHierarchy().getCentroCustoIdColumn() : null);
            int setorIdx = getIndex(colMap, mapping.getHierarchy() != null ? mapping.getHierarchy().getSetorSourceColumn() : null);
            int setorIdIdx = getIndex(colMap, mapping.getHierarchy() != null ? mapping.getHierarchy().getSetorIdColumn() : null);
            int familyIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getEquipmentFamily() : null);
            int modelIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getModel() : null);
            int manufIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getManufacturer() : null);
            int patriIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getPatrimony() : null);
            int serialIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getSerialNumber() : null);
            int legacyIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getLegacyCode() : null);
            int acqDateIdx = getIndex(colMap, mapping.getMappings() != null ? mapping.getMappings().getAcquisitionDate() : null);

            Set<String> uniqueCCs = new HashSet<>();
            Set<String> uniqueSectors = new HashSet<>();
            Set<String> serialsSeen = new HashSet<>();
            Set<String> duplicateSerials = new HashSet<>();
            
            for (int i = headerIdx + 1; i <= origSheet.getLastRowNum(); i++) {
                Row r = origSheet.getRow(i);
                if (r == null) continue;
                String serial = normalizationService.sanitizeSerialNumber(getVal(r, serialIdx));
                if (!serial.isEmpty()) {
                    if (!serialsSeen.add(serial)) {
                        duplicateSerials.add(serial);
                    }
                }
            }

            int ccRowNum = 1;
            int stRowNum = 1;
            int eqRowNum = 1;

            for (int i = headerIdx + 1; i <= origSheet.getLastRowNum(); i++) {
                Row r = origSheet.getRow(i);
                if (r == null) continue;

                String rawCC = getVal(r, ccIdx);
                String rawCCId = getVal(r, ccIdIdx);
                String rawSetor = getVal(r, setorIdx);
                String rawSetorId = getVal(r, setorIdIdx);
                String rawFamily = getVal(r, familyIdx);
                
                if (rawCC.isEmpty() && rawSetor.isEmpty() && rawFamily.isEmpty()) continue;

                String ccCode = !rawCCId.isEmpty() ? rawCCId : normalizationService.generateLocationCode(rawCC);
                String setorCode = !rawSetorId.isEmpty() ? rawSetorId : normalizationService.generateLocationCode(rawSetor);
                
                if (!uniqueCCs.contains(ccCode) && !ccCode.equals("UNDEF")) {
                    uniqueCCs.add(ccCode);
                    Row ccRow = s2.createRow(ccRowNum++);
                    ccRow.createCell(0).setCellValue(ccCode);
                    ccRow.createCell(1).setCellValue(rawCC);
                }

                if (!uniqueSectors.contains(setorCode) && !setorCode.equals("UNDEF")) {
                    uniqueSectors.add(setorCode);
                    Row stRow = s3.createRow(stRowNum++);
                    stRow.createCell(0).setCellValue(setorCode);
                    stRow.createCell(1).setCellValue(rawSetor);
                    stRow.createCell(2).setCellValue(""); 
                    stRow.createCell(3).setCellValue(ccCode);
                }

                if (!rawFamily.isEmpty()) {
                    Row eqRow = s4.createRow(eqRowNum++);
                    String sigla = normalizationService.generateEquipmentAbbreviation(rawFamily);
                    String model = normalizationService.sanitizeModel(getVal(r, modelIdx), rawFamily);
                    String manuf = normalizationService.sanitizeManufacturer(getVal(r, manufIdx));
                    String patri = normalizationService.sanitizePatrimony(getVal(r, patriIdx));
                    String serial = normalizationService.sanitizeSerialNumber(getVal(r, serialIdx));
                    String acqDate = getVal(r, acqDateIdx);
                    String legacy = getVal(r, legacyIdx);

                    eqRow.createCell(0).setCellValue(sigla); // 0: SIGLA_EQUIPAMENTO
                    eqRow.createCell(1).setCellValue(rawFamily.toUpperCase()); // 1: EQUIPAMENTO
                    eqRow.createCell(2).setCellValue(model); // 2: MODELO
                    eqRow.createCell(3).setCellValue(manuf); // 3: FABRICANTE
                    eqRow.createCell(4).setCellValue(""); // 4: REG_ANVISA (empty)
                    eqRow.createCell(5).setCellValue(""); // 5: REG_ANVISA_VAL (empty)
                    eqRow.createCell(6).setCellValue(""); // 6: TAG (empty)
                    eqRow.createCell(7).setCellValue(patri); // 7: PATRIMONIO
                    
                    Cell serialCell = eqRow.createCell(8); // 8: NUMERO_SERIE
                    serialCell.setCellValue(serial);
                    if (!serial.isEmpty() && duplicateSerials.contains(serial)) {
                        serialCell.setCellStyle(redStyle);
                    }

                    eqRow.createCell(9).setCellValue(acqDate); // 9: DATA_AQUISICAO
                    eqRow.createCell(15).setCellValue(setorCode); // 15: COD_SETOR
                    eqRow.createCell(18).setCellValue("PROPRIO"); // 18: SITUACAO
                    eqRow.createCell(19).setCellValue(legacy); // 19: COD_EQUIPAMENTO_EXTRA
                }
            }
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating Excel file", e);
        }
    }

    private int getIndex(Map<String, Integer> map, String colName) {
        if (colName == null) return -1;
        return map.getOrDefault(colName, -1);
    }

    private String getVal(Row row, int index) {
        if (index < 0) return "";
        Cell cell = row.getCell(index, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        return getCellValueAsString(cell).trim();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return new java.text.SimpleDateFormat("dd/MM/yyyy").format(cell.getDateCellValue());
                }
                double val = cell.getNumericCellValue();
                return (val == Math.floor(val)) ? String.valueOf((long) val) : String.valueOf(val);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA: return cell.getCellFormula();
            default: return "";
        }
    }
}
