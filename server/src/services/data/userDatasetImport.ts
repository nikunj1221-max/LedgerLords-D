const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_RECORDS = 10_000;
const MAX_COLUMNS = 100;

export type ImportedDataset = {
  columns: string[];
  records: Record<string, unknown>[];
};

function validateRecordCount(records: unknown[]): void {
  if (records.length === 0) {
    throw new Error('The file must contain at least one data record.');
  }
  if (records.length > MAX_RECORDS) {
    throw new Error(`The file cannot contain more than ${MAX_RECORDS} records.`);
  }
}

function parseJsonDataset(content: string): ImportedDataset {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('The JSON file is invalid.');
  }

  if (!Array.isArray(parsed) || parsed.some(record =>
    record === null || typeof record !== 'object' || Array.isArray(record)
  )) {
    throw new Error('JSON files must contain an array of objects.');
  }

  validateRecordCount(parsed);
  const records = parsed as Record<string, unknown>[];
  const columns = [...new Set(records.flatMap(record => Object.keys(record)))];
  if (columns.length === 0 || columns.length > MAX_COLUMNS) {
    throw new Error(`JSON records must contain between 1 and ${MAX_COLUMNS} distinct fields.`);
  }
  return { columns, records };
}

function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (inQuotes) {
      if (character === '"') {
        if (content[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      inQuotes = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      row.push(field);
      if (row.some(value => value.length > 0)) rows.push(row);
      row = [];
      field = '';
      if (character === '\r' && content[index + 1] === '\n') index += 1;
    } else if (character === '"') {
      throw new Error('The CSV file contains an unexpected quote.');
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error('The CSV file contains an unclosed quoted field.');
  row.push(field);
  if (row.some(value => value.length > 0)) rows.push(row);
  return rows;
}

function parseCsvDataset(content: string): ImportedDataset {
  const rows = parseCsvRows(content.replace(/^\uFEFF/, ''));
  if (rows.length < 2) {
    throw new Error('The CSV file needs a header row and at least one data record.');
  }

  const columns = rows[0].map(value => value.trim());
  if (columns.some(column => !column) || new Set(columns).size !== columns.length) {
    throw new Error('CSV headers must be non-empty and unique.');
  }
  if (columns.length > MAX_COLUMNS) {
    throw new Error(`The CSV file cannot contain more than ${MAX_COLUMNS} columns.`);
  }

  const dataRows = rows.slice(1);
  validateRecordCount(dataRows);
  if (dataRows.some(dataRow => dataRow.length !== columns.length)) {
    throw new Error('Every CSV row must have the same number of values as the header.');
  }

  return {
    columns,
    records: dataRows.map(dataRow =>
      Object.fromEntries(columns.map((column, index) => [column, dataRow[index]]))
    ),
  };
}

export function importUserDataset(
  format: unknown,
  content: unknown
): ImportedDataset {
  if (format !== 'csv' && format !== 'json') {
    throw new Error('Choose a CSV or JSON file.');
  }
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('The selected file is empty.');
  }
  if (Buffer.byteLength(content, 'utf8') > MAX_UPLOAD_BYTES) {
    throw new Error('Files must be 5 MB or smaller.');
  }

  return format === 'csv' ? parseCsvDataset(content) : parseJsonDataset(content);
}
