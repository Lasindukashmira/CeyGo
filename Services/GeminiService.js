/**
 * GeminiService.js
 * Uses NVIDIA Kimi K2 AI API (OpenAI-compatible endpoint)
 * Implements streaming via XMLHttpRequest to avoid 504 Gateway Timeouts
 */

const NVIDIA_API_KEY = process.env.EXPO_PUBLIC_NVIDIA_API_KEY;
const BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

/**
 * Send a prompt to NVIDIA Kimi K2 and receive a parsed JSON response.
 * Uses STREAMING mode and accumulates the response to avoid timeouts.
 * @param {string} prompt - The full prompt string
 * @returns {object} Parsed JSON object from the AI response
 */
export const generateWithGemini = async (prompt) => {
    if (!NVIDIA_API_KEY) {
        throw new Error('NVIDIA API key is not configured. Please add EXPO_PUBLIC_NVIDIA_API_KEY to your .env file.');
    }

    console.log('[AI Service] Sending STREAMING request to NVIDIA Kimi K2...');

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BASE_URL);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${NVIDIA_API_KEY}`);

        let seenBytes = 0;

        // This keeps the connection alive even if processing takes time
        xhr.onprogress = () => {
            // We could process chunks here if we wanted real-time UI updates,
            // but for now we just let it accumulate to avoid the status check timeout.
            // console.log(`[AI Stream] Received ${xhr.responseText.length} bytes...`);
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('[AI Service] Stream completed. Parsing...');
                try {
                    // Parse the accumulated SSE stream
                    const lines = xhr.responseText.split('\n');
                    let finalJsonStr = "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                            try {
                                const json = JSON.parse(trimmed.substring(6));
                                if (json.choices?.[0]?.delta?.content) {
                                    finalJsonStr += json.choices[0].delta.content;
                                }
                            } catch (e) {
                                // Ignore parse errors for partial/malformed lines
                            }
                        }
                    }

                    if (!finalJsonStr) {
                        // Fallback: maybe it wasn't a stream or something went wrong
                        console.warn('[AI Service] No stream data found, checking raw response');
                        // Try parsing raw if it wasn't SSE
                        try {
                            const raw = JSON.parse(xhr.responseText);
                            if (raw.choices?.[0]?.message?.content) {
                                finalJsonStr = raw.choices[0].message.content;
                            }
                        } catch (e) { }
                    }

                    if (!finalJsonStr) {
                        reject(new Error('Empty response from AI'));
                        return;
                    }

                    // Clean markdown fences
                    let cleaned = finalJsonStr.trim();
                    if (cleaned.startsWith('```json')) {
                        cleaned = cleaned.slice(7);
                    } else if (cleaned.startsWith('```')) {
                        cleaned = cleaned.slice(3);
                    }
                    if (cleaned.endsWith('```')) {
                        cleaned = cleaned.slice(0, -3);
                    }
                    cleaned = cleaned.trim();

                    const result = JSON.parse(cleaned);
                    console.log('[AI Service] JSON parsed successfully');
                    resolve(result);

                } catch (error) {
                    console.error('[AI Service] Parse error:', error);
                    reject(new Error('Failed to parse AI response: ' + error.message));
                }
            } else {
                console.error('[AI Service] Error:', xhr.status, xhr.responseText);
                // Try to extract error message
                let errorMsg = `API Error: ${xhr.status}`;
                try {
                    const errJson = JSON.parse(xhr.responseText);
                    if (errJson.error?.message) errorMsg += ` - ${errJson.error.message}`;
                } catch (e) { }
                reject(new Error(errorMsg));
            }
        };

        xhr.onerror = () => {
            console.error('[AI Service] Network request failed');
            reject(new Error('Network request failed. Please check your connection.'));
        };

        xhr.ontimeout = () => {
            console.error('[AI Service] Request timed out');
            reject(new Error('Request timed out. The AI model took too long to respond.'));
        };

        // NVIDIA Kimi K2 limits
        xhr.send(JSON.stringify({
            // NVIDIA Nemotron-3 Nano 30B settings
            model: 'nvidia/nemotron-3-nano-30b-a3b',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional Sri Lankan travel planner AI. You MUST respond with valid JSON only. Do not engage in conversation. Output ONLY the JSON object.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            reasoning_budget: 16384,
            chat_template_kwargs: { enable_thinking: true },
            temperature: 0.7,
            top_p: 1,
            max_tokens: 16384,
            stream: true // Critical for avoiding 504
        }));
    });
};
