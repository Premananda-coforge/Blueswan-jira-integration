import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('updateJiraStory', async ({ context, payload }) => {
  const issueKey = context.extension.issue.key; // 🔑 Get issue key from current page

  const { fieldsToUpdate } = payload;
console.log(payload);
console.log(fieldsToUpdate);
console.log(issueKey);

  const response = await api.asApp().requestJira(route`/rest/api/2/issue/${issueKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: fieldsToUpdate
    })
  });

  // if (!response.ok) {
  //   const error = await response.text();
  //   throw new Error(`Failed to update issue: ${response.status} - ${error}`);
  // }

  return { success: true, message: `Issue ${issueKey} updated successfully.` };
});


export const handler = resolver.getDefinitions();
