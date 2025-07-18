import { Modal, ModalBody, ModalTransition, ModalTitle, ModalFooter, ModalHeader, xcss, Box, Inline, } from '@forge/react';
import React, { useEffect, useState } from 'react';
import { Button, Text, Stack, Heading, TextField, Label } from '@forge/react';
import { invoke } from '@forge/bridge';


const ModalPopup = ({ issueKey, issueData, jiraPayload, setStatus, setResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rightContent, setRightContent] = useState("Right partition content goes here.");
  const [isEditing, setIsEditing] = useState(false); // New state to manage edit mode
  const [tempRightContent, setTempRightContent] = useState(rightContent);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  console.log("Issue Key in ModalPopup:", issueKey);
  console.log("Issue Data in ModalPopup:", issueData);
  console.log("Jira Payload in ModalPopup:", jiraPayload);
  console.log("Status in ModalPopup:", setStatus);
  console.log("Result in ModalPopup:", setResult);

  const popupContentStyles = xcss({
    padding: 'space.200',
  });

  const leftColumnStyles = xcss({
    width: '50%',
    borderRight: '1px solid token(color.border)',
    paddingRight: 'space.100',
  });

  // Add a pointer cursor to indicate the content is clickable for editing
  const rightColumnViewStyles = xcss({
    width: '50%',
    paddingLeft: 'space.100',
    cursor: 'pointer', // Indicates the element is clickable
    minHeight: '40px', // Ensure a clickable area even if content is empty
  });

  const rightColumnEditStyles = xcss({
    width: '50%',
    paddingLeft: 'space.100',
  });

  const handleRightContentClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      console.log("isEditing set to", isEditing);
      setTempRightContent(rightContent); // Load existing content into the temporary state
    }
  };

  const handleSaveClick = () => {
    setRightContent(tempRightContent);
    setIsEditing(false);
    console.log("Saved content:", tempRightContent);
    // You would typically send 'tempRightContent' to your backend or storage here
  };

  const handleCancelClick = () => {
    setIsEditing(false); // Discard changes and revert to view mode
    setTempRightContent(rightContent); // Optional: reset temp content to original value
  };

  const handleRightContentChange = (value) => {
    setTempRightContent(value);
  };

  const updateIssue = async () => {
    setStatus("Updating issue...");
    const response = await invoke('updateIssue', {
      issueKey,
      jiraPayload
    });
    console.log("Enhancement response:", response);
    setResult(response.message || "No description returned.");
    setStatus("Done!");
  }

  const formatMultilineText = (text) => {
    if (!text) return [<Text>No description available.</Text>];

    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      return (
        <Text key={idx}>
          {trimmed === '' ? '\u00A0' : trimmed}
        </Text>
      );
    });
  };

  // const containerStyle = xcss({
  //   display: 'flex',
  //   flexDirection: 'column',
  //   gap: 'space.300',
  // });

  // const columnStyle = xcss({
  //   flex: 1,
  //   paddingRight: 'space.200',
  // });

  // const popupContentStyles = xcss({
  //   padding: 'space.200', // Example padding for the popup content
  // });

  // const leftColumnStyles = xcss({
  //   width: '50%', // Define the width for the left column
  //   borderRight: '1px solid token(color.border)', // Add a visual divider
  //   paddingRight: 'space.100', // Add some spacing next to the divider
  // });

  // const rightColumnStyles = xcss({
  //   width: '50%', // Define the width for the right column
  //   paddingLeft: 'space.100', // Add some spacing after the divider
  // });

  // }
  // useEffect(() => {
  //   async function update() {
      // setStatus("Updating issue...");
      // const response = await invoke('updateIssue', {
      //   issueKey,
      //   jiraPayload
      // });
      // console.log("Enhancement response:", response);
    // }
    // update();
  // }, []);

  return (
    <>
      <Button appearance="primary" onClick={openModal}>
        Show Enhancement
      </Button>

      <ModalTransition>
        {isOpen && (
          <Modal
            onClose={closeModal}
            shouldScrollInViewport={false}
            height={600}
            width={900}
          >
            <ModalHeader>
              <ModalTitle>Enhanced version</ModalTitle>
            </ModalHeader>

            <ModalBody>
              <Box xcss={popupContentStyles}>
                <Inline space="space.200" alignInline="start"> {/* Horizontal layout with spacing */}
                  <Box xcss={leftColumnStyles}>
                    <Heading as="h3">Existing Summary</Heading>
                    <Text>{issueData.fields.summary || "There was no summary before."}</Text>

                    <Heading as="h3">Existing Description</Heading>
                    <Text>{formatMultilineText(issueData.fields.description)}</Text>
                  </Box>


                  <Box>
              <Label labelFor="rightPartitionContent">Right Partition Content1</Label>
              {isEditing ? (
                // Show TextField and buttons when in edit mode
                <Stack space="space.100"> {/* Use Stack for vertical layout of input and buttons */}
                  <TextField
                    name="rightPartitionContent"
                    id="rightPartitionContent"
                    value={tempRightContent}
                    onChange={handleRightContentChange}
                  />
                  <Inline space="space.100" alignInline="end"> {/* Use Inline for horizontal button layout */}
                    <Button appearance="subtle" onClick={handleCancelClick}>Cancel</Button>
                    <Button appearance="primary" onClick={handleSaveClick}>Save</Button>
                  </Inline>
                </Stack>
              ) : (
                // Show static Text when not in edit mode
                <Text>{rightContent}</Text>
              )}
            </Box>
                </Inline>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button appearance="primary" onClick={closeModal}>
                Cancel
              </Button>
              <Button appearance="primary"  onClick={handleRightContentClick}>Edit</Button>
              <Button appearance="primary" onClick={updateIssue}>
                Enhance
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

    </>
  );
};

export default ModalPopup;