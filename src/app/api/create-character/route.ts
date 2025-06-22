import { type NextRequest, NextResponse } from "next/server"
import { LettaClient } from "@letta-ai/letta-client"

// Initialize Letta client for Letta Cloud using the environment variable
const client = new LettaClient({
  token: process.env.LETTA_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Create a temporary character creation agent
    const characterAgent = await client.agents.create({
      memoryBlocks: [
        {
          label: "persona",
          value:
            "I am a character creation specialist for RPG games. I analyze character descriptions and generate balanced, creative, and detailed character sheets. I respond only with valid JSON objects that match the requested structure.",
        },
        {
          label: "human",
          value: `The user wants to create a character named "${name}" with this description: "${description}"`,
        },
        {
          label: "game_rules",
          value:
            "Characters need a detailed profile. Based on the description, generate a backstory, personality, voice type, and alignment (e.g., Heroic, Chaotic). For game stats, the total_stat_points should be around 500. This pool is distributed across max_health (base 400 + points), speed, attack, defense, luck, intelligence, agility, and endurance (each base 25-50 + points). Also, select 3 appropriate abilities from a list, a unique signature ability with a name, description, and cooldown, and one condition (e.g., Blessed, Cursed). Stats and abilities must reflect the character's description.",
          // Custom memory blocks require a description to be understood by the agent
          description: "Contains the game rules and detailed character sheet generation guidelines",
        },
      ],
      // Using the recommended model for better performance
      model: "openai/gpt-4.1",
      // Using the recommended embedding model
      embedding: "openai/text-embedding-3-small",
    })

    // Generate character stats and info
    const response = await client.agents.messages.create(characterAgent.id, {
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
    "abilities": ["string", "string", "string"],
    "conditions": ["string"],
    "signature_ability": {
      "name": "string",
      "description": "string",
      "cooldown": "number"
    }
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

    // Cleanup the temporary agent
    await client.agents.delete(characterAgent.id)

    if (!characterData) {
      return NextResponse.json({ error: "AI failed to generate valid character data. Please try again." }, { status: 500 })
    }

    return NextResponse.json(characterData)
  } catch (error) {
    console.error("Character creation error:", error)
    return NextResponse.json({ error: "Failed to create character due to a server error." }, { status: 500 })
  }
}
