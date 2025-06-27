import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { LettaClient } from "@letta-ai/letta-client"

// Initialize Letta client for Letta Cloud using the environment variable
const client = new LettaClient({
  token: process.env.LETTA_API_KEY,
})

const characterCreatorAgentId = process.env.LETTA_AGENT_ID;

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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
      messages: [
        {
          role: "user",
          content: `Create a character with the name "${name}" and description "${description}". 
          
          Please provide a JSON response with the following structure:
          {
            "name": "character name",
            "description": "character description", 
            "background_info": {
              "backstory": "detailed backstory",
              "personality": "personality traits",
              "voice": "voice description",
              "alignment": "alignment (Good/Neutral/Evil)"
            },
            "game_stats": {
              "base_stats": {
                "general": {
                  "max_health": number (100-200),
                  "speed": number (50-150), 
                  "attack": number (50-150),
                  "defense": number (50-150)
                },
                "advanced": {
                  "luck": number (10-50),
                  "intelligence": number (50-150),
                  "agility": number (50-150), 
                  "endurance": number (50-150)
                },
                "total_stat_points": number (should equal sum of all stats)
              },
              "abilities": [
                {
                  "name": "ability name",
                  "type": "Passive|Buff|Attack|Debuff",
                  "description": "ability description",
                  "cooldown": number or null
                }
              ],
              "statusEffects": ["effect1", "effect2"]
            }
          }
          
          Make sure the character is balanced and interesting. The total_stat_points should be the sum of all base stats (general + advanced).`
        }
      ]
    });

    // Extract character data from the last assistant message
    let characterData = null;
    for (const msg of response.messages) {
      if (msg.messageType === "assistant_message" && 'content' in msg && msg.content) {
        // Handle the content which might be an array of text content
        if (Array.isArray(msg.content)) {
          characterData = msg.content.map(item => item.text || '').join('');
        } else if (typeof msg.content === 'string') {
          characterData = msg.content;
        }
        break;
      }
    }

    if (!characterData) {
      return NextResponse.json({ error: "AI failed to generate valid character data. Please try again." }, { status: 500 });
    }

    // Parse the JSON response
    let parsedCharacterData;
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = characterData.match(/```json\n([\s\S]*?)\n```/) || 
                       characterData.match(/```\n([\s\S]*?)\n```/) ||
                       characterData.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        parsedCharacterData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        parsedCharacterData = JSON.parse(characterData);
      }
    } catch (parseError) {
      console.error("Failed to parse character data:", parseError);
      console.error("Raw response:", characterData);
      return NextResponse.json({ error: "AI failed to generate valid character data. Please try again." }, { status: 500 });
    }

    // Validate the character data structure
    if (!parsedCharacterData.name || !parsedCharacterData.description || !parsedCharacterData.game_stats) {
      return NextResponse.json({ error: "AI generated incomplete character data. Please try again." }, { status: 500 });
    }

    // Get the user's auth0Id from the session
    const auth0Id = (session.user as any).sub || session.user.email;
    
    // First try to get the existing user
    let userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${auth0Id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let user;
    if (userResponse.ok) {
      // User exists, get the user data
      const userData = await userResponse.json();
      user = userData.user;
    } else {
      // User doesn't exist, create them
      userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image,
          auth0Id: auth0Id,
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error('User creation error:', errorData);
        return NextResponse.json({ error: "Failed to create user record" }, { status: 500 });
      }

      const userData = await userResponse.json();
      user = userData.user;
    }

    // Store the character in MongoDB
    const characterResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterData: parsedCharacterData,
        auth0Id: user.auth0Id,
      }),
    });

    if (!characterResponse.ok) {
      const errorData = await characterResponse.json();
      console.error('Character creation error:', errorData);
      return NextResponse.json({ error: "Failed to save character" }, { status: 500 });
    }

    const { character } = await characterResponse.json();

    return NextResponse.json(character);
  } catch (error) {
    console.error("Character creation error:", error)
    return NextResponse.json({ error: "Failed to create character due to a server error." }, { status: 500 })
  }
}
