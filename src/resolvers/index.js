import Resolver from '@forge/resolver';
import api, { route, fetch } from '@forge/api';
import { mapIssueToRequestPayload, mapAIResponseToJiraPayload } from './utils.js';

const resolver = new Resolver();

resolver.define('getIssueKey', async ({ context }) => {
  const issueKey = context.extension.issue.key;
  return issueKey;
});


resolver.define('getIssueDetails', async ({ payload }) => {
  const { issueKey } = payload;

  try {
    const response = await api.asApp().requestJira(route`/rest/api/2/issue/${issueKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch issue: ${response.status} - ${errorText}`);
      throw new Error(`Unable to fetch issue: ${response.status}`);
    }

    const issueData = await response.json();
    return issueData;

  } catch (error) {
    console.error("Error in getIssueDetails:", error);
    throw error;
  }
});

resolver.define('enhanceAndUpdate', async ({ payload }) => {
  const { issueKey, userStoryData } = payload;
  const enhanceReqPayload = mapIssueToRequestPayload(userStoryData);
  console.log("Enhance request payload is :", enhanceReqPayload);

  try {
    // Step 1: Enhance
    console.log("Calling Enhance API...");
    const formData = new FormData();

    formData.append("enhance_payload_base_model", JSON.stringify(enhanceReqPayload));
    formData.append("files", new Blob([]));

    const enhanceRes = await fetch("https://worktop.cigniti.com/api/hsbc/enhance/enhanceUserStory", {
      method: "POST",
      body: formData
    });

    const enhanced = await enhanceRes.text();

var parsedNestedData;
try {
  const result = JSON.parse(enhanced);
  parsedNestedData = JSON.parse(result.data);
} catch (e) {
  console.error("Not a JSON response:", enhanced);
  throw new Error(enhanced);
}

    // Step 2: Update Jira Issue
    
    console.log("result in json form :", parsedNestedData);
    const matchingStory = parsedNestedData.data.find(
      (story) => story.user_story_id === issueKey
    );

    if (matchingStory) {
      console.log("✅ Found matching story:", matchingStory);
    } else {
      console.warn(`❌ No story found with user_story_id = ${issueKey}`);
    }
    console.log("Updating Jira issue:", issueKey);
    const jiraPayload = mapAIResponseToJiraPayload(matchingStory);
   
    const updateRes = await api.asApp().requestJira(route`/rest/api/2/issue/${issueKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jiraPayload)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error("Failed to update issue:", errorText);
      throw new Error(`Update failed: ${updateRes.status}`);
    }

    return {
      message: "Jira issue updated successfully!"
    };

  } catch (error) {
    console.error("Error in enhanceAndUpdate:", error);
    throw error;
  }
});


// Export for Forge runtime
export const handler = resolver.getDefinitions();