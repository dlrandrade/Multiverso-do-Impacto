import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ODS } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getODSInstructions = (ods: ODS): string => {
    switch (ods) {
        case ODS.ODS1: return "Incorpore elementos visuais que simbolizam esperança e prosperidade, como correntes douradas se quebrando ou uma aura de luz que emana do peito do herói.";
        case ODS.ODS2: return "O herói deve interagir com plantas que crescem rapidamente ou espigas de trigo douradas luminosas que flutuam ao seu redor.";
        case ODS.ODS3: return "Adicione um símbolo de batimento cardíaco de neon no peito do herói ou uma aura de energia verde-esmeralda curativa envolvendo suas mãos.";
        case ODS.ODS4: return "O herói deve estar manipulando ou cercado por livros antigos com capas brilhantes e páginas que emitem luz.";
        case ODS.ODS5: return "Incorpore o símbolo de igualdade (=) como um glifo de energia flutuando entre as mãos do herói, ou um equilíbrio visual entre as cores azul e amarela no traje.";
        case ODS.ODS6: return "O herói deve controlar esferas de água cristalina e pura, fazendo-as levitar ou girar ao seu redor.";
        case ODS.ODS7: return "Faça com que o herói segure um pequeno sol em miniatura em sua mão ou tenha asas estilizadas feitas de painéis solares futuristas.";
        case ODS.ODS8: return "Incorpore gráficos de crescimento de neon ascendentes ao fundo ou ferramentas de luz sólida (martelo, engrenagem) nas mãos do herói.";
        case ODS.ODS9: return "O corpo do herói deve ter linhas de circuito de neon visíveis sob a pele, e ele deve estar montando uma estrutura holográfica.";
        case ODS.ODS10: return "O herói deve estar quebrando barreiras de vidro ou luz, simbolizando a quebra de desigualdades, com um efeito de estilhaços energéticos.";
        case ODS.ODS11: return "Adicione silhuetas holográficas de edifícios futuristas e ecológicos que o herói parece estar protegendo ou construindo com sua energia.";
        case ODS.ODS12: return "O herói deve ter o símbolo de reciclagem (setas em ciclo) brilhando em suas costas ou como um escudo de energia.";
        case ODS.ODS13: return "Uma metade do herói deve ser coberta de gelo cristalino e a outra de chamas controladas, mostrando domínio sobre os extremos climáticos.";
        case ODS.ODS14: return "Faça com que criaturas marinhas de luz, como águas-vivas ou peixes de neon, nadem graciosamente ao redor do herói.";
        case ODS.ODS15: return "O herói deve ter vinhas luminosas crescendo em seus braços, e borboletas ou pássaros de energia pura voando perto dele.";
        case ODS.ODS16: return "O herói deve segurar uma balança da justiça brilhante ou ter uma pomba branca feita de energia pousada em seu ombro.";
        case ODS.ODS17: return "Adicione múltiplos anéis de luz interconectados que giram em torno do herói, simbolizando parcerias e união global.";
        default: return "O personagem deve ser inspirador, com uma aura de poder sutil e brilhante.";
    }
}

const buildPrompt = (customPrompt: string, ods: ODS) => {
    let characterInstructions = `
**Character Clothing:** The character should be wearing jeans and a simple white college-style shirt.`;
    
    if (customPrompt && customPrompt.trim() !== '') {
        characterInstructions = `
**Character Description:** Transform their body and clothing according to the user's specific request below:
"${customPrompt}"`;
    }

    const odsSpecificInstructions = getODSInstructions(ods);

    return `
You are an expert character concept artist for the "Multiverso do Impacto" project.
Your task is to transform the person from the user-submitted photo into a stylized, futuristic hero whose powers and visual elements are inspired by a specific Sustainable Development Goal (SDG/ODS).

**Primary Output Goal:**
Your final output is a single image layer containing ONLY the character against a solid, pure chroma key green background (#00FF00). This background will be programmatically removed later, so its color must be uniform.

**CRITICAL OUTPUT REQUIREMENT:**
- The generated image's background MUST be a solid, flat, vibrant chroma key green color: hex code #00FF00.
- DO NOT add any other color, gradient, texture, pattern, or any other elements to the background layer.
- The character must be perfectly isolated against this green background.

**Core Instructions (MUST BE FOLLOWED):**
1.  **Facial Likeness:** You MUST retain the person's exact facial likeness, hair color, and distinguishing features from the provided image. This is the most important rule.
2.  **Pose & Composition:** The character MUST be rendered in a full-body, dynamic, zero-gravity floating pose. Do not show them standing or sitting. They must appear to be suspended in the air.

**Thematic Instructions (from chosen SDG):**
- ${odsSpecificInstructions}

**Character & Style Instructions:**
${characterInstructions}

**Aesthetic Style:**
- The overall aesthetic should be inspired by a dark, futuristic world.
- Use a color palette dominated by deep cobalt blue and vibrant electric yellow/gold.
- The lighting on the character must be dramatic and luminescent, as if lit by neon or energy sources.

**Final Image Restrictions:**
- DO NOT generate any text, logos, or watermarks.
- The final image must feel epic, energetic, and impactful.
`;
}


export const generateHeroImage = async (imageFile: File, customPrompt: string, ods: ODS): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: buildPrompt(customPrompt, ods) };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                textPart
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    const firstCandidate = response.candidates?.[0];
    if (firstCandidate?.content?.parts) {
        const imagePart = firstCandidate.content.parts.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("Failed to generate image. The model did not return a valid image part.");
};