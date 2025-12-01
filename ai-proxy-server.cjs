const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');

// 1. SECURITY FIX: Fail if key is missing
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is not set in .env file.");
    process.exit(1);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// 2. UPGRADE: Use gemini-1.5-flash for speed and lower cost
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;

app.use(cors());
app.use(express.json());

const TOPICS = [
    'enrollment', 'schedules', 'grades', 'tuition',
    'campus_map', 'registrar', 'miscellaneous', 'courses_and_programs'
];

let faqContext = '';
let faqEntries = [];
let faqCount = 0;

function detectSuggestedTopic(messageText) {
    const text = (messageText || '').toLowerCase();

    // Campus Map related
    if (text.includes('where') || text.includes('location') || text.includes('map')) {
        return { route: 'campus-map', label: 'Campus Map' };
    }

    // Schedules related
    if (text.includes('schedule') || text.includes('timetable') || text.includes('class time')) {
        return { route: 'schedules', label: 'Schedules' };
    }

    // Grades related
    if (text.includes('grade') || text.includes('gwa') || text.includes('average')) {
        return { route: 'grades', label: 'Grades' };
    }

    // Tuition / fees related
    if (text.includes('tuition') || text.includes('fees') || text.includes('payment')) {
        return { route: 'tuition', label: 'Tuition' };
    }

    // Registrar related
    if (text.includes('registrar') || text.includes('records') || text.includes('shifting')) {
        return { route: 'registrar', label: 'Registrar' };
    }

    return null;
}

function buildMetaFallbackAnswer(messageText, topic) {
    const t = topic || '';

    // Enrollment-related fallback
    if (t === 'enrollment') {
        return "I don't have that specific enrollment detail in my current data. For the most accurate answer, please ask the Student Admission Office (SAO) and the Registrar's Office near Gate 1 at NEMSU Cantilan Campus, or check the latest announcements on the official Facebook page.";
    }

    // Tuition / fees fallback
    if (t === 'tuition') {
        return "I don't have that exact tuition or fee information in my data. For current amounts and payment arrangements, please coordinate with the Registrar's Office and the campus cashier at NEMSU Cantilan Campus.";
    }

    // Schedules / class operations
    if (t === 'schedules') {
        return "I can't see that specific schedule information in my data. For your exact class schedule, changes, or special arrangements, please ask the Student Admission Office (SAO) or request an updated COR from the Registrar's Office.";
    }

    // Grades / records
    if (t === 'grades') {
        return "That level of grade or record detail is not in my data. Please request the official information from the Registrar's Office, as they manage student grades and academic records for NEMSU Cantilan Campus.";
    }

    // Registrar topic
    if (t === 'registrar') {
        return "I don't have that exact registrar process documented. The best option is to visit or contact the Registrar's Office near Gate 1 and ask the staff for the current procedure.";
    }

    // Campus map / locations
    if (t === 'campus_map') {
        return "I don't have that exact location in my map data. Please check the posted campus map boards or ask the guards, SAO or Registrar's Office on campus to point you to the right building or gate.";
    }

    // Miscellaneous / student life
    if (t === 'miscellaneous') {
        return "That specific campus-life detail is not in my current data. For the most accurate and updated information, please ask the Student Admission Office (SAO), Registrar's Office, or the relevant department on campus.";
    }

    // Default generic fallback
    return "I don't have that specific information in my data. Please contact the Student Admission Office (SAO) or Registrar's Office at NEMSU Cantilan Campus so they can give you the latest and most accurate answer.";
}

function scoreFaq(faq, messageText) {
    const text = (messageText || '').toLowerCase();
    if (!text) return 0;

    const questionText = (faq.question || '').toLowerCase();
    let score = 0;

    // Overlap of significant words between message and FAQ question
    const tokens = Array.from(new Set(text.split(/[^a-z0-9]+/).filter((w) => w.length >= 4)));
    for (const token of tokens) {
        if (questionText.includes(token)) {
            score += 1;
        }
    }

    // Keyword matches (stronger signal)
    const keywords = Array.isArray(faq.keywords) ? faq.keywords : [];
    for (const kw of keywords) {
        const kwLower = String(kw).toLowerCase();
        if (kwLower && text.includes(kwLower)) {
            score += 2;
        }
    }

    return score;
}

