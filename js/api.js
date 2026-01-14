
import { cleanJSONString, tryRepairJSON } from './utils.js';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzw1OjXLM2twQasXgThqq1OdOdsXm80lT5xCQxTpp8ugOtgmzx3gWqzw2QEJ2Lu0zGjDw/exec';

export async function callGemini(promptText) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST', mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ prompt: promptText }),
        });
        if (!response.ok) throw new Error(`AI Proxy Error: ${response.status}`);
        const rawText = await response.text();
        if (!rawText) throw new Error("AI 응답이 비어있습니다.");
        let data;
        try { data = JSON.parse(rawText); } catch (e) { return parseResult(rawText); }
        if (data && data.error) throw new Error(data.error);
        if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return parseResult(data.candidates[0].content.parts[0].text);
        }
        return parseResult(data);
    } catch (error) { throw new Error(error.message || "AI 서비스 연결 실패"); }
}

function parseResult(result) {
    if (!result) return "";
    if (typeof result === 'object' && !result.candidates) return result;
    const trimmedText = String(result).trim();
    if ((trimmedText.includes('{') && trimmedText.includes('}')) || (trimmedText.includes('[') && trimmedText.includes(']'))) {
        try {
            const cleanedText = cleanJSONString(trimmedText);
            const repaired = tryRepairJSON(cleanedText);
            if (repaired) return repaired;
        } catch (e) {}
    }
    return trimmedText;
}
