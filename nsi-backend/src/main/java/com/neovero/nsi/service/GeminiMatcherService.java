package com.neovero.nsi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neovero.nsi.dto.MappingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiMatcherService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${spring.ai.vertex.ai.gemini.api-key:${GEMINI_API_KEY:}}")
    private String apiKey;

    public GeminiMatcherService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public MappingResponse analyzeSample(List<List<String>> sampleRows, String additionalInstructions) {
        String sampleJson;
        try {
            sampleJson = objectMapper.writeValueAsString(sampleRows);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting sample to JSON", e);
        }

        String prompt = """
                Você é um especialista em análise de dados hospitalares.
                Vou lhe fornecer uma amostra das primeiras 20 linhas de uma planilha legada de inventário hospitalar, representada como uma matriz JSON.
                Sua tarefa é analisar essas linhas e retornar estritamente um JSON que siga esta estrutura:
                {
                  "headerRowIndex": 0, // índice 0-based da linha que contém os cabeçalhos das colunas
                  "hierarchy": {
                    "centroCustoSourceColumn": "NOME_DA_COLUNA", // coluna que representa o Centro de Custo/Unidade (mais abrangente)
                    "centroCustoIdColumn": "NOME_DA_COLUNA", // (NOVO) coluna de ID do Centro de Custo (ex: CODIGO LOCALIDADE, se houver)
                    "setorSourceColumn": "NOME_DA_COLUNA", // coluna que representa o Setor/Sala (específico)
                    "setorIdColumn": "NOME_DA_COLUNA" // (NOVO) coluna de ID do Setor (ex: CODIGO SETOR, se houver)
                  },
                  "mappings": {
                    "equipmentFamily": "NOME_DA_COLUNA", // Equipamento/Família
                    "model": "NOME_DA_COLUNA", // Modelo
                    "manufacturer": "NOME_DA_COLUNA", // Fabricante/Marca
                    "patrimony": "NOME_DA_COLUNA", // Patrimônio/Plaqueta
                    "serialNumber": "NOME_DA_COLUNA", // Número de Série
                    "acquisitionDate": "NOME_DA_COLUNA", // Data de Aquisição (Tombamento, se houver)
                    "legacyCode": "NOME_DA_COLUNA" // Código legado/BEM numérico (se houver)
                  },
                  "flags": {
                    "capacityFoundInDescription": true/false // se encontrou capacidades (ex: BTUS) junto nas descrições
                  }
                }
                
                ATENÇÃO MÁXIMA PARA AS SEGUINTES REGRAS DA MATRIZ NEOVERO:
                1. As células destino obrigatórias na saída (amarelas) são: SIGLA_EQUIPAMENTO, EQUIPAMENTO, MODELO, FABRICANTE, PATRIMONIO, NUMERO_SERIE, COD_SETOR, SITUACAO. Tente encontrar as colunas de origem equivalentes.
                2. A coluna de origem 'PLAQUETA' quase sempre equivale a 'PATRIMONIO'.
                3. A coluna de origem 'TOMBAMENTO' quase sempre equivale a DATA DE AQUISIÇÃO ('acquisitionDate').
                4. A coluna 'BEM' (quando é número) é o Código Extra/Legado ('legacyCode').
                5. A coluna 'LOCALIDADE' equivale a 'centroCustoSourceColumn' e 'SETOR' a 'setorSourceColumn'. Se existirem colunas numéricas (como 'CODIGO LOCALIDADE', 'CODIGO SETOR'), não esqueça de mapeá-las em 'centroCustoIdColumn' e 'setorIdColumn'.
                
                Se uma coluna não puder ser identificada, deixe null.
                
                """ + (additionalInstructions != null && !additionalInstructions.isBlank() ? "INSTRUÇÕES ADICIONAIS DO USUÁRIO:\n" + additionalInstructions + "\n\n" : "") + """
                Amostra:
                """ + sampleJson;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        int maxRetries = 5;
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                attempt++;
                ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            String text = (String) parts.get(0).get("text");
                            text = text.replace("```json", "").replace("```", "").trim();
                            return objectMapper.readValue(text, MappingResponse.class);
                        }
                    }
                }
                throw new RuntimeException("Invalid response from Gemini API");
            } catch (org.springframework.web.client.HttpServerErrorException.ServiceUnavailable e) {
                if (attempt >= maxRetries) {
                    throw new RuntimeException("Error calling Gemini API: High demand, all retries failed.", e);
                }
                try { Thread.sleep(4000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            } catch (Exception e) {
                throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
            }
        }
        throw new RuntimeException("Max retries exceeded for Gemini API");
    }
}
