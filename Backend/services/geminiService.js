const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI features will be disabled.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      console.log(`✅ Gemini AI service initialized with model: ${this.modelName}`);
    }

    // Default model configuration
    this.modelConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
  }

  /**
   * Check if Gemini service is available
   */
  isAvailable() {
    return !!this.genAI;
  }

  /**
   * Generate note content based on a prompt/topic
   */
  async generateNoteContent(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available. Please configure GEMINI_API_KEY.');
    }

    const {
      tone = 'professional',
      length = 'medium',
      format = 'structured',
      includeExamples = false
    } = options;

    const systemPrompt = this.buildSystemPrompt(tone, length, format, includeExamples);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          ...this.modelConfig,
          maxOutputTokens: this.getMaxTokens(length)
        }
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text().trim();

      // Parse the generated content
      const parsedResult = this.parseGeneratedContent(content);

      return {
        success: true,
        title: parsedResult.title,
        content: parsedResult.content,
        suggestedTags: parsedResult.tags,
        wordCount: parsedResult.content.split(' ').length,
        generatedAt: new Date().toISOString(),
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Gemini Service Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Enhance existing note content
   */
  async enhanceNoteContent(title, content, enhancementType = 'improve') {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available. Please configure GEMINI_API_KEY.');
    }

    const enhancementPrompts = {
      improve: `Please improve and enhance the following note while maintaining its core meaning and structure. Make it clearer, more detailed, better organized, and more engaging to read:`,
      summarize: `Create a concise, well-structured summary of the following note that captures all the key points and main ideas:`,
      expand: `Expand and elaborate on the following note with additional details, examples, explanations, and relevant information that would be helpful:`,
      restructure: `Reorganize and restructure the following note for better readability, logical flow, and improved presentation:`,
      simplify: `Simplify the following note to make it easier to understand, using clear and simple language while preserving all important information:`
    };

    const systemPrompt = `You are an expert writing assistant. Your task is to enhance written content based on specific instructions.

INSTRUCTIONS:
${enhancementPrompts[enhancementType]}

RESPONSE FORMAT:
Always respond in exactly this format:
TITLE: [Enhanced/improved title]
CONTENT: [Enhanced content here]
TAGS: [Relevant tags separated by commas]

Keep the original intent and main ideas intact while making the requested improvements. Ensure the response is well-formatted and professional.`;

    const fullPrompt = `${systemPrompt}

ORIGINAL NOTE:
Title: ${title}
Content: ${content}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          ...this.modelConfig,
          temperature: 0.6,
          maxOutputTokens: 2048
        }
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const enhancedContent = response.text().trim();

      const parsedResult = this.parseGeneratedContent(enhancedContent);

      return {
        success: true,
        originalWordCount: content.split(' ').length,
        enhancedWordCount: parsedResult.content.split(' ').length,
        enhancementType,
        title: parsedResult.title,
        content: parsedResult.content,
        suggestedTags: parsedResult.tags,
        enhancedAt: new Date().toISOString(),
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Gemini Enhancement Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Generate tags for existing content
   */
  async generateTags(title, content, maxTags = 5) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available. Please configure GEMINI_API_KEY.');
    }

    const prompt = `Analyze the following note and generate ${maxTags} highly relevant, specific tags that best categorize and describe the content. The tags should be:
- Single words or short phrases (1-3 words)
- Relevant to the main topics and themes
- Useful for organization and searching
- Professional and descriptive

Return ONLY the tags separated by commas, nothing else.

Title: ${title}
Content: ${content}

Tags:`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          ...this.modelConfig,
          temperature: 0.3,
          maxOutputTokens: 150
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tagsText = response.text().trim();

      const tags = tagsText
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length < 50)
        .slice(0, maxTags);

      return {
        success: true,
        tags,
        generatedAt: new Date().toISOString(),
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Gemini Tags Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Generate note templates for specific topics/use cases
   */
  async generateTemplate(templateType, customPrompt = '') {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available. Please configure GEMINI_API_KEY.');
    }

    const templates = {
      meeting: 'Create a comprehensive meeting notes template with well-organized sections for agenda items, attendees, key discussions, decisions made, action items with owners and deadlines, and next steps.',
      project: 'Create a detailed project planning template with sections for project overview, objectives, scope definition, timeline with milestones, resource requirements, risk assessment, and success metrics.',
      research: 'Create an academic research notes template with sections for topic overview, research questions, literature sources, methodology, key findings, data analysis, and conclusions with references.',
      daily: 'Create a productive daily journal template with sections for daily goals, priority tasks, accomplishments, challenges faced, lessons learned, and reflections for continuous improvement.',
      study: 'Create an effective study notes template with sections for topic overview, learning objectives, key concepts and definitions, detailed explanations, practical examples, and review questions.',
      creative: 'Create an inspiring creative writing template with sections for initial inspiration, character development, plot outline, setting descriptions, dialogue notes, and revision ideas.',
      custom: customPrompt || 'Create a versatile, well-structured note-taking template that can be adapted for various purposes.'
    };

    const systemPrompt = `You are a productivity and organization expert. Create a practical, well-structured template that users can easily fill in and customize for their needs.

RESPONSE FORMAT:
Always respond in exactly this format:
TITLE: [Template title]
CONTENT: [Template content with clear sections, headings, and placeholder text in brackets]
TAGS: [Relevant tags for this template type]

Make the template:
- Practical and easy to use
- Well-organized with clear sections
- Include helpful placeholder text and instructions
- Professional yet approachable
- Adaptable for different situations`;

    const fullPrompt = `${systemPrompt}

Template Request: ${templates[templateType]}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          ...this.modelConfig,
          temperature: 0.4,
          maxOutputTokens: 1500
        }
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const templateContent = response.text().trim();

      const parsedResult = this.parseGeneratedContent(templateContent);

      return {
        success: true,
        templateType,
        title: parsedResult.title,
        content: parsedResult.content,
        suggestedTags: parsedResult.tags,
        createdAt: new Date().toISOString(),
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Gemini Template Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Get writing suggestions for improving content
   */
  async getWritingSuggestions(title, content) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available. Please configure GEMINI_API_KEY.');
    }

    const prompt = `As a professional writing coach, analyze the following note and provide 3-5 specific, actionable suggestions for improvement. Focus on:
- Clarity and readability
- Structure and organization
- Content depth and completeness
- Engagement and flow

Provide suggestions in a numbered list format.

Title: ${title}
Content: ${content}

Writing Suggestions:`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          ...this.modelConfig,
          temperature: 0.5,
          maxOutputTokens: 800
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text().trim();

      return {
        success: true,
        suggestions,
        analyzedAt: new Date().toISOString(),
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Gemini Suggestions Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Generate a comprehensive briefing of the user's recent notes
   */
  async generateWorkspaceBriefing(notes) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available. Please configure GEMINI_API_KEY.');
    }

    if (!notes || notes.length === 0) {
      return {
        success: true,
        summary: "I've scanned your workspace, but it looks like you haven't started your thought repository yet. Create your first note to unlock deep workspace insights!",
        actionItems: ["Create your first note", "Capture a quick thought", "Define a task or goal"],
        themes: ["Getting Started"],
        generatedAt: new Date().toISOString()
      };
    }

    const notesSummary = notes.slice(0, 10).map((n, i) =>
      `Note ${i + 1}: [Title: ${n.title}] - [Content: ${n.content.substring(0, 300)}...]`
    ).join('\n\n');

    const systemPrompt = `You are an elite personal executive assistant and knowledge analyst. Your goal is to provide a high-level, sophisticated BRIEFING for the user based on their recent notes.

INSTRUCTIONS:
1. SUMMARY: Provide a concise, professional 3-4 sentence overview of what the user has been focusing on recently.
2. ACTION ITEMS: Identify 3-5 specific, actionable tasks, deadlines, or follow-ups mentioned or implied in the notes.
3. THEMES & INSIGHTS: Identify the top 2-3 primary themes across all notes and provide a brief insight for each.

RESPONSE FORMAT:
Always respond in exactly this JSON-friendly structured format (NOT JSON, but labeled sections):
OVERVIEW: [Your overview here]
TASKS:
- [Action 1]
- [Action 2]
- [Action 3]
THEMES:
- [Theme 1]: [Insight 1]
- [Theme 2]: [Insight 2]`;

    const fullPrompt = `${systemPrompt}\n\nUSER'S RECENT NOTES:\n${notesSummary}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          ...this.modelConfig,
          temperature: 0.6,
          maxOutputTokens: 1500
        }
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const briefingContent = response.text().trim();

      // Simple parsing
      const overviewMatch = briefingContent.match(/OVERVIEW:\s*([\s\S]*?)(?=TASKS:)/i);
      const tasksMatch = briefingContent.match(/TASKS:\s*([\s\S]*?)(?=THEMES:)/i);
      const themesMatch = briefingContent.match(/THEMES:\s*([\s\S]*)/i);

      return {
        success: true,
        summary: overviewMatch ? overviewMatch[1].trim() : "Unable to generate summary.",
        actionItems: tasksMatch ? tasksMatch[1].trim().split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(l => l) : [],
        themes: themesMatch ? themesMatch[1].trim().split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(l => l) : [],
        generatedAt: new Date().toISOString(),
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Gemini Briefing Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Helper methods
  buildSystemPrompt(tone, length, format, includeExamples) {
    let prompt = `You are an expert content creator and writing assistant. Create high-quality, well-structured notes based on user requests.

