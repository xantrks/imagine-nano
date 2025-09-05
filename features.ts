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
      toolType: 'edit',
    },
    {
      name: "Backdrop Creator",
      description: "Completely swap or generate a new, realistic background for your image.",
      samplePrompts: ["change the background to a sunny beach with palm trees", "put me in a futuristic city at night", "generate a clean, professional studio background"],
      isInstant: false,
      isGlobal: true,
      systemInstruction: globalEditSystemInstruction,
      toolType: 'edit',
    },
    {
      name: "AI Object Remover & Replacer",
      description: "Delete or swap objects in the image. Click on the object and describe what you want to do.",
      samplePrompts: ["remove the person in the background", "replace the apple with an orange", "erase the car from the street"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: localEditSystemInstruction,
      toolType: 'edit',
    },
    {
      name: "Color Restore & Enhancement",
      description: "Instantly and automatically fix faded colors, correct white balance, and enhance the overall tone and vibrancy of your image.",
      samplePrompts: [],
      isInstant: true,
      isGlobal: true,
      systemInstruction: `You are an expert photo editor AI. Your task is to automatically restore and enhance the colors of the provided image. Fix faded colors, correct white balance, and improve overall vibrancy to make it look professionally remastered. Do not change the content. Output ONLY the final edited image. Do not return text.`,
      instantPrompt: "Automatically restore and enhance the colors of this image.",
      toolType: 'edit',
    },
  ],
  "Creative & Fun Tools": [
    {
      name: "Sky & Weather Generator",
      description: "Change the sky and the overall weather of the scene. Add clouds, rain, a sunset, or a starry night.",
      samplePrompts: ["add a dramatic sunset sky", "make it look like it's raining", "replace the sky with a beautiful starry night"],
      isInstant: false,
      isGlobal: true,
      systemInstruction: globalEditSystemInstruction,
      toolType: 'edit',
    },
    {
      name: "Virtual Try-On",
      description: "Virtually try on new clothes. Upload a photo of an outfit or describe what you want to wear, and the AI will dress you. Click on the person you want to dress.",
      samplePrompts: ["put me in a black leather jacket", "change my t-shirt to a blue polo shirt", "dress me in a formal tuxedo"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: `You are an expert fashion photo editor AI. Your task is to realistically change the clothing on a person in the provided image based on the user's request.

Editing Guidelines:
- Identify the person at or near the specified edit location.
- Replace their current clothing with the new clothing described in the user's prompt.
- If a reference image of clothing is provided, use that as the primary source for the new outfit.
- The new clothing must fit the person's body and pose naturally, matching the existing lighting, shadows, and perspective of the scene.
- The rest of the image, including the person's body, head, and the background, must remain identical to the original.
- The result must be photorealistic and seamless.

Output: Return ONLY the final edited image. Do not return text.`,
      toolType: 'edit',
    },
    {
      name: "Ikea Furniture AR",
      description: "Place furniture from reference images into your room. Upload photos of furniture items, select a position in your room photo, and describe the arrangement.",
      samplePrompts: ["place the sofa against the back wall", "put this chair in the corner by the window", "arrange the table and chairs in the center of the room"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: `You are an expert interior design AI with augmented reality capabilities. Your task is to realistically place one or more furniture items (provided as reference images) into a room (the main image) based on the user's request.

Editing Guidelines:
- Identify the furniture item(s) in the provided reference images.
- Place these items into the main room image. The placement location is indicated by the user's click (hotspot coordinates). Use this as the primary anchor point for placing the furniture.
- The arrangement and final positioning should follow the user's text prompt (e.g., "place the sofa against the wall and the lamp next to it").
- The added furniture must be scaled correctly and integrated seamlessly, matching the room's existing lighting, shadows, perspective, and overall style.
- The original room and its existing furniture (unless requested to be replaced) must remain identical.
- The result must be photorealistic and look like a real photo of the room with the new furniture.

Output: Return ONLY the final edited image. Do not return text.`,
      toolType: 'edit',
    },
  ],
  "Map & Location Tools": [
    {
      name: "Isometric Landmark",
      description: "Enter the name of a famous landmark and generate a stylized isometric 3D view of it.",
      samplePrompts: ["Eiffel Tower, Paris", "Statue of Liberty, New York", "Colosseum, Rome"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: "Create a detailed, high-quality, stylized isometric 3D illustration of the following landmark. The style should be clean, vibrant, and suitable for a modern digital art piece. The landmark should be the central focus.",
      toolType: 'map',
    },
    {
      name: "Map Painter",
      description: "Turn any location into a beautiful painting. Enter a place and choose an artistic style.",
      samplePrompts: ["View of the Grand Canal in Venice", "A street in Kyoto during cherry blossom season", "The Scottish Highlands"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: "Create a beautiful painting of the following location. The artwork should be rich in texture and emotion, capturing the essence of the place.",
      toolType: 'map',
      options: {
        styles: ['Watercolor', 'Oil Painting', 'Impressionist', 'Charcoal Sketch', 'Digital Art'],
      },
    },
    {
      name: "Street-Level Perspective",
      description: "Generate a realistic, street-level photo from the perspective of standing at a specific location.",
      samplePrompts: ["Standing in front of Buckingham Palace", "On the Golden Gate Bridge looking towards San Francisco", "Times Square, New York City"],
      isInstant: false,
      isGlobal: false,
      systemInstruction: "Generate a photorealistic, first-person, street-level photograph as if you are standing at the specified location. The image should have a realistic camera perspective, lighting, and depth of field. Capture what a person would see looking forward from that spot.",
      toolType: 'map',
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
      toolType: 'edit',
    },
    {
      name: "Product Mockups",
      description: "Place your product onto a poster, packaging, billboard, or other marketing material.",
      samplePrompts: ["place this product image on a billboard in Times Square", "create a mockup of this on a coffee mug", "put this on the cover of a magazine"],
      isInstant: false,
      isGlobal: true,
      systemInstruction: globalEditSystemInstruction,
      toolType: 'edit',
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
    toolType: 'edit',
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
    { name: 'Monochrome Noir', prompt: 'Convert the image to a high-contrast black and white noir style, with deep shadows and dramatic highlights.', imageUrl: 'https://images.unsplash.com/photo-1569470539863-71a7c3a2d9a?w=400&q=80' },
];