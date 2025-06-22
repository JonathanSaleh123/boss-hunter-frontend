import { type NextRequest, NextResponse } from "next/server"
import { LettaClient } from "@letta-ai/letta-client"

// Initialize Letta client
const client = new LettaClient({
  token: process.env.LETTA_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Create character creation agent
    const characterAgent = await client.agents.create({
      memoryBlocks: [
        {
          label: "persona",
          value:
            "I am a character creation specialist for RPG games. I analyze character descriptions and generate balanced, creative, and detailed character sheets. I respond only with valid JSON objects containing character data.",
        },
        {
          label: "human",
          value: `The user wants to create a character named "${name}" with this description: "${description}"`,
        },
        {
          label: "game_rules",
          value:
            "Characters need a detailed profile. Based on the description, generate a backstory, personality, voice type, and alignment (e.g., Heroic, Chaotic). For game stats, the total_stat_points should be around 500. This pool is distributed across max_health (base 400 + points), speed, attack, defense, luck, intelligence, agility, and endurance (each base 25-50 + points). Also, select 3 appropriate abilities from a list, a unique signature ability with a name, description, and cooldown, and one condition (e.g., Blessed, Cursed). Stats and abilities must reflect the character's description.",
          description: "Contains the game rules and detailed character sheet generation guidelines",
        },
      ],
      model: "openai/gpt-4o-mini",
      embedding: "openai/text-embedding-3-small",
    })

    // Generate character stats and info
    const response = await client.agents.messages.create(characterAgent.id, {
      messages: [
        {
          role: "user",
          content: `Create a complete character sheet for a character named "${name}" with the description: "${description}". Return ONLY a JSON object with this exact structure, ensuring all fields are populated based on the game rules:
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
        "max_health": number,
        "speed": number,
        "attack": number,
        "defense": number
      },
      "advanced": {
        "luck": number,
        "intelligence": number,
        "agility": number,
        "endurance": number
      },
      "total_stat_points": 500
    },
    "abilities": ["string", "string", "string"],
    "conditions": ["string"],
    "signature_ability": {
      "name": "string",
      "description": "string",
      "cooldown": number
    }
  }
}

Ensure the stats are balanced, creative, and reflect the character's description. The total of all base and advanced stats (excluding total_stat_points itself) should be reasonable for a total pool of 500. Do not include any other text.`,
        },
      ],
    })

    // Extract character data from response
    let characterData = null
    for (const msg of response.messages) {
      if (msg.messageType === "assistant_message" && msg.content) {
        try {
          // Try to parse JSON from the response
          const jsonMatch = msg.content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            characterData = JSON.parse(jsonMatch[0])
            break
          }
        } catch (parseError) {
          console.error("Failed to parse character JSON:", parseError)
        }
      }
    }

    // Cleanup agent
    await client.agents.delete(characterAgent.id)

    if (!characterData) {
      return NextResponse.json({ error: "AI failed to generate character data. Please try again." }, { status: 500 })
    }

    return NextResponse.json(characterData)
  } catch (error) {
    console.error("Character creation error:", error)
    return NextResponse.json({ error: "Failed to create character due to a server error." }, { status: 500 })
  }
}