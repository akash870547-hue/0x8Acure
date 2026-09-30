#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const contentDir = path.resolve(__dirname, "../content");
const files = fs.readdirSync(contentDir).filter(f => /\.json$/.test(f) && /legal-room-content|room|question|quiz/i.test(f));
if (!files.includes("legal-room-content.json")) files.push("legal-room-content.json");

const questions = [];
for (const file of [...new Set(files)]) {
  const full = path.join(contentDir, file);
  let data;
  try { data = JSON.parse(fs.readFileSync(full, "utf8")); }
  catch (e) { throw new Error(`Cannot parse ${file}: ${e.message}`); }
  const rooms = Array.isArray(data.rooms) ? data.rooms.filter(room => !(file === "legal-room-content.json" && String(room.id||"").startsWith("ch2-"))) : [];
  for (const room of rooms) {
    if (room.official_text_status === "VERIFIED_WORD_FOR_WORD") {
      const roomQuestions = (room.tasks || []).flatMap(t => t.questions || []);
      if ((room.tasks || []).length < 8) throw new Error(`Room ${room.id} has fewer than 8 tasks`);
      if (roomQuestions.length < 10) throw new Error(`Room ${room.id} has fewer than 10 questions`);
      if (!(room.tasks || []).every(t => Array.isArray(t.official_text) && t.official_text.some(x => String(x||"").trim()))) throw new Error(`Room ${room.id} is missing official text in a task`);
    }
    for (const task of room.tasks || []) {
      for (const q of task.questions || []) questions.push({ file, room: room.id, task: task.id, q });
    }
  }
}

const errors = [];
const counts = {};
const fail = (item, msg) => errors.push(`${item.file} :: ${item.room} :: ${item.task} :: ${item.q.id || "<no-id>"} :: ${msg}`);

for (const item of questions) {
  const q = item.q;
  const type = q.type;
  counts[type] = (counts[type] || 0) + 1;
  const itemBase = item;
  if (!type) fail(itemBase, "missing type");
  if (q.answer === undefined && q.correct_answer === undefined) fail(itemBase, "missing answer");
  if (typeof q.why !== "string" || !q.why.trim()) fail(itemBase, "empty explanation (why)");
  if (typeof q.section_reference !== "string" || !q.section_reference.trim()) fail(itemBase, "missing section reference");
  const answer = q.answer !== undefined ? q.answer : q.correct_answer;
  const options = Array.isArray(q.options) ? q.options : [];

  if (["mcq","scenario","scenario-section"].includes(type)) {
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) fail(itemBase, `${type} answer index out of range`);
    if (options.length < 2) fail(itemBase, `${type} needs at least 2 options`);
  } else if (type === "true_false") {
    if (!Number.isInteger(answer) || ![0,1].includes(answer)) fail(itemBase, "true/false answer must be 0 or 1");
    if (options.length < 2) fail(itemBase, "true/false needs two options");
  } else if (type === "flag") {
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) fail(itemBase, "flag answer index out of range");
    if (!String(options[answer] || "").trim()) fail(itemBase, "flag correct option is empty");
  } else if (type === "match") {
    if (!Array.isArray(q.pairs) || !q.pairs.length) fail(itemBase, "match needs non-empty pairs");
    if (!Array.isArray(answer) || answer.length !== q.pairs.length) fail(itemBase, "match answer must be an array matching pair count");
    for (let i=0; i<(q.pairs||[]).length; i++) {
      const p=q.pairs[i];
      if (!p || typeof p.left !== "string" || !p.left.trim()) fail(itemBase, `match pair ${i} missing left`);
      if (!Array.isArray(p.right_options) || p.right_options.length < 2) fail(itemBase, `match pair ${i} needs right_options`);
      if (!Number.isInteger(answer?.[i]) || answer[i] < 0 || answer[i] >= p.right_options.length) fail(itemBase, `match answer ${i} out of range`);
    }
  } else if (type === "multi-select") {
    if (!Array.isArray(answer) || !answer.length) fail(itemBase, "multi-select answer must be a non-empty array");
    const unique = new Set(answer || []);
    if (unique.size !== (answer || []).length) fail(itemBase, "multi-select answer contains duplicate indexes");
    if ((answer || []).some(i => !Number.isInteger(i) || i < 0 || i >= options.length)) fail(itemBase, "multi-select answer index out of range");
    if (options.length < 2) fail(itemBase, "multi-select needs at least 2 options");
  } else if (type === "order") {
    if (!Array.isArray(answer) || !answer.length) fail(itemBase, "order answer must be a non-empty array");
    const unique = new Set(answer || []);
    if (unique.size !== (answer || []).length) fail(itemBase, "order answer contains duplicate indexes");
    if ((answer || []).some(i => !Number.isInteger(i) || i < 0 || i >= options.length)) fail(itemBase, "order answer index out of range");
    if (answer.length !== options.length) fail(itemBase, "order answer must contain every option exactly once");
  } else {
    fail(itemBase, `unsupported question type: ${type}`);
  }
}

const required=["mcq","true_false","flag","scenario","scenario-section","match","multi-select","order"];
for (const type of required) if (!counts[type]) errors.push(`GLOBAL :: missing required question type: ${type}`);

console.log("0x8Acure quiz type harness");
console.log("Files scanned:", files.join(", "));
console.log("Questions:", questions.length);
console.log("Counts:", JSON.stringify(counts));
console.log("Validation errors:", errors.length);
if (errors.length) {
  console.error("\nFAIL");
  console.error(errors.slice(0, 200).join("\n"));
  if (errors.length > 200) console.error(`... and ${errors.length-200} more`);
  process.exit(1);
}
console.log("\nPASS: every question has a valid answer shape, non-empty explanation, and section reference.");
