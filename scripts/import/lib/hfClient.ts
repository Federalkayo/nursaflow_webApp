// Thin client around the Hugging Face `datasets-server` REST API.
// This avoids needing the Python `datasets` lib or a parquet parser —
// datasets-server returns plain JSON rows, which is all we need here.

const HF_ROWS_URL = 'https://datasets-server.huggingface.co/rows';
const PAGE_SIZE = 100;
const MAX_RETRIES = 5;

export interface HfRowsPage<T> {
  rows: { row_idx: number; row: T }[];
  num_rows_total: number;
}

async function fetchPageWithRetry<T>(
  url: string,
  hfToken?: string
): Promise<HfRowsPage<T>> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      headers: hfToken ? { Authorization: `Bearer ${hfToken}` } : {},
    });

    if (res.ok) {
      return (await res.json()) as HfRowsPage<T>;
    }

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const backoffMs = 3000 * attempt;
      console.warn(`[hf retry] rate limited (429), waiting ${backoffMs}ms (attempt ${attempt}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, backoffMs));
      continue;
    }

    const body = await res.text().catch(() => '');
    throw new Error(
      `HF datasets-server request failed (${res.status}): ${body.slice(0, 300)}` +
        (res.status === 401 || res.status === 403
          ? ' — this dataset is likely gated. Make sure HF_TOKEN belongs to an account that has accepted its access conditions on huggingface.co.'
          : '') +
        (res.status === 429
          ? ' — still rate limited after retries. Try again in a few minutes, or set HF_TOKEN in your shell for a higher authenticated rate limit.'
          : '')
    );
  }
  throw new Error('unreachable');
}

/**
 * Fetches every row of a dataset split, paginating automatically.
 * `hfToken` raises the rate limit even for public datasets, and is
 * required (not just helpful) for gated datasets like AfriMed-QA — the
 * account used to generate it must have already accepted the dataset's
 * access conditions on huggingface.co, or every request will 401.
 */
export async function* fetchAllRows<T>(opts: {
  dataset: string;
  config?: string;
  split?: string;
  hfToken?: string;
  maxRows?: number;
}): AsyncGenerator<T> {
  const { dataset, config = 'default', split = 'train', maxRows } = opts;
  const hfToken = opts.hfToken ?? process.env.HF_TOKEN; // use it if available even when caller didn't pass it explicitly
  let offset = 0;
  let total = Infinity;
  let fetched = 0;

  while (offset < total) {
    const url = `${HF_ROWS_URL}?dataset=${encodeURIComponent(dataset)}&config=${encodeURIComponent(
      config
    )}&split=${encodeURIComponent(split)}&offset=${offset}&length=${PAGE_SIZE}`;

    const data = await fetchPageWithRetry<T>(url, hfToken);
    total = data.num_rows_total;

    for (const r of data.rows) {
      yield r.row;
      fetched += 1;
      if (maxRows && fetched >= maxRows) return;
    }

    offset += PAGE_SIZE;
    // Be polite to the free API.
    await new Promise((r) => setTimeout(r, 300));
  }
}
