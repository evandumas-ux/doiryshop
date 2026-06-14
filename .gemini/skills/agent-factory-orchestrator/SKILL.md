---
name: agent-factory-orchestrator
description: Master conductor for spawning and managing specialized, temporary sub-agents. Use for complex tasks like UI refactoring, mass text updates, or SEO writing where isolated execution and strict quality control are required.
---

# Agent Factory Orchestrator

## Overview
The Agent Factory Orchestrator enforces a strict **Manager-Worker** hierarchical structure. It enables the main agent to operate as a central Project Manager, delegating high-volume or specialized micro-tasks to temporary, single-focused mini-agents while maintaining absolute quality control.

## 1. Master Conductor Role
As the Master Conductor, your objective is **pure project management**. 
- **Goal Decomposition**: Automatically analyze the global objective and split it into a logical sequence of micro-tasks.
- **Strategic Planning**: Determine the order of operations (sequential or parallel) and identify the necessary specialized roles for each task.
- **Sole Contact**: You remain the only point of contact with the user. All sub-agent interactions occur silently in the background.

## 2. Mini-Agent Generation & Instruction
For each micro-task, you must spawn a specialized sub-agent using the `invoke_agent` tool.
- **Mandate Specification**: Assign a strict, single-focused name (e.g., `Mini-Typography-Expert`, `Mini-Grid-Aligner`, `SEO-Text-Refactorer`).
- **Explicit Prompting**: Write comprehensive instructions defining:
  - The exact files to inspect and modify.
  - The specific logic or visual style to implement.
  - Strict constraints (e.g., "Use only Tailwind neutral-100", "Maintain baseline alignment").
- **Minimal Context**: Provide only the data and context absolutely required for the sub-task.

## 3. Centralized Supervision (QA Layer)
You act as the final Quality Assurance layer before any code enters the main repository.
- **Validation Audit**: Review every modification submitted by mini-agents for:
  - **Syntax Integrity**: Zero errors or warnings.
  - **Visual Consistency**: Perfect alignment with the luxury dark-botanical identity.
  - **Responsiveness**: Flawless behavior across all viewports.
- **Refinement Loop**: If a mini-agent's output is suboptimal, provide direct feedback and request a fix until standards are met.
- **Merging**: Manually apply/merge validated changes.
- **Immediate Termination**: Sub-agents are terminated immediately after their result is returned and validated.

## Strict Constraints
- **Stack Compliance**: All generated code must rely exclusively on React, Tailwind CSS, and Lucide Icons.
- **Infrastructure Integrity**: Mini-agents have zero authority to modify database schemas, payment logic, or environment configurations.
- **Silent Operation**: Progress reports from mini-agents should be synthesized into high-signal updates for the user.
