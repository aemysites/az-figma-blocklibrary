---
name: excat-content-mapper
description: Maps content from a website into existing blocks. Use when block variants already exist in blocks/ and user wants to map content from URLs (single page, URL list, or site) into those blocks. Invoke for "map content from website" or similar.
---

# Content Mapper

Map content from a website into existing block variants in `blocks/`. Delegates to site analysis, page analysis, block mapping, import infrastructure, and content import. **Sections map only to existing block variants**; no new variants. Unmapped sections are **skipped** (not imported, not converted to default-content); they are listed and confirmed before proceeding.

---

## Workflow Overview

This workflow has 7 major steps (0-6):
- Execute all steps in order without skipping
- Update migration plan after each step

**TODO List Ownership:** This orchestrator OWNS the 7-step todo list. Re-assert it after sub-agents complete.

**User Confirmation Points:**
1. After Migration Plan (Step 0)
2. Before each major step (Steps 1-6)
3. When existing artifacts are found ("Skip or redo?")
4. **After Step 3:** Section-to-block mapping list (Proceed or Cancel)

---

## When to Use This Skill

Use this skill when:
- User wants to **map content from a website** (or "map content from URLs") into existing blocks
- Block variants already exist in `blocks/` (e.g. from Figma migration or prior work)
- Content source is URLs (single page, URL list, or site)

**Do NOT use for:**
- Migrating blocks from Figma (use `excat-figma-migration`)
- Migrating a website and creating blocks from scratch (use `excat-site-migration`)

---

## Prerequisite

`blocks/` must contain at least one variant directory (name contains a hyphen, e.g. `hero-campaign`, `cards-service`). If none: do not proceed; ask user to add or migrate blocks first.

---

## Migration Modes

### 1. URL List Mode
**Input:** Multiple URLs  
**Flow:** Site Analysis → Page Analysis (with mapping list) → Block Mapping → Import Infrastructure → Content Import

### 2. Single Page Mode
**Input:** Single URL  
**Flow:** Site Analysis → Page Analysis (with mapping list) → Block Mapping → Import Infrastructure → Content Import

### 3. Template-Based Mode
**Input:** Template name from existing `page-templates.json`  
**Flow:** Page Analysis (with mapping list) → Block Mapping → Import Infrastructure → Content Import  
**Note:** Skips Site Analysis

---

## Delegated Skills and Sub-Agents

**Sub-Agents (internal):**
- `excat-project-expert` - Detects project type, configures block library

**Skills:**
- `excat-site-analysis` - Creates page template skeletons
- `excat-page-analysis` - Analyzes page structure, produces authoring-analysis with variant names
- `block-mapping-manager` - Populates block mappings (mapped blocks only)
- `excat-import-infrastructure` - Generates parsers and transformers
- `excat-import-script` - Generates import.js scripts
- `excat-content-import` - Executes content import

---

## Complete Workflow

### Execution Checklist

```markdown
- [ ] Step 0: Initialize Migration Plan (validate blocks/ first)
- [ ] Step 1: Project Setup
- [ ] Step 2: Site Analysis (skip for Template-Based mode)
- [ ] Step 3: Page Analysis (pre-snapshot, mapping list + AskUserQuestion)
- [ ] Step 4: Block Mapping (mapped blocks only)
- [ ] Step 5: Import Infrastructure
- [ ] Step 6: URL Classification and Content Import
```

**How to use:**
1. Copy checklist above
2. Execute each step in order
3. Check off steps as you complete them
4. Update migration plan after each step

---

### Step 0: Initialize Migration Plan

**0.0 Validate blocks/ (MANDATORY)**

1. List directories under `blocks/` whose names contain a hyphen.
2. If **none:** Tell user "No block variants in blocks/. Add or migrate blocks first, then map content." Stop.
3. If **at least one:** Continue to 0.1.

**0.1 Initialize Todo Tracking**

Invoke `TodoWrite`:
```json
{
  "merge": false,
  "todos": [
    {"activeForm": "step-0", "content": "Initialize Migration Plan", "status": "in_progress"},
    {"activeForm": "step-1", "content": "Project Setup", "status": "pending"},
    {"activeForm": "step-2", "content": "Site Analysis", "status": "pending"},
    {"activeForm": "step-3", "content": "Page Analysis", "status": "pending"},
    {"activeForm": "step-4", "content": "Block Mapping", "status": "pending"},
    {"activeForm": "step-5", "content": "Import Infrastructure", "status": "pending"},
    {"activeForm": "step-6", "content": "Content Import", "status": "pending"}
  ]
}
```

