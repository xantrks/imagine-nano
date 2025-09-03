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
 * @param referenceImage Optional image for general reference (style, composition, object).
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    systemInstruction: string,
    hotspot: { x: number, y: number } | null,
    referenceImage?: File | null
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

    if (referenceImage) {
        console.log('Adding generic reference image.');
        parts.push(await fileToPart(referenceImage));
        prompt += `\nAn additional reference image has been provided. Use it as context for the edit. It could be for style, composition, or to provide an object to be included. Infer the user's intent from their prompt.`;
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