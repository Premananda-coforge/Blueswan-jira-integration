import Resolver from '@forge/resolver';
import api, { route, fetch } from '@forge/api';
import { mapIssueToEnhanceRequestPayload, mapAIResponseToJiraPayload, mapIssueToAnalyzeRequestPayload } from './utils.js';

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

resolver.define('fetchAttachments', async ({ payload }) => {
  const issueData = payload;
  console.log("Fetching attachments for issue:", issueData);
  const attachments = [];

  if (!issueData || !issueData.fields || !Array.isArray(issueData.fields.attachment)) {
    return attachments;
  }
  console.log("Attachments found:", issueData.fields);

  for (const att of issueData.fields.attachment) {
    let contentBase64 = "";

    if (att.id) {
      try {
        const response = await api
          .asApp()
          .requestJira(route`/rest/api/2/attachment/content/${att.id}`, {
            method: "GET",
            headers: {
              Accept: "application/json"
            }
          });
        console.log("Response for attachment content:", response);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          contentBase64 = buffer.toString("base64");
        } else {
          console.error(`Failed to fetch attachment content for id ${att.id}`);
        }
      } catch (err) {
        console.error(`Error fetching attachment content for id ${att.id}:`, err);
      }
    }

    attachments.push({
      file_name: att.filename || "No Attachment",
      content_type: att.mimeType || "string",
      content: contentBase64
    });
  }

  console.log("Fetched attachments:", attachments);
  return attachments;
});


resolver.define('enhanceAndUpdate', async ({ payload }) => {
  const { issueKey, userStoryData, attachments } = payload;
  const enhanceReqPayload = mapIssueToEnhanceRequestPayload(userStoryData, attachments);
  console.log("Enhance request payload is :", enhanceReqPayload);

  try {
    // Step 1: Enhance
    console.log("Calling Enhance API...");
    const useFormData = false; // Set this flag to true for FormData, false for JSON

    let body;
    let headers = {};

    if (useFormData) {
      const formData = new FormData();
      formData.append("enhance_payload_base_model", JSON.stringify(enhanceReqPayload));
      formData.append("files", new Blob([]));
      body = formData;
      // No need to set Content-Type for FormData; browser/Fetch will set it
    } else {
      body = JSON.stringify(enhanceReqPayload);
      headers["Content-Type"] = "application/json";
    }

    const enhanceRes = await fetch("https://worktop.cigniti.com/api/hsbc/enhance/enhanceUserStory", {
      method: "POST",
      headers: headers,
      body: body
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
    // const res = enhanceIssue(jiraPayload);
    // console.log("Enhancement response:", res);
    return jiraPayload;
   
    // const updateRes = await api.asApp().requestJira(route`/rest/api/2/issue/${issueKey}`, {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(jiraPayload)
    // });

    // if (!updateRes.ok) {
    //   const errorText = await updateRes.text();
    //   console.error("Failed to update issue:", errorText);
    //   throw new Error(`Update failed: ${updateRes.status}`);
    // }

    // return {
    //   message: "✅ Jira issue enhanced successfully!"
    // };

  } catch (error) {
    console.error("Error in enhanceAndUpdate:", error);
    throw error;
  }
});

resolver.define('updateIssue', async ( {payload} ) => {

  const { issueKey, jiraPayload } = payload;

  console.log("Enhancing issue with payload:", jiraPayload);
  console.log("Issuekey:", issueKey);

  try {
    // const jiraPayload = mapAIResponseToJiraPayload(matchingStory);
   
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
      message: "✅ Jira issue enhanced successfully!"
    };

  } catch (error) {
    console.error("Error in getIssueDetails:", error);
    throw error;
  }

});

// resolver.define('format', async ({ payload }) => {
//   const formattedText = formatMultilineText(payload);
//   console.log("Formatted text:", formattedText);
//   return formattedText;
// });

// resolver.define('analyze', async ({ payload }) => {
//   const { issueKey, userStoryData, attachments } = payload;
//   const analyzeReqPayload = mapIssueToAnalyzeRequestPayload(userStoryData, attachments);
//   console.log("Analyze request payload is :", analyzeReqPayload);

//   const body = JSON.stringify(analyzeReqPayload);
//   const headers = ["Content-Type"] = "application/json";

//   try {
//     const analyzeRes = await fetch("https://worktop.cigniti.com/api/hsbc/analyze/analyzeUserStory", {
//       method: "POST",
//       headers: headers,
//       body: body
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`Failed to analyze the issue: ${response.status} - ${errorText}`);
//       throw new Error(`Unable to analyze the issue: ${response.status}`);
//     }

//     const analyzed = await analyzeRes.json();
//     const ambiguity = analyzed.data.ambiguity;
//     return ambiguity;


//   } catch (error) {
//     console.error("Error in alalyzing the issue:", error);
//     throw error;
//   }
// });


// Export for Forge runtime
export const handler = resolver.getDefinitions();