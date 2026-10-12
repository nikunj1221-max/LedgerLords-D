import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWorkspacePromptRelevant } from './promptRelevance';

test('rejects unrelated prompts before workspace planning', () => {
  assert.equal(isWorkspacePromptRelevant('I want to make poha jalebi'), false);
});

test('accepts supported workspace goals', () => {
  assert.equal(isWorkspacePromptRelevant('Prepare a new meeting with selected attendees.'), true);
  assert.equal(isWorkspacePromptRelevant('Investigate why product usage dropped this week.'), true);
  assert.equal(isWorkspacePromptRelevant('Show overdue project work.'), true);
});

test('accepts relevant follow-ups when a workspace already exists', () => {
  assert.equal(isWorkspacePromptRelevant('Show me more like this.', { hasWorkspaceContext: true }), true);
  assert.equal(isWorkspacePromptRelevant('I want to make poha jalebi.', { hasWorkspaceContext: true }), false);
});

test('accepts prompts referring to uploaded dataset columns', () => {
  assert.equal(isWorkspacePromptRelevant('Summarize regional performance.', {
    datasetColumns: [['region', 'performance_score']],
  }), true);
});
