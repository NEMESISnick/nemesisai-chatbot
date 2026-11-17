import { chatAgentLimit } from "../config/agentLimit.js"
import { assertGroqInputSize, getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codingAgent = async (state) => {

    try {
        await chatAgentLimit(state.userId, "coding")

        const llm = await getModel("coding")

        const intentLlm = await getModel("intent")
        const intentPrompt = `
            You are an intent classifier.
            
            Return ONLY one of these values.
            
            CODE_GENERATION
            CODE_REVIEW
            CODE_EXPLANATION
            DEBUGGING
            OPTIMIZATION
            CONVERSION
            DOCUMENTATION
            
            User Request: 
            ${state.prompt}
        `
        assertGroqInputSize(intentPrompt)
        const intentRes = await intentLlm.invoke(intentPrompt)

        // const intent = intentRes.content
        const intent = typeof intentRes.content === "string"
            ? intentRes.content.trim()
            : intentRes.content
                .map((part) => typeof part === "string" ? part : part.text || "")
                .join("")
                .trim()
        console.log(intent)

        if (intent == "CODE_GENERATION") {
            const prompt = `
            you are NemesisAI Coding Agent.
            
            Generate the requested project.
            
            Default stack:
            - HTML
            - CSS
            - JavaScript
            
            Use React / Next.js / Vue ONLY if explicitly requested.
            
            Rules:
            
            - Responsive
            - Modern UI
            - CSS Variables
            - Flexbox/Grid
            - Subtle Hover Effects
            - Beautiful Spacing
            - Single page unless user asks otherwise.
            
            Return ONLY valid JSON.
            
            Schema:
            
            {
                "files":[
                    {
                        "name":"index.html",
                        "content":"..."
                    },
                    {
                        "name":"style.css",
                        "content":"..."
                    },
                    {
                        "name":"script.js",
                        "content":"..."
                    }    
                ]
            }
                
            Rules:
            
            - Output must start with {
            - Output must end with }
            - No markdown
            - No explanation
            - No extra text
            - No \`\`\`
            - Never mention intent
            
            User Request:
            ${state.prompt}
            `


            const res = await llm.invoke(prompt)
            const content = typeof res.content === "string"
                ? res.content
                : res.content
                    .map((part) => typeof part === "string" ? part : part.text || "")
                    .join("")
            const jsonContent = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
            const data = JSON.parse(jsonContent)

            await deductCredits(state.userId, "coding")

            // const data = JSON.parse(res.content)

            if (!Array.isArray(data.files) || data.files.length === 0 || data.files.some((file) => !file || typeof file.name !== "string" || typeof file.content !== "string")) {
                throw new Error("The coding model returned an invalid project file list.")
            }

            console.log("Generated project files:")
            for (const file of data.files) {
                console.log(`\n--- ${file.name} ---\n${file.content}`)
            }

            return {
                ...state,
                aiResponse: "Code generated successfully.",
                artifacts: [
                    {
                        id: Date.now(),
                        type: "project",
                        files: data.files || [],
                        title: state.prompt
                    }
                ]
            }
        }

        const res = await llm.invoke(`
            The user's request is:

            ${intent}
            
            Return Markdown only.
            
            Never generate project files.
            
            Use headings like:
            
            # Overview
            
            ## Explanation
            
            ## Problems
            
            ## Improvements
            
            ## Best Practices
            
            ## Optimized Code (if needed)
            
            User Request:

            ${state.prompt}
        `)

        // const data = res.content
        const data = typeof res.content === "string"
            ? res.content
            : res.content
                .map((part) => typeof part === "string" ? part : part.text || "")
                .join("")

        await deductCredits(state.userId, "coding")

        return {
            ...state,
            aiResponse: data,
            artifacts: []
        }
    } catch (error) {
        console.log(error)
        return {
            ...state,
            aiResponse: error?.data?.message || "failed to generate code",
            artifacts: []
        }
    }




}