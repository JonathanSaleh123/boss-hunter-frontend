import { type NextRequest, NextResponse } from "next/server"
import { LettaClient } from "@letta-ai/letta-client"

// Initialize Letta client for Letta Cloud using the environment variable
const client = new LettaClient({
  token: process.env.LETTA_API_KEY,
})

const characterCreatorAgentId = process.env.LETTA_AGENT_ID;

export async function POST(request: NextRequest) {
  try {
    if (!characterCreatorAgentId) {
        console.error("LETTA_AGENT_ID environment variable is not set.");
        return NextResponse.json({ error: "Application is not configured correctly." }, { status: 500 });
    }

    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }



    // Generate character stats and info
    const response = await client.agents.messages.create(characterCreatorAgentId, {
      responseFormat: { type: "json_object" },
      messages: [
        // Sending only the new user message to the stateful agent
        {
          role: "user",
          content: `Create a complete character sheet for a character named "${name}" with the description: "${description}". Return ONLY a JSON object with this exact structure:
{
  "name": "${name}",
  "description": "${description}",
  "background_info": {
    "backstory": "string",
    "personality": "string",
    "voice": "string",
    "alignment": "string"
  },
  "game_stats": {
    "base_stats": {
      "general": {
        "max_health": "number",
        "speed": "number",
        "attack": "number",
        "defense": "number"
      },
      "advanced": {
        "luck": "number",
        "intelligence": "number",
        "agility": "number",
        "endurance": "number"
      },
      "total_stat_points": 500
    },
    "abilities": ["string", "string", "string"]
  }
}
`,
        },
      ],
    })

    // Extract character data from response
    let characterData = null
    // Looping through message types is the right way to parse responses
    for (const msg of response.messages) {
      if (msg.messageType === "assistant_message" && msg.content) {
        let jsonString = msg.content;
        try {
          characterData = JSON.parse(jsonString);
          break; 
        } catch (parseError) {
          console.error("Failed to parse character JSON. The problematic string was:", jsonString);
          console.error("Parsing Error:", parseError);
        }
      }
    }


    if (!characterData) {
      return NextResponse.json({ error: "AI failed to generate valid character data. Please try again." }, { status: 500 })
    }

    return NextResponse.json(characterData)
  } catch (error) {
    console.error("Character creation error:", error)
    return NextResponse.json({ error: "Failed to create character due to a server error." }, { status: 500 })
  }
}