**0.2 Detect Mode and Validate Input**

Detect mode:
```
"migrate my site" (no URLs) → Prompt for URL list
TLD only → Ask: homepage or specific pages?
Multiple URLs → URL List Mode
Single URL with path → Single Page Mode
Template name → Template-Based Mode
```

**Special Handling:**
1. **"Migrate my site" without URLs:** Respond "Please provide the URLs to migrate." Show format examples. Wait for list.
2. **TLD only:** Ask "1) Homepage only, or 2) Specific pages?" Homepage → Single Page; specific → ask for list, URL List Mode.

**0.3 Detect Existing Work**
- If `./migration-work/migration-plan.md` exists: Ask "Found existing plan. Continue or start fresh?"

**0.4 Generate Migration Plan**

Create `./migration-work/migration-plan.md`:
```markdown
# Migration Plan: [Name]
**Mode:** [URL List | Single Page | Template-Based]
**Source:** [N URLs | Single URL | Template Name]
**Generated:** [timestamp]

## Steps
- [ ] 1. Project Setup
- [ ] 2. Site Analysis (skip for template mode)
- [ ] 3. Page Analysis
- [ ] 4. Block Mapping
- [ ] 5. Import Infrastructure
- [ ] 6. URL Classification and Content Import

## Artifacts
[List of generated files]
```

**0.5 Present Plan to User**

Display mode, URLs or template name, 6 steps, expected artifacts.

