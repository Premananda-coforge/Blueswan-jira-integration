import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text , Button} from '@forge/react';
import { invoke } from '@forge/bridge';
import { view } from "@forge/bridge";

export default function App() {
  const [result, setResult] = useState("Processing...");
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    async function enhanceAndUpdate() {
      try {
        setStatus("Fetching issue context...");
        const issueKey = await invoke("getIssueKey");

        const issueData = await invoke("getIssueDetails",{issueKey} );

        setStatus("Calling backend to enhance & update...");
        const response = await invoke('enhanceAndUpdate', {
  issueKey,
  userStoryData: issueData
});

        setResult(response.message || "No description returned.");
        setStatus("Done!");
      } catch (err) {


        console.error("Failed to process story:", err);
        setStatus("Error: " + err.message);
      }
    }

    enhanceAndUpdate();
  }, []);

  return (
    <>
      <Text>Auto-refining the Jira story using AI</Text>
      <Text>Status: {status}</Text>
      <Text>{result}</Text>
    </>
  );
}

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