function loadFAQDatabase() {
    faqEntries = [];

    for (const topic of TOPICS) {
        const filePath = path.join(__dirname, 'ai-data', `${topic}.json`);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${topic}.json`);
            continue;
        }

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.faqs && Array.isArray(data.faqs)) {
                for (const entry of data.faqs) {
                    // Nested group with its own `faqs` array (e.g., courses_and_programs)
                    if (entry && Array.isArray(entry.faqs)) {
                        const nestedTopic = entry.topic || topic;
                        for (const nestedFaq of entry.faqs) {
                            if (!nestedFaq || !nestedFaq.question || !nestedFaq.answer) continue;
                            faqEntries.push({
                                topic, // main topic (e.g., "enrollment") used for routing
                                subTopic: nestedTopic,
                                question: nestedFaq.question,
                                answer: nestedFaq.answer,
                                keywords: Array.isArray(nestedFaq.keywords) ? nestedFaq.keywords : [],
                                category: nestedFaq.category || null,
                            });
                        }
                    } else {
                        if (!entry || !entry.question || !entry.answer) continue;
                        faqEntries.push({
                            topic,
                            question: entry.question,
                            answer: entry.answer,
                            keywords: Array.isArray(entry.keywords) ? entry.keywords : [],
                            category: entry.category || null,
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Error loading ${topic}.json:`, error.message);
        }
    }

    // Create a structured context string for debugging / fallback
    faqContext = faqEntries.map((faq) =>
        `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n---\n');

    faqCount = faqEntries.length;
    console.log(`✅ Loaded ${faqCount} FAQs.`);
    return faqCount;
}

loadFAQDatabase();

app.post('/api/ai-proxy', async (req, res) => {
    const { message, topic } = req.body;

    if (!message) return res.status(400).json({ error: 'Message required' });

    // Select relevant FAQs based on optional topic
    let relevantFaqs = faqEntries;
    if (topic) {
        relevantFaqs = faqEntries.filter((faq) => faq.topic === topic);
    }

    // Fallback to all FAQs if no matches for given topic
    if (!relevantFaqs.length) {
        relevantFaqs = faqEntries;
    }

    // Score FAQs against the user message
    const lowerMessage = (message || '').toLowerCase();
    const scoredFaqs = relevantFaqs
        .map((faq) => ({ faq, score: scoreFaq(faq, lowerMessage) }))
        .sort((a, b) => b.score - a.score);

    // Take only FAQs with positive score
    const topScored = scoredFaqs.filter((entry) => entry.score > 0).slice(0, 20);

    // If nothing looks relevant, return a deterministic meta-answer without calling Gemini
    if (!topScored.length) {
        const metaAnswer = buildMetaFallbackAnswer(message, topic);
        return res.json({ answer: metaAnswer });
    }

    const limitedFaqs = topScored.map((entry) => entry.faq);

    const contextualFaqString = limitedFaqs.map((faq) =>
        `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n---\n');

    // ✅ UPDATED: Using a model confirmed in your list
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `
  You are the NEMSU AI Assistant. Use the following FAQ database to answer the student's question.
  
  RULES:
  1. Only answer based on the context provided.
  2. Keep answers concise.

  FAQ DATABASE (most relevant entries first):
  ${contextualFaqString}

  Student Question: ${message}
  `;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 500,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("🔥 Raw API Error:", errorText);
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

        let finalAnswer = answer || "No response generated.";

        const suggestion = detectSuggestedTopic(message);
        if (suggestion) {
            const currentRoute = (topic || '').replace(/_/g, '-');
            if (suggestion.route !== currentRoute) {
                finalAnswer += `\n\nTip: For more detailed information, try starting a new chat in the "${suggestion.label}" topic in the sidebar.`;
            }
        }

        res.json({ answer: finalAnswer });

    } catch (error) {
        console.error('❌ Processing Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Reload FAQ database endpoint
app.post('/api/reload-faqs', (req, res) => {
    try {
        console.log('🔄 Reloading FAQ database...');
        const count = loadFAQDatabase();
        res.json({
            success: true,
            message: 'FAQ database reloaded successfully',
            count: count
        });
    } catch (error) {
        console.error('❌ Error reloading FAQs:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        aiProvider: 'Google Gemini Pro',
        faqCount,
        topics: TOPICS,
        timestamp: new Date().toISOString()
    });
});

// Test endpoint to see FAQ context (for debugging)
app.get('/api/debug/faq-context', (req, res) => {
    res.json({
        faqCount,
        contextLength: faqContext.length,
        preview: faqContext.substring(0, 500) + '...'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 NEMSU AI Server running on port ${PORT}`);
});