import { ApiResponse, Transaction, ApiError } from '../types';

export const fetchTransactions = async (
  scriptUrl: string, 
  month: string,
  username?: string
): Promise<ApiResponse | ApiError> => {
  try {
    // Construct URL with month param
    const url = new URL(scriptUrl);
    url.searchParams.set('type', 'json');
    url.searchParams.set('month', month);
    
    // Add user filter if provided
    if (username) {
      url.searchParams.set('user', username);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Return a mock error object structure
    return { error: String(error) };
  }
};

export const saveTransaction = async (
  scriptUrl: string,
  transaction: Transaction
): Promise<{ success: boolean; message: string }> => {
  try {
    // Google Apps Script doPost often has CORS issues in browser
    // But since the script returns ContentService, standard fetch might work if deployed correctly (Execute as Me, Access: Anyone)
    // We send data as plain text JSON to avoid preflight issues sometimes, but application/json is standard.
    // The script provided parses JSON.parse(e.postData.contents), so we must send JSON string body.

    // Using no-cors mode is often required for GAS if not properly CORS configured, 
    // but no-cors makes the response opaque (cant check success). 
    // We try standard first.
    
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(transaction),
      // 'Content-Type': 'application/json' usually triggers preflight. 
      // GAS often handles text/plain treating it as body content well without preflight.
      // Let's try standard approach.
    });

    // If opaque (mode: no-cors), we assume success if no network error thrown
    if (response.type === 'opaque') {
       return { success: true, message: 'Request sent (Opaque response)' };
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return { success: true, message: text };

  } catch (error) {
    console.error('Post error:', error);
    return { success: false, message: String(error) };
  }
};