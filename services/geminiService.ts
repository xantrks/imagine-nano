/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an edited image using generative AI based on a system instruction, user prompt, and other context.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt from the user describing the desired edit.
 * @param systemInstruction A detailed prompt defining the AI's role and the specific task.
 * @param hotspot Optional {x, y} coordinates on the image to focus the edit.
 * @param referenceImages Optional array of images for context (style, composition, objects).
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    systemInstruction: string,
    hotspot: { x: number, y: number } | null,
    referenceImages: File[]
): Promise<string> => {
    console.log(`Starting generative task with instruction:`, systemInstruction);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [originalImagePart];
    
    let prompt = systemInstruction;
    
    if (userPrompt) {
        prompt += `\nUser Request: "${userPrompt}"`;
    }

    if (hotspot) {
        prompt += `\nEdit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).`;
    }

    if (referenceImages && referenceImages.length > 0) {
        console.log(`Adding ${referenceImages.length} reference image(s).`);
        for (const refImage of referenceImages) {
            parts.push(await fileToPart(refImage));
        }
        prompt += `\n${referenceImages.length} reference image(s) have been provided. These could contain objects, furniture, or clothing to be placed in the scene, or be for style/composition reference. Use them as context for the edit and infer the user's intent from their prompt.`;
    }

    const textPart = { text: prompt };
    parts.push(textPart);

    console.log('Sending image(s) and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: parts },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'AI edit');
};


/**
 * Generates an image from a text prompt using a text-to-image model.
 * @param prompt The text prompt describing the desired image.
 * @returns A promise that resolves to the data URL of the generated image.
 */
export const generateImageFromText = async (
    prompt: string
): Promise<string> => {
    console.log(`Starting text-to-image generation with prompt:`, prompt);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
            },
        });
        console.log('Received response from text-to-image model.', response);

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("The AI model did not return an image. This might be due to safety settings or an issue with the prompt.");
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
        console.error(errorMessage, err);
        throw new Error(`Failed to generate the image. ${errorMessage}`);
    }
};