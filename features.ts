/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Feature } from "./components/EditingPanel";

// A centralized place for all feature definitions
// This makes it easy to add, remove, or edit features and their prompts

const localEditSystemInstruction = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;

const globalEditSystemInstruction = `You are an expert photo editor AI. Your task is to perform a natural, global edit on the provided image based on the user's request. The edit should affect the entire image photorealistically.

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;


export const features: Record<string, Feature[]> = {
  "Core Editing Tools": [
    {
      name: "Generative Retouch",
      description: "Remove blemishes, fix details, or restore clarity in a specific area. Click on the image to select a point and describe the change.",
      samplePrompts: ["remove the scratch from the table", "fix the tear in the fabric", "make the grass greener here"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: localEditSystemInstruction,
    },
    {
      name: "Backdrop Creator",
      description: "Completely swap or generate a new, realistic background for your image.",
      samplePrompts: ["change the background to a sunny beach with palm trees", "put me in a futuristic city at night", "generate a clean, professional studio background"],
      isInstant: false,
      isGlobal: true,
      systemInstruction: globalEditSystemInstruction,
    },
    {
      name: "AI Object Remover & Replacer",
      description: "Delete or swap objects in the image. Click on the object and describe what you want to do.",
      samplePrompts: ["remove the person in the background", "replace the apple with an orange", "erase the car from the street"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: localEditSystemInstruction,
    },
    {
      name: "Sky & Weather Generator",
      description: "Change the sky and the overall weather of the scene. Add clouds, rain, a sunset, or a starry night.",
      samplePrompts: ["add a dramatic sunset sky", "make it look like it's raining", "replace the sky with a beautiful starry night"],
      isInstant: false,
      isGlobal: true,
      systemInstruction: globalEditSystemInstruction,
    },
     {
      name: "Color Restore & Enhancement",
      description: "Instantly and automatically fix faded colors, correct white balance, and enhance the overall tone and vibrancy of your image.",
      samplePrompts: [],
      isInstant: true,
      isGlobal: true,
      systemInstruction: `You are an expert photo editor AI. Your task is to automatically restore and enhance the colors of the provided image. Fix faded colors, correct white balance, and improve overall vibrancy to make it look professionally remastered. Do not change the content. Output ONLY the final edited image. Do not return text.`,
      instantPrompt: "Automatically restore and enhance the colors of this image.",
    },
  ],
  "Ads & Product Marketing Tools": [
    {
      name: "One-Tap Product Background Remover",
      description: "Instantly creates a clean, transparent background for your product photo, perfect for e-commerce.",
      samplePrompts: [],
      isInstant: true,
      isGlobal: true,
      systemInstruction: `You are an expert photo editor AI specializing in e-commerce. Your task is to identify the main product in the image and remove the background, replacing it with a clean, transparent one. The product cutout must be precise and professional. Output ONLY the final edited image. Do not return text.`,
      instantPrompt: "Remove the background from this product shot, making it transparent.",
    },
    {
      name: "Product Mockups",
      description: "Place your product onto a poster, packaging, billboard, or other marketing material.",
      samplePrompts: ["place this product image on a billboard in Times Square", "create a mockup of this on a coffee mug", "put this on the cover of a magazine"],
      isInstant: false,
      isGlobal: true,
      systemInstruction: globalEditSystemInstruction,
    },
  ],
};

export const generativeLayerFeature: Feature = {
    name: "Generative Layer",
    description: "Apply a global, freeform edit to the entire image by describing the desired change.",
    samplePrompts: ["make the lighting more dramatic", "give the whole image a vintage, faded look", "add a sense of motion to the scene"],
    isInstant: false,
    isGlobal: true,
    systemInstruction: globalEditSystemInstruction,
};

export const filters = [
    { name: 'Photorealistic', prompt: 'Enhance the image to be ultra-photorealistic, with sharp details, perfect lighting, and lifelike textures.', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },
    { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.', imageUrl: 'https://images.unsplash.com/photo-1610337673044-720471f83677?w=400&q=80' },
    { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.', imageUrl: 'https://images.unsplash.com/photo-1583484963886-7685a0834a36?w=400&q=80' },
    { name: 'Cinematic', prompt: 'Apply a cinematic color grade with teal and orange tones, a slight widescreen letterbox, and dramatic lighting.', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    { name: 'Lomography', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.', imageUrl: 'https://images.unsplash.com/photo-1517638083109-a14a1a3a8e97?w=400&q=80' },
    { name: 'Hologram', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.', imageUrl: 'https://images.unsplash.com/photo-1634986666676-45a85f838383?w=400&q=80' },
    { name: 'Watercolor', prompt: 'Convert the image into a soft and delicate watercolor painting with visible brush strokes and paper texture.', imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&q=80' },
    { name: 'Gothic', prompt: 'Apply a dark, gothic aesthetic with desaturated colors, high contrast, and a moody, mysterious atmosphere.', imageUrl: 'https://images.unsplash.com/photo-1587304859063-e381b1d8d902?w=400&q=80' },
    { name: 'Pop Art', prompt: 'Transform the image into a bold Andy Warhol-style pop art piece with vibrant, blocky colors, and a screen-printed look.', imageUrl: 'https://images.unsplash.com/photo-1599425442152-95a357c2a7f5?w=400&q=80' },
    { name: 'Infrared', prompt: 'Simulate an infrared photo effect, turning greens to white or pink and creating a surreal, dreamlike landscape.', imageUrl: 'https://images.unsplash.com/photo-1574863378310-95a94cf4252f?w=400&q=80' },
    { name: 'Golden Hour', prompt: 'Bathe the image in a warm, soft, golden hour light, enhancing the scene with a magical, late-afternoon glow.', imageUrl: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=400&q=80' },
    { name: 'Monochrome Noir', prompt: 'Convert the image to a high-contrast black and white noir style, with deep shadows and dramatic highlights.', imageUrl: 'https://images.unsplash.com/photo-1569470539863-71a7c36a2d9a?w=400&q=80' },
];