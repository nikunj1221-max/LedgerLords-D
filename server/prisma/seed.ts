import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dataDirectory = path.resolve(__dirname, '../data');

type JsonRecord = Record<string, unknown>;
type SeedRow = { id: string; payload: Prisma.InputJsonValue };

function readDataset(filename: string): JsonRecord[] {
  const fullPath = path.join(dataDirectory, filename);
  const parsed: unknown = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${filename} to contain a JSON array.`);
  }
  return parsed as JsonRecord[];
}

function toSeedRows(
  filename: string,
  keyFor: (record: JsonRecord) => unknown
): SeedRow[] {
  const records = readDataset(filename);
  const seenIds = new Set<string>();

  return records.map((record, index) => {
    const key = keyFor(record);
    if (typeof key !== 'string' || key.trim() === '') {
      throw new Error(`${filename}[${index}] has no valid primary key.`);
    }
    if (seenIds.has(key)) {
      throw new Error(`${filename} contains duplicate primary key "${key}".`);
    }
    seenIds.add(key);
    return { id: key, payload: record as Prisma.InputJsonValue };
  });
}

async function seed() {
  const dryRun = process.argv.includes('--dry-run');
  const datasets = [
    ['clients.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.client.createMany({ data, skipDuplicates: true })],
    ['communications.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.communication.createMany({ data, skipDuplicates: true })],
    ['meetings.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.meeting.createMany({ data, skipDuplicates: true })],
    ['usage-metrics.json', (record: JsonRecord) => record.date, (data: SeedRow[]) =>
      prisma.usageMetric.createMany({ data, skipDuplicates: true })],
    ['feature-adoption.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.featureAdoption.createMany({ data, skipDuplicates: true })],
    ['releases.json', (record: JsonRecord) => record.version, (data: SeedRow[]) =>
      prisma.release.createMany({ data, skipDuplicates: true })],
    ['support-incidents.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.supportIncident.createMany({ data, skipDuplicates: true })],
    ['projects.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.project.createMany({ data, skipDuplicates: true })],
    ['tasks.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.task.createMany({ data, skipDuplicates: true })],
    ['employees.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.employee.createMany({ data, skipDuplicates: true })],
    ['availability.json', (record: JsonRecord) =>
      typeof record.employeeId === 'string' && typeof record.date === 'string'
        ? `${record.employeeId}:${record.date}`
        : undefined, (data: SeedRow[]) =>
      prisma.availability.createMany({ data, skipDuplicates: true })],
    ['activities.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.activity.createMany({ data, skipDuplicates: true })],
    ['recommendations.json', (record: JsonRecord) => record.id, (data: SeedRow[]) =>
      prisma.recommendation.createMany({ data, skipDuplicates: true })],
  ] as const;

  for (const [filename, keyFor, insert] of datasets) {
    const rows = toSeedRows(filename, keyFor);
    if (dryRun) {
      console.log(`${filename}: validated ${rows.length} records.`);
      continue;
    }
    const result = await insert(rows);
    console.log(`${filename}: inserted ${result.count} new rows (${rows.length} source records).`);
  }
}

seed()
  .catch(error => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