RESPONSE FORMAT:
Always respond in exactly this format:
TITLE: [Descriptive, engaging title]
CONTENT: [Well-written note content]
TAGS: [Relevant tags separated by commas]

WRITING GUIDELINES:
`;

    // Tone guidance
    const toneGuidance = {
      professional: 'Use a professional, business-appropriate tone that is clear, authoritative, and suitable for workplace or academic contexts.',
      casual: 'Write in a conversational, friendly tone that feels natural and approachable, like talking to a colleague or friend.',
      academic: 'Employ a scholarly, formal tone with precise language, proper terminology, and structured argumentation suitable for academic work.',
      creative: 'Use an engaging, imaginative tone that is expressive, vivid, and captures the reader\'s attention with creative language.'
    };

    prompt += `- Tone: ${toneGuidance[tone] || toneGuidance.professional}\n`;

    // Length guidance
    if (length === 'short') {
      prompt += '- Length: Keep content concise and focused (150-250 words). Get straight to the point while covering essential information.\n';
    } else if (length === 'long') {
      prompt += '- Length: Provide comprehensive, detailed content (500-800 words). Include thorough explanations, context, and multiple perspectives.\n';
    } else {
      prompt += '- Length: Provide moderate detail and depth (250-500 words). Balance comprehensiveness with readability.\n';
    }

    // Format guidance
    const formatGuidance = {
      'bullet-points': 'Structure content using bullet points, lists, and clear hierarchical organization for easy scanning.',
      'outline': 'Organize content as a detailed outline with numbered or lettered sections, headings, and subheadings.',
      'paragraph': 'Write in well-structured paragraphs with smooth transitions and logical flow between ideas.',
      'structured': 'Use a clear, organized format with appropriate headings, subheadings, and logical sections.'
    };

    prompt += `- Format: ${formatGuidance[format] || formatGuidance.structured}\n`;

    if (includeExamples) {
      prompt += '- Examples: Include relevant, practical examples, case studies, or illustrations where appropriate to clarify concepts.\n';
    }

    prompt += `- Quality: Ensure content is informative, accurate, well-organized, and provides genuine value to the reader.
