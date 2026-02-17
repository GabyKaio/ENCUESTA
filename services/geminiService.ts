
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResponse } from "../types";

export const getSurveyInsights = async (responses: SurveyResponse[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analiza los siguientes resultados de una encuesta de John Deere en un stand de feria. 
  Proporciona un resumen ejecutivo de 3 puntos clave sobre el sentimiento de los visitantes y qué productos están generando más interés.
  
  Datos: ${JSON.stringify(responses.map(r => ({ role: r.role, nps: r.nps, products: r.selectedProducts })))}
  
  Responde en español, de forma profesional y concisa.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No se pudieron generar insights en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con la IA para análisis.";
  }
};
