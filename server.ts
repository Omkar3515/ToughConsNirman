import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for generating documents
  app.post("/api/secretary/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in environment variables. Please add it via Settings > Secrets." 
        });
      }

      console.log(`Generating secretary documents for prompt: "${prompt}"`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert Co-operative Housing Society (CHS) Consultant, legal expert, and Society Secretary.
The user has requested the following task:
"${prompt}"

Please prepare a complete, formal, and highly professional set of compliance documents. 
All documents must be realistic, tailored to the user's specific request, and ready for immediate administrative use. Make sure names, addresses, and details are professional (referencing the society or standard templates, avoiding generic placeholder noise where possible).

For the Marathi Version, write a high-quality, professional Marathi (मराठी) translation of the notice and agenda. Use appropriate legal/cooperative housing society terminology (e.g. 'विशेष सर्वसाधारण सभा सूचना', 'कार्यक्रम पत्रिका', 'मसुदा ठराव', 'सभेपुढील विषय').

Return a clean JSON object containing all 11 required sections. Do not truncate any sections. Ensure everything is detailed and fully written.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              notice: {
                type: Type.STRING,
                description: "A formal meeting notice (English), detailing date, time, venue, and purpose.",
              },
              agenda: {
                type: Type.STRING,
                description: "A structured list of agenda items to be discussed at the meeting.",
              },
              explanatoryStatement: {
                type: Type.STRING,
                description: "Explanatory statement under Section 102 of the Companies Act or relevant cooperative housing society bylaws, detailing the background and need for the appointment.",
              },
              attendanceRegister: {
                type: Type.STRING,
                description: "Format/template for members' Attendance Register (columns, table format).",
              },
              proxyForm: {
                type: Type.STRING,
                description: "A formal Proxy Form template in accordance with society bylaws.",
              },
              resolution: {
                type: Type.STRING,
                description: "The formal draft resolution to be passed by the General Body.",
              },
              votingSheet: {
                type: Type.STRING,
                description: "Voting Sheet template (ballot or show of hands recording format).",
              },
              minutesFormat: {
                type: Type.STRING,
                description: "Draft minutes template format with placeholder fields for resolutions passed.",
              },
              marathiVersion: {
                type: Type.STRING,
                description: "A full translation of the Notice & Agenda in Marathi (मराठी आवृत्ती - सभा सूचना व कार्यक्रम पत्रिका) written in clear, formal Marathi.",
              },
              email: {
                type: Type.STRING,
                description: "An elegant, ready-to-send email communication copy with placeholders.",
              },
              whatsAppMessage: {
                type: Type.STRING,
                description: "A concise, well-formatted WhatsApp broadcast alert message with emojis.",
              },
            },
            required: [
              "notice",
              "agenda",
              "explanatoryStatement",
              "attendanceRegister",
              "proxyForm",
              "resolution",
              "votingSheet",
              "minutesFormat",
              "marathiVersion",
              "email",
              "whatsAppMessage",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini API");
      }

      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error: any) {
      console.error("Gemini Secretary API Error:", error);
      res.status(500).json({ 
        error: error.message || "An unexpected error occurred during document generation." 
      });
    }
  });

  // API endpoint for generating speaker-distinguished meeting minutes
  app.post("/api/secretary/generate-minutes", async (req, res) => {
    try {
      const { transcript, activeProjectName } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: "Transcript or notes are required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in environment variables. Please add it via Settings > Secrets." 
        });
      }

      console.log(`Generating meeting minutes for project: "${activeProjectName || 'General'}"`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert Co-operative Housing Society (CHS) Administrator and formal Minutes Writer.
The user has provided a committee meeting recording transcript or detailed meeting notes:
"${transcript}"

The project context is: "${activeProjectName || 'Housing Society Redevelopment'}"

Please automatically process this transcript and draft extremely professional, detailed, and legally compliant minutes of the meeting. You must distinguish speakers, detail discussions, capture member questions, list official decisions, structure proper statutory resolutions with proposer and seconder, and assign clear action points with dates.

Please return a clean JSON object matching the following fields exactly. Ensure all contents are exhaustive, highly professional, and written in full (do not use abbreviated placeholders like "[insert details]").`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              attendance: {
                type: Type.STRING,
                description: "List of attendees with their designations (e.g., Chairman, Secretary, Treasurer, Committee Members, Architect, PMC). Add realistic, professional names if not provided.",
              },
              discussions: {
                type: Type.STRING,
                description: "Detailed description of the key discussion segments of the meeting. Highly structured by agenda/topic.",
              },
              memberQuestions: {
                type: Type.STRING,
                description: "Key questions asked by committee members, housing society members, or other attendees, indicating who asked each question.",
              },
              replies: {
                type: Type.STRING,
                description: "Detailed, professional replies given to the questions asked, indicating who replied (e.g., PMC, Architect, Secretary).",
              },
              decisions: {
                type: Type.STRING,
                description: "Bullet points of all key formal decisions reached by the committee/general body.",
              },
              resolutions: {
                type: Type.STRING,
                description: "Fully formatted, legally compliant draft resolutions passed, complete with Resolution Numbers, proposed by name, seconded by name, and text of the resolution.",
              },
              actionPoints: {
                type: Type.STRING,
                description: "Highly structured table or list of action items, specifying the task, responsible person/team, and the absolute compliance deadline.",
              },
              nextMeetingDate: {
                type: Type.STRING,
                description: "Details regarding the next scheduled meeting, including tentative date, time, and agenda items.",
              },
              speakerLogs: {
                type: Type.STRING,
                description: "A chronological, highly realistic, and speaker-distinguished dialogue log (e.g. 'Ajay Mehta (Chairman): We must finalize this PMC' or 'PMC Representative: The tender is ready.') summarizing the conversation from the transcript.",
              },
            },
            required: [
              "attendance",
              "discussions",
              "memberQuestions",
              "replies",
              "decisions",
              "resolutions",
              "actionPoints",
              "nextMeetingDate",
              "speakerLogs",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini API");
      }

      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Minutes Generation API Error:", error);
      res.status(500).json({ 
        error: error.message || "An unexpected error occurred during minutes writing." 
      });
    }
  });

  // API endpoint for general statutory Notice and Letter Drafting (17 templates)
  app.post("/api/secretary/generate-notice", async (req, res) => {
    try {
      const { templateType, answers, activeProjectName } = req.body;
      if (!templateType) {
        return res.status(400).json({ error: "templateType is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in environment variables. Please add it via Settings > Secrets." 
        });
      }

      console.log(`Drafting notice/letter of type: "${templateType}"`);

      // Construct a summary of custom answers
      const answersSummary = Object.entries(answers || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an elite legal consultant and chief administrator for housing cooperative societies and redevelopments.
The user wants to draft a document of type: "${templateType}"

The current project context is: "${activeProjectName || 'Housing Society Redevelopment'}"
The user has provided the following key information parameters:
${answersSummary}

Please draft an extremely formal, legally sound, and detailed document in English. Do not truncate the body; write the full, professional, long-form draft with appropriate headings, statutory references (such as Section 79A of the Maharashtra Co-operative Societies Act if relevant, or standard CHS rules/bylaws), salutations, and space for signatures.

In addition, provide:
1. A formal Marathi translation of the document (मराठी अनुवाद), using precise and elegant administrative Marathi cooperative terminology.
2. A short, professional WhatsApp broadcast alert that can be copied directly to send to members.
3. High-priority compliance recommendations / next steps for dispatching or serving this notice/letter.

Please return a clean JSON object matching the schema exactly:`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: {
                type: Type.STRING,
                description: "The formal subject line of the drafted notice or letter.",
              },
              content: {
                type: Type.STRING,
                description: "The full, exhaustive, formal text of the document in English. Ready for print.",
              },
              marathiContent: {
                type: Type.STRING,
                description: "The complete, high-quality translation of the notice/letter in formal Marathi (मराठी अनुवाद). Use correct cooperative society terminology.",
              },
              whatsappBroadcast: {
                type: Type.STRING,
                description: "A professional and clear WhatsApp message copy with simple formatting and polite emojis.",
              },
              keyTakeaways: {
                type: Type.STRING,
                description: "Critical action items, compliance tips, or legally mandated serving periods (e.g. 'Must be served 14 clear days before meeting date') for this specific type of notice.",
              },
            },
            required: [
              "subject",
              "content",
              "marathiContent",
              "whatsappBroadcast",
              "keyTakeaways",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini API");
      }

      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Notice Generation API Error:", error);
      res.status(500).json({ 
        error: error.message || "An unexpected error occurred during notice drafting." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