- Tags: Generate 3-5 relevant tags that accurately categorize the content for easy organization and retrieval.

`;

    return prompt;
  }

  getMaxTokens(length) {
    switch (length) {
      case 'short': return 500;
      case 'long': return 1500;
      default: return 1000;
    }
  }

  parseGeneratedContent(content) {
    const lines = content.split('\n');
    let title = '';
    let noteContent = '';
    let tags = [];

    let currentSection = '';
    let contentLines = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.toUpperCase().startsWith('TITLE:')) {
        title = trimmedLine.replace(/^TITLE:\s*/i, '').trim();
        currentSection = 'title';
      } else if (trimmedLine.toUpperCase().startsWith('CONTENT:')) {
        currentSection = 'content';
        const contentPart = trimmedLine.replace(/^CONTENT:\s*/i, '').trim();
        if (contentPart) {
          contentLines.push(contentPart);
        }
      } else if (trimmedLine.toUpperCase().startsWith('TAGS:')) {
        const tagsString = trimmedLine.replace(/^TAGS:\s*/i, '').trim();
        tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        currentSection = 'tags';
      } else if (currentSection === 'content' && trimmedLine) {
        contentLines.push(trimmedLine);
      }
    }

    noteContent = contentLines.join('\n').trim();

    // Fallback parsing if the expected format is not followed
    if (!title || !noteContent) {
      const fallbackLines = content.split('\n').filter(line => line.trim());
      if (fallbackLines.length > 0) {
        title = title || fallbackLines[0].replace(/^#+\s*/, '').trim(); // Remove markdown headers
        noteContent = noteContent || fallbackLines.slice(title ? 1 : 0).join('\n').trim();
      }
    }

    // Clean up content
    noteContent = noteContent.replace(/^\**\s*/, '').replace(/\s*\**$/, ''); // Remove bold markdown

    return {
      title: title || 'AI Generated Note',
      content: noteContent || content,
      tags: tags.length > 0 ? tags : ['ai-generated', 'gemini']
    };
  }

  getErrorMessage(error) {
    console.error('Gemini Service Full Error:', error);

    if (error.message) {
      if (error.message.includes('API_KEY_INVALID')) {
        return 'Invalid Gemini API key. Please check your configuration.';
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
        return 'Gemini API quota exceeded (Rate Limit). Please wait 30 seconds and try again.';
      } else if (error.message.includes('SAFETY')) {
        return 'Content was blocked for safety reasons.';
      }
      // Return the actual message to identify model/version issues
      return `Gemini AI error: ${error.message}`;
    }

    return 'Gemini AI service is temporarily unavailable.';
  }

  /**
   * Get service statistics and health
   */
  getServiceInfo() {
    return {
      available: this.isAvailable(),
      model: this.modelName,
      provider: 'Google Gemini',
      features: [
        'Content Generation',
        'Content Enhancement',
        'Tag Generation',
        'Template Creation',
        'Writing Suggestions'
      ],
      limits: {
        freeQuota: '15 requests per minute, 1500 per day',
        maxTokens: 2048
      }
    };
  }
}

module.exports = new GeminiService();
