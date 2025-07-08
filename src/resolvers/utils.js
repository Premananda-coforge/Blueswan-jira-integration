import { Buffer } from "buffer";
import api, { route, fetch } from '@forge/api';

export function mapIssueToRequestPayload(issueData, attachments) {
  if (!issueData || !issueData.fields) {
    throw new Error("Invalid issue data");
  }

    console.log("Issue data received:", issueData);
    console.log("Attachments processed:", attachments);
  return {
    request_from: "HSBC",
    user_story_details: [
      {
        user_story_id: issueData.key,
        user_story_title: issueData.fields.summary,
        user_feedback: "Give me detailed information",
        status: "Original",
        source_type: "Jira",
        datasource_project_name: issueData.fields.project?.name || "Unknown Project",
        epic_id: issueData.fields.customfield_10008 || null,
        epic_title: null,
        feature_id: null,
        feature_title: null,
        area_path: `${issueData.fields.project?.name || "Project"}\\Worktop`,
        us_run_status: null,
        acceptance_criteria: getAcceptanceCriteria(),
        description: issueData.fields.description || null,
        quality: null,
        cost: null,
        schedule: null,
        rework: null,
        rework_signals: null,
        dsi: null,
        priority: issueData.fields.priority?.name || null,
        checklist_values: {},
        impact_of_ambiguity: null,
        result: null,
        ambiguity: null,
        ambiguity_text: null,
        ambiguity_reason: {},
        percentage: null,
        impact_description: {},
        requirements_gap: null,
        highlight_text: null,
        ac_coverage_percentage: null,
        td_coverage_percentage: null,
        created_by: issueData.fields.creator?.name || "Unknown",
        updated_by: "Blueswan",
        impact_status: false,
        file_attachment_details: attachments
      }
    ]
  };
}

function getAcceptanceCriteria() {
  // Try to get acceptance criteria from a custom field (adjust the field key as needed)
  // Common Jira custom field keys: customfield_XXXXX
  return "Acceptance criteria written inside description";
    // issueData.fields.customfield_10092
    // issueData.fields.acceptanceCriteria
  
}

export function mapAIResponseToJiraPayload(responseFromAI) {
  if (!responseFromAI) {
    throw new Error("Invalid issue data");
  }

  const completeDescription = `${responseFromAI.description}\n\n*Acceptance Criteria*\n${responseFromAI.acceptance_criteria}`;

  return {
    fields: {
      summary: responseFromAI.user_story_title,
      description: completeDescription
    }
  };
}