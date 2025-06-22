import { type NextRequest, NextResponse } from "next/server"
import { LettaClient } from "@letta-ai/letta-client"

// Initialize Letta client for Letta Cloud using the environment variable
const client = new LettaClient({
  token: process.env.LETTA_API_KEY,
})

// Get the pre-existing image-generating agent's ID from your environment variables.
// This should be the ID of the agent you created that has the `generate_image_with_dalle` tool.
const imageGeneratorAgentId = process.env.LETTA_IMAGE_AGENT_ID;

// Define the interface for the incoming request body
interface CharacterImageRequest {
  name: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the Agent ID is configured on the server
    if (!imageGeneratorAgentId) {
        console.error("LETTA_IMAGE_AGENT_ID environment variable is not set.");
        return NextResponse.json({ error: "Application is not configured correctly for image generation." }, { status: 500 });
    }

    const { name, description }: CharacterImageRequest = await request.json()

    // Validate that we received a character object
    if (!name || !description) {
      return NextResponse.json({ error: "Character name and description are required." }, { status: 400 })
    }

    // Construct a detailed prompt for the DALL-E tool.
    // A more descriptive prompt leads to better images.
    const imagePrompt = `Generate a fantasy character portrait. The character's name is ${name}. Description: "${description}". The style should be a detailed digital painting with an epic fantasy theme.`

    // Call the Letta agent and ask it to use its tool
    const response = await client.agents.messages.create(imageGeneratorAgentId, {
      messages: [
        {
          role: "user",
          content: `Please generate an image using the following prompt: "${imagePrompt}"`,
        },
      ],
    })

    // Extract the image URL from the tool's return message
    let imageUrl = null;
    for (const msg of response.messages) {
        // The image URL will be inside the 'tool_return_message'
        if (msg.messageType === "tool_return_message" && msg.toolReturn) {
            // Assuming the tool returns the URL directly as a string
            const toolOutput = msg.toolReturn as any; // Cast to any to access properties
            if (typeof toolOutput === 'string' && toolOutput.startsWith('http')) {
                 imageUrl = toolOutput;
                 break;
            }
        }
    }

    if (!imageUrl) {
      console.error("Agent did not return a valid image URL. Full response:", response);
      return NextResponse.json({ error: "AI failed to generate an image URL." }, { status: 500 })
    }

    // Return the image URL to the frontend
    return NextResponse.json({ imageUrl })

  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: "Failed to generate character image due to a server error." }, { status: 500 })
  }
}