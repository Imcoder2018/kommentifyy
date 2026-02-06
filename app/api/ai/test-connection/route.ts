import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) || 'none',
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    };

    // Try to initialize OpenAI client
    let openai: OpenAI | null = null;
    try {
      openai = new OpenAI({
        apiKey: (process.env.OPENAI_API_KEY || '').trim(),
      });
      diagnostics.clientInitialized = true;
    } catch (initError: any) {
      diagnostics.clientInitialized = false;
      diagnostics.initError = initError.message;
      
      return NextResponse.json({
        success: false,
        message: 'Failed to initialize OpenAI client',
        diagnostics
      });
    }

    // Try to make a simple API call
    try {
      console.log('Testing OpenAI API connection...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "Hello" if you can hear me.' }
        ],
        max_tokens: 10,
      });

      diagnostics.apiCallSuccessful = true;
      diagnostics.response = completion.choices[0].message.content;

      return NextResponse.json({
        success: true,
        message: 'OpenAI API connection working!',
        diagnostics
      });

    } catch (apiError: any) {
      console.error('OpenAI API Test Error:', apiError);
      
      diagnostics.apiCallSuccessful = false;
      diagnostics.apiError = {
        message: apiError.message,
        type: apiError.type,
        code: apiError.code,
        status: apiError.status,
        statusText: apiError.statusText,
      };

      return NextResponse.json({
        success: false,
        message: 'OpenAI API call failed',
        diagnostics
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
