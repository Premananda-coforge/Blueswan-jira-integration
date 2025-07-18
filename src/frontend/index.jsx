import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text , Button, ModalDialog} from '@forge/react';
import { invoke } from '@forge/bridge';
import { view } from "@forge/bridge";
import ModalPopup from './ModalPopup.jsx';

export default function App() {
  const [result, setResult] = useState("Processing...");
  const [status, setStatus] = useState("Initializing...");
  const [issueKey, setIssueKey] = useState("");
  const [jiraPayload, setJiraPayload] = useState({});
  const [issueData, setIssueData] = useState({});

  // const [analyzeOutput, setAnalyzeOutput] = useState("");
  // const [isOpen, setOpen] = useState(false);

  // let issueKey;
  // let jiraPayload;


  useEffect(() => {
    async function enhanceAndUpdate() {

      try {
        setStatus("Fetching issue context...");
        const issueKey = await invoke("getIssueKey");
        setIssueKey(issueKey);

        const issueData = await invoke("getIssueDetails", { issueKey });
        setIssueData(issueData);

        setStatus("Fetching attachments...");
        const attachments = await invoke("fetchAttachments", issueData);

        setStatus("Calling backend to get enhanced response...");
        const jiraPayload = await invoke('enhanceAndUpdate', {
          issueKey,
          userStoryData: issueData,
          attachments
        });
        setJiraPayload(jiraPayload);


        setStatus("Received enhaced response");
        setResult("Check the enhanced version in the popup.");
        
        // const response = await invoke('updateIssue', {
        //   issueKey,
        //   jiraPayload
        // });

        // setResult(response.message || "No description returned.");
        // setStatus("Done!");

        // setAnalyzeOutput("Analyzing...");
        // const response = await invoke('enhanceAndUpdate', {
        //   issueKey,
        //   userStoryData: issueData,
        //   attachments
        // });
      } catch (err) {
        console.error("Failed to process story:", err);
        setStatus("Error: " + err.message);
      }
    }

    enhanceAndUpdate();
  }, []);

  return (
    <>
      <Text>Auto-refining the Jira story with Blueswan</Text>
      <Text>Status: {status}</Text>

      {status === "Received enhaced response" && <ModalPopup 
      issueKey={issueKey} 
      issueData={issueData}
      jiraPayload={jiraPayload} 
      setStatus={setStatus}
      setResult={setResult}/>}

      <Text>{result}</Text>

      {/* <Dialog
        header="My Popup Title"
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      >
        <Text>Hello from the popup dialog!</Text>
      </Dialog> */}

      {/* {result === "✅ Jira issue enhanced successfully!" && (
        <Button text="Analyze" onClick={handleAnalyze} />
      )}

      {analyzeOutput && (
        <Text>Analyze Result: {analyzeOutput}</Text>
      )} */}
    </>
  );
}

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
