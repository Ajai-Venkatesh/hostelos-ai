/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 3e3;
app.use(express.json());
let aiClient = null;
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "YOUR_GEMINI_API_KEY_HERE") {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey: key });
      console.log("\u2705 Gemini AI client initialized successfully.");
    } catch (e) {
      console.warn("\u274C Failed to initialize GoogleGenAI client with the provided key:", e);
      return null;
    }
  }
  return aiClient;
}
let mockRequests = [
  {
    id: "req-1",
    studentName: "Alex Mercer",
    roomNumber: "A-204",
    title: "Ceiling Fan Sparks & Noise",
    description: "When I turn on the speed regulator past 2, the ceiling fan makes a loud grinding noise and visible sparks flew out of the motor cover. It is unsafe to use, and our room is extremely hot.",
    category: "maintenance",
    urgency: "critical",
    status: "ai_evaluated",
    createdAt: new Date(Date.now() - 36e5 * 4).toISOString(),
    // 4 hours ago
    aiAssessment: {
      title: "Ceiling Fan Sparks & Motor Grinding",
      category: "maintenance",
      urgency: "critical",
      autoRecommendation: "route_to_warden",
      aiReasoning: "Sparks from electrical devices constitute an immediate fire hazard. Auto-routing to Warden for emergency electrician dispatch. Strongly advise student to keep the switch off.",
      extractedDetails: {
        item: "Ceiling Fan",
        location: "Room A-204 ceiling",
        severity: "Critical (Sparks/Fire risk)",
        timing: "Immediate attention required"
      },
      autoResponse: "\u26A0\uFE0F Urgent Safety Alert: This has been flagged as a CRITICAL electrical hazard. Please keep the fan switch OFF. An electrician is being routed to Room A-204 immediately."
    }
  },
  {
    id: "req-2",
    studentName: "Clara Oswald",
    roomNumber: "B-112",
    title: "Late Gate Pass for Exam Prep",
    description: "Requesting permission to enter the hostel at 11:15 PM tonight. I have a group study session for the Advanced Physics exam at the Central Library, which is open late.",
    category: "permission",
    urgency: "low",
    status: "approved",
    createdAt: new Date(Date.now() - 36e5 * 12).toISOString(),
    // 12 hours ago
    aiAssessment: {
      title: "Late-Night Entry Permission (Central Library)",
      category: "permission",
      urgency: "low",
      autoRecommendation: "approve",
      aiReasoning: "Academic purpose with standard location (Central Library) during exam week. Student has a flawless record. Recommend automated conditional approval.",
      extractedDetails: {
        item: "Late Gate Pass",
        location: "Central Library",
        severity: "Routine / Academic",
        timing: "Tonight, 11:15 PM"
      },
      autoResponse: "Permission pre-approved by AI Agent based on academic schedule and good conduct. Authorized gate entry up to 11:30 PM. Please bring your student ID card."
    },
    wardenAction: {
      action: "approve",
      wardenNotes: "Approved automatically by system rules, confirmed gate log updated.",
      actionedAt: new Date(Date.now() - 36e5 * 11).toISOString()
    }
  },
  {
    id: "req-3",
    studentName: "Julian Alvarez",
    roomNumber: "C-309",
    title: "Spoiled milk served at High Tea",
    description: "During tea today, the milk smelled extremely sour and some of us saw curdling at the bottom of the containers. Please inspect the mess kitchen storage units.",
    category: "mess",
    urgency: "high",
    status: "pending",
    createdAt: new Date(Date.now() - 36e5 * 1).toISOString(),
    // 1 hour ago
    aiAssessment: {
      title: "Spoiled Mess Milk Feedback",
      category: "mess",
      urgency: "high",
      autoRecommendation: "route_to_warden",
      aiReasoning: "Food safety issue affecting multiple residents. High risk of food poisoning. Escalating to Chief Warden and Mess Committee for mandatory inspection.",
      extractedDetails: {
        item: "Milk storage & Mess hygiene",
        location: "Canteen Kitchen / Storage",
        severity: "High (Public health / Food safety)",
        timing: "Immediate inspection recommended"
      },
      autoResponse: "Thank you for flagging this food safety concern. We have forwarded this report directly to the Chief Warden and the Mess Inspector for immediate inspection of storage temperature logs."
    }
  }
];
function getDeterministicAssessment(title, desc) {
  const content = (title + " " + desc).toLowerCase();
  let category = "other";
  let urgency = "low";
  let rec = "route_to_warden";
  let reasoning = "Deterministic local analysis completed due to offline mode.";
  let item = "General";
  let autoResponse = "Your request has been received and logged in our system. A warden will review it shortly.";
  if (content.includes("fan") || content.includes("light") || content.includes("leak") || content.includes("water") || content.includes("maintenance")) {
    category = "maintenance";
    if (content.includes("spark") || content.includes("fire") || content.includes("flood") || content.includes("shock")) {
      urgency = "critical";
      rec = "route_to_warden";
      reasoning = "Safety hazard detected. Routed to warden for emergency maintenance dispatch.";
      autoResponse = "\u26A0\uFE0F CRITICAL SAFETY ALERT: This issue appears to be an emergency. We have notified emergency services and dispatch teams. Please stay clear of any potential hazards.";
    } else {
      urgency = "medium";
      rec = "approve";
      reasoning = "Routine maintenance issue. Automatically scheduled for repairs.";
      autoResponse = "Your maintenance ticket has been generated and scheduled. A technician will visit your room within 24-48 hours.";
    }
    item = content.includes("fan") ? "Fan" : content.includes("light") ? "Light" : "Water system";
  } else if (content.includes("pass") || content.includes("gate") || content.includes("late") || content.includes("leave")) {
    category = "permission";
    if (content.includes("library") || content.includes("exam") || content.includes("study")) {
      urgency = "low";
      rec = "approve";
      reasoning = "Academic request verified against student record. Pre-approved.";
      autoResponse = "Late gate pass pre-approved for library study tonight. Please return before 11:30 PM and show your ID.";
    } else {
      urgency = "medium";
      rec = "route_to_warden";
      reasoning = "Personal travel or late entry requires warden review and consent form verification.";
      autoResponse = "Permission request forwarded to Warden desk. Please check back for warden approval.";
    }
    item = "Gate Pass";
  } else if (content.includes("food") || content.includes("mess") || content.includes("milk") || content.includes("meal")) {
    category = "mess";
    urgency = "medium";
    rec = "route_to_warden";
    reasoning = "Mess feedback regarding food quality. Escalating to kitchen lead.";
    autoResponse = "We appreciate your mess feedback. This has been shared with the Mess Management Committee for review.";
    item = "Catering Quality";
  }
  return {
    title: title || "New Request",
    category,
    urgency,
    autoRecommendation: rec,
    aiReasoning: reasoning,
    extractedDetails: {
      item,
      location: "Student Assigned Room",
      severity: urgency,
      timing: "Standard procedure"
    },
    autoResponse
  };
}
app.get("/api/requests", (req, res) => {
  res.json(mockRequests);
});
app.post("/api/requests", async (req, res) => {
  const { studentName, roomNumber, title, description, category: clientCategory } = req.body;
  if (!studentName || !roomNumber || !title || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = "req-" + Math.random().toString(36).substr(2, 9);
  let assessment;
  const ai = getGenAI();
  if (!ai) {
    assessment = getDeterministicAssessment(title, description);
  } else {
    try {
      const prompt = `
        You are an advanced agentic AI backend for a college hostel portal. Your task is to evaluate and analyze a new student request.
        
        STUDENT NAME: ${studentName}
        ROOM NUMBER: ${roomNumber}
        REQUEST TITLE: ${title}
        REQUEST DESCRIPTION: ${description}
        CLIENT-SUGGESTED CATEGORY: ${clientCategory || "none"}
        
        Analyze this request and return a JSON object with the following fields:
        {
          "title": "A short, polished, professional title summarizing the problem",
          "category": "One of: 'maintenance', 'mess', 'complaint', 'permission', 'other'",
          "urgency": "One of: 'low', 'medium', 'high', 'critical'",
          "autoRecommendation": "One of: 'approve', 'reject', 'route_to_warden', 'clarify'",
          "aiReasoning": "A concise (1-2 sentence) reasoning explaining why you categorized it this way and what action is recommended",
          "extractedDetails": {
            "item": "The physical object, event, or issue under question (e.g. 'Ceiling fan', 'Late gate pass', 'Canteen food quality')",
            "location": "Specific location of interest (e.g., 'Room A-102', 'Canteen kitchen')",
            "severity": "Description of physical or operational risk severity",
            "timing": "When the issue occurred or when action is needed"
          },
          "autoResponse": "A supportive, highly professional response/acknowledgement addressed to the student confirming actions and safety instructions if critical."
        }
        
        Guidelines:
        1. Urgency:
           - Critical: Immediate safety/security hazards (sparks, floods, active fires, broken entry lock, medical emergencies).
           - High: Major discomfort or food safety (no running water, spoiled food, total power failure).
           - Medium: Minor functional problems (fused bulb, slow internet, broken chair, squeaking hinges).
           - Low: Routine requests (late gate pass for exam, clean-up scheduling).
        2. autoRecommendation:
           - "approve": Use only for low-urgency, routine, or pre-approved scenarios (like late gate pass for study, simple room cleaning request).
           - "route_to_warden": Default for complaints, mess food quality reviews, high/critical items, and personal permissions.
           - "reject": Direct rejection if it violates basic policies (e.g., requesting room changes without explanation, throwing parties in rooms).
        
        Return ONLY valid JSON. Do not include any explanation outside of the JSON block.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "";
      assessment = JSON.parse(text);
    } catch (error) {
      console.error("Gemini Request analysis error:", error);
      assessment = getDeterministicAssessment(title, description);
    }
  }
  let status = "ai_evaluated";
  if (assessment.autoRecommendation === "approve") {
    status = "approved";
  } else if (assessment.autoRecommendation === "reject") {
    status = "rejected";
  }
  const newRequest = {
    id,
    studentName,
    roomNumber,
    title: assessment.title || title,
    description,
    category: assessment.category || "other",
    urgency: assessment.urgency || "low",
    status,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    aiAssessment: assessment
  };
  mockRequests.unshift(newRequest);
  res.status(201).json(newRequest);
});
app.post("/api/requests/:id/action", (req, res) => {
  const { id } = req.params;
  const { action, wardenNotes } = req.body;
  if (!action || !["approve", "reject", "resolve", "assign"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }
  const request = mockRequests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }
  let newStatus = request.status;
  if (action === "approve") newStatus = "approved";
  else if (action === "reject") newStatus = "rejected";
  else if (action === "assign") newStatus = "in_progress";
  else if (action === "resolve") newStatus = "resolved";
  request.status = newStatus;
  request.wardenAction = {
    action,
    wardenNotes: wardenNotes || "",
    actionedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json(request);
});
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const ai = getGenAI();
  if (!ai) {
    const lower = message.toLowerCase();
    let response = "I'm running in offline mode. Ask me about mess timings, curfew rules, Wi-Fi, or contacts!";
    if (lower.includes("mess") || lower.includes("food") || lower.includes("timing")) {
      response = "\u{1F37D}\uFE0F **Mess Timings**:\n\n* **Breakfast**: 07:30 AM \u2013 09:30 AM\n* **Lunch**: 12:30 PM \u2013 02:30 PM\n* **High Tea**: 05:00 PM \u2013 06:30 PM\n* **Dinner**: 07:30 PM \u2013 09:30 PM";
    } else if (lower.includes("curfew") || lower.includes("late") || lower.includes("gate")) {
      response = "\u{1F511} **Curfew Rules**:\n\n* Main Gate closes at **10:00 PM**.\n* Late passes (up to 11:30 PM) must be submitted by 8:00 PM via this portal.\n* Overnight leave requires warden clearance + parent email.";
    } else if (lower.includes("laundry") || lower.includes("wash")) {
      response = "\u{1F9FA} **Laundry Schedule**:\n\n* **Mon & Thu**: Wings A & B\n* **Tue & Fri**: Wings C & D\n* **Sat**: Wing E\n* **Sun**: Closed";
    } else if (lower.includes("contact") || lower.includes("phone") || lower.includes("warden")) {
      response = "\u{1F4DE} **Contacts**:\n\n* **Chief Warden**: Dr. Rajesh Kumar \u2014 +1 (555) 019-2831\n* **Girls' Warden**: Prof. Sarah Jenkins \u2014 +1 (555) 019-2832\n* **Boys' Warden**: Mr. David Vance \u2014 +1 (555) 019-2833\n* **Medical**: +1 (555) 019-9000";
    } else if (lower.includes("wifi") || lower.includes("internet")) {
      response = "\u{1F4F6} **Wi-Fi**:\n\n* SSID: `Hostel_HighSpeed_Secure`\n* Login with your university registration ID & password.\n* 10GB daily cap, resets at midnight.";
    }
    return res.json({ response });
  }
  try {
    const SYSTEM_PROMPT = `You are **Aura**, the AI Resident Assistant for a college hostel. Be warm, concise, and use Markdown formatting (bold, bullet lists, emojis).

Hostel Policies:
1. **Mess Timings**: Breakfast 7:30-9:30 AM | Lunch 12:30-2:30 PM | High Tea 5-6:30 PM | Dinner 7:30-9:30 PM
2. **Curfew**: Main gate closes 10 PM. Late passes (till 11:30 PM) via portal by 8 PM. Overnight needs parental NOC.
3. **Laundry**: Mon/Thu=Wings A&B | Tue/Fri=Wings C&D | Sat=Wing E | Sun=Closed
4. **Contacts**: Chief Warden Dr. Rajesh Kumar +1(555)019-2831 | Girls' Warden Prof. Sarah Jenkins +1(555)019-2832 | Boys' Warden Mr. David Vance +1(555)019-2833 | Medical +1(555)019-9000
5. **Wi-Fi**: SSID "Hostel_HighSpeed_Secure" \u2014 university portal login, 10GB/day cap.

For complaints or requests, tell students to use the Submit Request panel in the dashboard.`;
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role && msg.text && msg.id !== "welcome") {
          contents.push({
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        }
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });
    const text = response.text || "Sorry, I could not generate a response.";
    res.json({ response: text });
  } catch (error) {
    console.warn("\u26A0\uFE0F Gemini chat hit rate limits or error. Falling back to local responder.", error?.message || error);
    const lower = message.toLowerCase();
    let response = "I'm running in local assistant mode. How can I help you today?";
    if (lower.includes("mess") || lower.includes("food") || lower.includes("timing") || lower.includes("breakfast") || lower.includes("dinner") || lower.includes("lunch")) {
      response = "\u{1F37D}\uFE0F **Mess Schedule & Timings**:\n\n* **Breakfast**: 07:30 AM \u2013 09:30 AM\n* **Lunch**: 12:30 PM \u2013 02:30 PM\n* **High Tea**: 05:00 PM \u2013 06:30 PM\n* **Dinner**: 07:30 PM \u2013 09:30 PM\n\nAll meals are served in the main dining hall. Let me know if you need to log feedback about the food quality!";
    } else if (lower.includes("curfew") || lower.includes("late") || lower.includes("gate") || lower.includes("pass") || lower.includes("out")) {
      response = "\u{1F511} **Curfew & Late Entry Policy**:\n\n* **Main Gate Curfew**: 10:00 PM daily.\n* **Late Gate Passes** (authorizing entry up to 11:30 PM) must be submitted through the portal dashboard before **8:00 PM**.\n* **Overnight Leave** requires parent confirmation emailed to the wardens.";
    } else if (lower.includes("laundry") || lower.includes("wash") || lower.includes("cloth")) {
      response = "\u{1F9FA} **Laundry Room Schedule**:\n\n* **Mon & Thu**: Wings A & B\n* **Tue & Fri**: Wings C & D\n* **Sat**: Wing E & common areas\n* **Sun**: Closed for maintenance";
    } else if (lower.includes("contact") || lower.includes("phone") || lower.includes("warden") || lower.includes("number") || lower.includes("help")) {
      response = "\u{1F4DE} **Administration & Emergency Directory**:\n\n* **Chief Warden**: Dr. Rajesh Kumar (Office: Room 102 | Ph: +1 (555) 019-2831)\n* **Girls' Assistant Warden**: Prof. Sarah Jenkins (Ph: +1 (555) 019-2832)\n* **Boys' Assistant Warden**: Mr. David Vance (Ph: +1 (555) 019-2833)\n* **Medical Room / Ambulance**: +1 (555) 019-9000 (Available 24/7)";
    } else if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet") || lower.includes("net") || lower.includes("connect")) {
      response = "\u{1F4F6} **Hostel Wi-Fi Connectivity**:\n\n* **SSID (Network)**: `Hostel_HighSpeed_Secure`\n* **Access Portal**: Log in with your standard student ID credentials.\n* **Data Limit**: 10 GB per user daily (resets at midnight). High bandwidth streaming is optimized after 9:00 PM.";
    } else if (lower.includes("complain") || lower.includes("request") || lower.includes("broken") || lower.includes("fix")) {
      response = '\u{1F6E0}\uFE0F **Request Submission Guidelines**:\n\nIf you have a maintenance issue (e.g. broken fan, water leak) or need a gate pass, please use the **"Submit Request"** tab in the main sidebar. It will automatically triage your concern and alert the wardens!';
    } else {
      response = "\u{1F44B} Hello! I'm Aura, your AI Resident Assistant. I can tell you about **curfew timings**, **mess schedules**, **laundry days**, **admin contacts**, and **Wi-Fi login details**. Ask me any question!";
    }
    res.json({ response });
  }
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER;
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
