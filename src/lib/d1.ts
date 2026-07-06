/**
 * Cloudflare D1 HTTP Query API wrapper for Vercel/Node.js environments.
 */

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

const D1_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;

export interface D1Result<T> {
  results: T[];
  success: boolean;
  meta?: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
    size_after: number;
  };
}

export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<D1Result<T>> {
  if (!CF_ACCOUNT_ID || !CF_D1_DATABASE_ID || !CF_API_TOKEN) {
    // During build time or local mock, return safe defaults if not defined
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing Cloudflare D1 environment variables (CF_ACCOUNT_ID, CF_D1_DATABASE_ID, CF_API_TOKEN).");
    }
    console.warn("D1 environment variables missing. Falling back to empty response.");
    return { results: [], success: true };
  }

  try {
    const res = await fetch(D1_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    });

    const data = await res.json();

    if (!data.success) {
      const errorMsg = data.errors?.[0]?.message || JSON.stringify(data.errors) || "Cloudflare D1 query failed";
      throw new Error(errorMsg);
    }

    // Cloudflare D1 query returns an array of result objects (one per statement sent in the query).
    // Since we always execute a single query statement, we return the first result.
    const queryResult = data.result[0];
    return {
      results: queryResult.results || [],
      success: queryResult.success !== false,
      meta: queryResult.meta,
    };
  } catch (error: any) {
    console.error("D1 Fetch Error:", error.message || error);
    throw error;
  }
}
