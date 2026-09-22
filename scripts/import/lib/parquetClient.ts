// Downloads a dataset's auto-converted Parquet file directly from
// huggingface.co and reads it into plain JS objects.
//
// Why not datasets-server.huggingface.co/rows?
//   That paginated JSON API is aggressively rate-limited (429s after a few
//   hundred requests from one IP, and a token does not lift an IP-level
//   block). Pulling the single Parquet file instead is ONE request to the
//   main huggingface.co domain, so it neither trips nor cares about that
//   limiter — and it's much faster.
//
// Parquet files are published on the refs/convert/parquet branch that
// parallels main. See https://huggingface.co/docs/dataset-viewer/en/parquet

import { parquetReadObjects } from 'hyparquet';

/** Builds the canonical auto-converted Parquet URL for a dataset split. */
export function parquetUrl(opts: {
  dataset: string;
  config?: string;
  split?: string;
  shard?: string;
}): string {
  const { dataset, config = 'default', split = 'train', shard = '0000' } = opts;
  return (
    `https://huggingface.co/datasets/${dataset}` +
    `/resolve/refs%2Fconvert%2Fparquet/${config}/${split}/${shard}.parquet`
  );
}

/**
 * Downloads and parses every row of a dataset split in one request.
 * `hfToken` is optional for public datasets, required for gated ones
 * (the account must have accepted the dataset's access conditions).
 */
export async function fetchParquetRows<T>(opts: {
  dataset: string;
  config?: string;
  split?: string;
  hfToken?: string;
  maxRows?: number;
}): Promise<T[]> {
  const hfToken = opts.hfToken ?? process.env.HF_TOKEN;
  const url = parquetUrl(opts);

  console.log(`Downloading Parquet file:\n  ${url}`);
  const res = await fetch(url, {
    headers: hfToken ? { Authorization: `Bearer ${hfToken}` } : {},
    redirect: 'follow',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Parquet download failed (${res.status}) for ${opts.dataset}: ${body.slice(0, 200)}` +
        (res.status === 401 || res.status === 403
          ? ' — dataset is likely gated; HF_TOKEN must belong to an account that accepted its access conditions.'
          : '') +
        (res.status === 404
          ? ' — the shard/config/split path may differ for this dataset. Check its "Files and versions" tab on the refs/convert/parquet branch.'
          : '')
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  console.log(`Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB. Parsing Parquet...`);

  const rows = (await parquetReadObjects({ file: arrayBuffer })) as T[];
  return opts.maxRows ? rows.slice(0, opts.maxRows) : rows;
}
