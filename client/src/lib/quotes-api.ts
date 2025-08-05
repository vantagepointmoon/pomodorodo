export interface Quote {
  content: string;
  author: string;
}

export async function fetchQuote(): Promise<Quote> {
  try {
    const response = await fetch("/api/quotes");
    if (!response.ok) {
      throw new Error("Failed to fetch quote");
    }
    const data = await response.json();
    
    if (data.fallback) {
      return data.fallback;
    }
    
    return {
      content: data.content,
      author: data.author,
    };
  } catch (error) {
    // Fallback quote
    return {
      content: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
    };
  }
}
