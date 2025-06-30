// import React from 'react';
import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text } from '@forge/react';
import { invoke } from '@forge/bridge';

// const updateIssue = async () => {
//   try {
//     const result = await invoke('updateJiraStory', {
//       fieldsToUpdate: {
//         summary: "Updated from Forge app using context",
//         description: {
//           type: "doc",
//           version: 1,
//           content: [{
//             type: "paragraph",
//             content: [{
//               type: "text",
//               text: "This was updated using the current issue key"
//             }]
//           }]
//         }
//       }
//     });
//     console.log(result.message);
//   } catch (err) {
//     console.error("Failed to update issue:", err);
//   }
// };
// 
// export default function App() {
//   return (
//     <div>
//       <button onClick={updateIssue}>Update Current Issue</button>
//     </div>
//   );
// }

export default function App() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function callApi() {
      try {
            const result = await invoke('updateJiraStory', {
      fieldsToUpdate: {
    "summary": "Summary updated using forge app",
    "description": "Description updated using forge app"
}
    });
    console.log(result.message);
  } catch (err) {
    console.error("Failed to update issue:", err);
  }
    }

    callApi();
  }, []);

  return (
    <>
      <Text>Fixing the story with Blueswan!</Text>
      <Text>{result}</Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
