
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPharmaceuticalAdvice = async (productName: string, status: string) => {
  const prompt = `Você é um consultor farmacêutico especialista. O produto "${productName}" está com status "${status}". 
  Forneça orientações curtas e profissionais (máximo 3 tópicos) sobre:
  1. Se estiver vencido: Como descartar corretamente de acordo com normas ambientais.
  2. Se estiver próximo ao vencimento: Dicas de armazenamento ou priorização de uso.
  3. Uma curiosidade técnica ou cuidado padrão para este tipo de medicamento.
  Seja direto, ético e use um tom profissional.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Não foi possível obter orientações no momento. Por favor, consulte o manual da ANVISA.";
  }
};
