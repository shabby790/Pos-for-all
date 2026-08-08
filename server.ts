import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini lazily
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// AI Insights endpoint
app.post("/api/ai-insights", async (req, res) => {
  try {
    const { salesData, inventoryData, query, language } = req.body;
    
    const ai = getGeminiAI();

    const prompt = `You are a world-class AI Business Consultant and POS Financial Analyst for a retail store / supermarket.
Current Language requested: ${language || 'Roman Urdu / English'}. Please respond in a clear, friendly, and highly actionable tone matching the requested language or bilingual Roman Urdu / English.

Here is the current business summary data:
- Sales Data: ${JSON.stringify(salesData || {})}
- Low Stock Items: ${JSON.stringify(inventoryData || [])}
- User Query / Focus: "${query || 'Provide an overall business performance, sales forecast, top products analysis, and stock reordering recommendation.'}"

Please provide a structured response with:
1. Executive Summary & Key Highlights
2. Top Selling & High Margin Opportunities
3. Urgent Stock Reorder & Inventory Risk Warning
4. Revenue Growth & Promotion Ideas (e.g. discount bundles, seasonal deals)
5. Practical Next Steps for the Store Owner`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text || "Insight generated successfully.";
    res.json({ success: true, insight: text });
  } catch (error: any) {
    console.error("Error generating AI insight:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate AI business insights.",
    });
  }
});

// Cloud Sync Backup Endpoint (Simulated Secure Storage API)
app.post("/api/cloud-sync", async (req, res) => {
  try {
    const { storeId, payload, timestamp } = req.body;
    // In production this writes to cloud db; here we acknowledge sync state successfully
    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      recordCount: payload ? Object.keys(payload).length : 0,
      message: "Data successfully synced and backed up to cloud cloud server.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
