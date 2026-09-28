package com.neovero.nsi.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NeoveroNormalizationService {

    private static final List<String> IGNORED_WORDS = Arrays.asList("DE", "DO", "DA", "DOS", "DAS", "E");

    public String generateLocationCode(String description) {
        if (description == null || description.trim().isEmpty()) {
            return "UNDEF";
        }
        String clean = description.toUpperCase().replaceAll("[^A-Z]", "");
        if (clean.length() >= 5) {
            return clean.substring(0, 5);
        }
        return String.format("%-5s", clean).replace(' ', 'X');
    }

    public String generateEquipmentAbbreviation(String family) {
        if (family == null || family.trim().isEmpty()) {
            return "UNDF";
        }
        String clean = family.toUpperCase().replaceAll("[^A-Z\\s]", "");
        List<String> words = Arrays.stream(clean.split("\\s+"))
                .filter(w -> !IGNORED_WORDS.contains(w) && !w.isEmpty())
                .collect(Collectors.toList());

        if (words.size() == 1) {
            String word = words.get(0);
            return word.length() >= 4 ? word.substring(0, 4) : String.format("%-4s", word).replace(' ', 'X');
        } else if (words.size() >= 2) {
            String w1 = words.get(0);
            String w2 = words.get(1);
            String p1 = w1.length() >= 2 ? w1.substring(0, 2) : String.format("%-2s", w1).replace(' ', 'X');
            String p2 = w2.length() >= 2 ? w2.substring(0, 2) : String.format("%-2s", w2).replace(' ', 'X');
            return p1 + p2;
        }
        return "UNDF";
    }

    public String sanitizeModel(String originalModel, String description) {
        if (originalModel == null || isDirtyMarker(originalModel)) {
            return extractCapacity(description).isEmpty() ? "SEM MODELO" : extractCapacity(description);
        }
        String clean = originalModel.trim().toUpperCase();
        String capacity = extractCapacity(description);
        if (!capacity.isEmpty() && !clean.contains(capacity)) {
            return clean + " - " + capacity;
        }
        return clean;
    }

    public String sanitizeManufacturer(String manufacturer) {
        if (manufacturer == null || isDirtyMarker(manufacturer)) {
            return "SEM FABRICANTE";
        }
        return manufacturer.trim().toUpperCase();
    }

    public String sanitizePatrimony(String patrimony) {
        if (patrimony == null || patrimony.trim().isEmpty()) {
            return null;
        }
        String clean = patrimony.trim();
        if (clean.endsWith(".0")) {
            clean = clean.substring(0, clean.length() - 2);
        }
        return clean;
    }

    public String sanitizeSerialNumber(String serialNumber) {
        if (serialNumber == null || isDirtyMarker(serialNumber)) {
            return "";
        }
        return serialNumber.trim().toUpperCase();
    }

    private boolean isDirtyMarker(String text) {
        if (text == null) return true;
        String clean = text.trim().toUpperCase();
        return clean.isEmpty() || clean.equals(".") || clean.equals("-") || clean.equals("NÃO TEM")
                || clean.equals("NAO TEM") || clean.contains("TROCAR") || clean.contains("SUBSTITUIR");
    }

    private String extractCapacity(String description) {
        if (description == null) return "";
        String upper = description.toUpperCase();
        // Regex to find capacity like 12000 BTUS, 12.000 BTUS, etc
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d[\\d\\.,]*\\s*BTUS?)").matcher(upper);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "";
    }
}