```

**Handle response:** "Yes" → Mark Step 0 complete, proceed to Step 1. "Cancel" → Stop

---

### Step 1: Project Setup

1. Mark Step 1 in progress: `TodoWrite({"merge": true, "todos": [{"activeForm": "step-1", "status": "in_progress"}]})`
2. Invoke `excat-project-expert` sub-agent (prompt: "Analyze fstab.yaml and create .migration/project.json with project type and library URL")
3. Wait for sub-agent (generates `.migration/project.json`)
4. **Re-assert orchestrator todo list** (sub-agent may have created its own):
   ```json
   TodoWrite({
     "merge": false,
     "todos": [
       {"activeForm": "step-0", "content": "Initialize Migration Plan", "status": "completed"},
       {"activeForm": "step-1", "content": "Project Setup", "status": "in_progress"},
       {"activeForm": "step-2", "content": "Site Analysis", "status": "pending"},
       {"activeForm": "step-3", "content": "Page Analysis", "status": "pending"},
       {"activeForm": "step-4", "content": "Block Mapping", "status": "pending"},
       {"activeForm": "step-5", "content": "Import Infrastructure", "status": "pending"},
       {"activeForm": "step-6", "content": "Content Import", "status": "pending"}
     ]
   })
   ```
5. Update migration plan, mark todo completed

**DO NOT:** End your turn after action 3; complete 4-6.

---

### Step 2: Site Analysis

**Mode Check:** Run for URL List and Single Page. Skip for Template-Based.

**2.1 Update Todo and Check Existing**

Mark Step 2 in progress:
```json
TodoWrite({
  "merge": true,
  "todos": [{"activeForm": "step-2", "status": "in_progress"}]
})
```
If `tools/importer/page-templates.json` exists, ask "Found existing templates. Skip or redo?"

**2.2 Execute Site Analysis**

1. Invoke `excat-site-analysis` (URL or URL list from Step 0)
2. After skill returns, continue: Read `tools/importer/page-templates.json`, count templates, update plan, mark todo completed, display to user

**Note:** After action 1, do not stop; complete actions 2-3.

---

### Step 3: Page Analysis (mapping list)

**3.0 Pre-snapshot** Before invoking page analysis: list directory names under `blocks/` that contain a hyphen. Store as `blocksSnapshot`. Use after skill returns to decide mapped vs unmapped.

**Filter rule (Steps 4-6):**
- ✅ **Include** in filtered authoring-analysis: default-content sections (decision `"default-content"` or `blockName` null); sections whose block variant is in `blocksSnapshot`.
- ❌ **Exclude** from filtered authoring-analysis: sections that have a variant **not** in `blocksSnapshot` (unmapped).

**Unmapped sections (critical):**
- Unmapped = **skipped** in Steps 4-6. Their content is not imported and is not passed to block mapping or import.

**3.1** Mark Step 3 in progress: `TodoWrite({"merge": true, "todos": [{"activeForm": "step-3", "status": "in_progress"}]})`

**3.2** If `./migration-work/authoring-analysis.json` exists, ask "Found existing analysis. Skip or redo?"

**3.3** Determine page URL (URL List: first URL per template; Single Page: provided URL; Template-Based: first URL from selected template)

**3.4** Invoke `excat-page-analysis` (page URL from 3.3)

**3.5** Skill outputs completion message - **IGNORE AND CONTINUE**

**3.6 Build mapping list**
1. Read `./migration-work/authoring-analysis.json` and `./migration-work/page-structure.json`.
2. For each section:
   - **Unmapped:** section has a block variant (`blockName`) and that variant is **not** in `blocksSnapshot`.
   - **Not unmapped:** default-content (decision `"default-content"` or `blockName` null) → include in filtered set.
   - Unmapped sections only are excluded from Steps 4-6; do not create new variants.
3. Build mapping list: per section, "Section N: default-content", "Section N: <variantName>", or "Section N: unmapped".

**3.7 Present mapping and get confirmation**

- When presenting the mapping list, describe unmapped sections only as "unmapped - will be skipped". Do **not** say their content will be converted to default-content.
- Invoke `AskUserQuestion`:
```json
{
  "questions": [{
    "question": "Section-to-block mapping (existing blocks only): [display mapping list]. Unmapped will be skipped. Proceed?",
    "header": "Confirm Section Mapping",
    "options": [
      {"label": "Yes - Proceed", "description": "Continue with mapped blocks only"},
      {"label": "Cancel", "description": "Stop here"}
    ]
  }]
}
```

**Handle response:** "Yes" → Continue to 3.8. For Step 4+ use **filtered** authoring-analysis (write to disk or keep in memory):
- ✅ Include: default-content entries; entries whose variant is in `blocksSnapshot`.
- ❌ Exclude: entries whose variant is not in `blocksSnapshot` (unmapped).

**3.8** Update plan, mark todo completed. Display results (blocks identified, unmapped if any).

**3.9** Invoke `AskUserQuestion`: "Step 3 complete. Proceed to Step 4: Block Mapping?" (Yes / No)

**DO NOT:** Stop after "Page analysis complete"; continue to 3.6. Do not end turn before 3.9.

---

### Step 4: Block Mapping (mapped only)

1. Mark Step 4 in progress. If `page-templates.json` has populated blocks[], ask "Found existing mappings. Skip or redo?"
2. Invoke `block-mapping-manager` with: current page URL; **filtered** `./migration-work/authoring-analysis.json` (apply Filter rule from 3.0—filter on disk or in memory); `./migration-work/cleaned.html`
3. Skill outputs completion - **IGNORE AND CONTINUE**
4. Read updated `tools/importer/page-templates.json`, update plan, mark todo completed, display results

**DO NOT:** Pass authoring-analysis that includes unmapped (non-snapshot) variants.
**DO:** Include default-content sections in the filtered file (see Filter rule in 3.0).

---

### Step 5: Import Infrastructure

1. Mark Step 5 in progress: `TodoWrite({"merge": true, "todos": [{"activeForm": "step-5", "status": "in_progress"}]})`
2. If `tools/importer/parsers/` exists, ask "Found existing infrastructure. Skip or redo?"
3. Invoke `excat-import-infrastructure` (./migration-work/authoring-analysis.json—same **filtered** file as Step 4, per Filter rule in 3.0; ./migration-work/cleaned.html)
4. Skill outputs completion - **IGNORE AND CONTINUE**
5. List parsers/transformers created, count files, update plan, mark todo completed, display to user

**DO NOT:** Stop after completion message; end turn only after AskUserQuestion.

---

### Step 6: URL Classification and Content Import

**6.0** Mark Step 6 in progress: `TodoWrite({"merge": true, "todos": [{"activeForm": "step-6", "status": "in_progress"}]})`

**6.1 Determine URLs to Import**
- **URL List:** All URLs from all templates (ask "Import all templates or select specific ones?")
- **Single Page:** The provided URL
- **Template-Based:** All URLs from selected template

**6.2 URL Classification**
- URLs in `page-templates.json` from Step 2. Group by template. Create `tools/importer/urls-<templateName>.txt`.

**6.3 Generate Import Scripts**
For each template: If `tools/importer/import-<templateName>.js` exists, ask "Use existing or regenerate?" Invoke `excat-import-script` (template name, sample URL). Verify script.

**6.4 Import Content**
For each template invoke `excat-content-import` with template name, URLs, and script path `tools/importer/import-<templateName>.js`. Use `.bundle.js` for run-bulk-import. Generates `content/*.plain.html`, `tools/importer/reports/<template>.report.xlsx`.

**6.5 Final Summary**

Mark Step 6 completed: `TodoWrite({"merge": true, "todos": [{"activeForm": "step-6", "status": "completed"}]})`

Display:
```
═══════════════════════════════════════
MIGRATION COMPLETE
═══════════════════════════════════════

Mode: [URL List | Single Page | Template-Based]
Source: [N URLs | Single URL | Template Name]

Generated Artifacts:
✅ Page templates (tools/importer/page-templates.json)
✅ Page analysis (./migration-work/)
✅ Block mappings (mapped blocks only, in page templates)
✅ Import infrastructure (parsers, transformers)
✅ Import scripts (tools/importer/import-*.js)
✅ Content files (content/*.plain.html)
✅ Import reports (tools/importer/reports/)

Next Steps:
1. Verify blocks render correctly
2. Improve transformers to clean up page content
3. Improve parsers to clean up block content
```

---

## Input Validation

**blocks/:** Step 0.0. No variant dirs → stop.

**TLD:** `https://example.com`, `https://example.com/`, `https://example.com/index.html` = TLD. Paths like `/products`, `/about-us` = not TLD.

**URL list formats:** Comma-separated, line-separated, array `["url1","url2"]`, or natural language "Migrate these: url1, url2".

---

## Error Handling

**1. No block variants in blocks/**  
Response: "No block variants in blocks/. Add or migrate blocks first, then map content." Do not proceed.

**2. "Migrate my site" without URLs**  
"Please provide the URLs to migrate." Show formats. Wait for list.

**3. TLD only**  
Ask "1) Homepage only, or 2) Specific pages?" Wait for choice.

**4. Missing template name**  
Load `page-templates.json`, show list, ask "Which template?"

**5. User cancels at mapping list (Step 3.7)**  
Stop

**6. Sub-skill failure**  
Show error. Ask "Retry or abort?"

---

## Success Criteria

- [ ] Step 0 run with blocks/ validated
- [ ] All steps 1-6 run (or subset for mode)
- [ ] Migration plan updated
- [ ] Mapping list shown and user confirmed (Step 3.7)
- [ ] Only mapped blocks in page-templates blocks[] and in parsers/import
- [ ] User confirmed after each major step
- [ ] Content imported

**Key Artifacts:** `.migration/project.json`, `./migration-work/migration-plan.md`, `./migration-work/authoring-analysis.json`, `./migration-work/page-structure.json`, `tools/importer/page-templates.json`, `tools/importer/parsers/*.js`, `tools/importer/transformers/*.js`, `tools/importer/import-*.js`, `content/*.plain.html`, `tools/importer/reports/*.xlsx`

---

## Example Migration Plan

```markdown
# Migration Plan: Content Mapper (map content from website)

**Mode:** URL List
**Source:** 12 URLs
**Generated:** [timestamp]

## Steps
- [✅] 1. Project Setup
- [✅] 2. Site Analysis
- [✅] 3. Page Analysis (mapping confirmed)
- [✅] 4. Block Mapping
- [✅] 5. Import Infrastructure
- [✅] 6. Content Import

## Mapping Summary
- Section 1: hero-campaign
- Section 2: cards-service
- Section 3: unmapped (skipped)

## Content Import
- product-page: 8 imported
- blog-article: 4 imported
- **Total: 12 pages**
```
