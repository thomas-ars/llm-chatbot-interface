// script.js

let selectedLLM = ''; // Variable to store selected LLM model

// Fetches the list of LLM models available
function fetchLLMModels() {
  fetch('http://localhost:11434/api/tags')
    .then(response => response.json())
    .then(data => {
      populateLLMSelect(data["models"]); // Populate dropdown with LLMs
    })
    .catch(error => {
      console.error('Error fetching LLM models:', error);
    });
}

// Function to dynamically population the list of LLMs
function populateLLMSelect(modelsArray) {
  const llmSelect = document.getElementById('llmSelect');

  modelsArray.forEach((model, index) => {
    const option = document.createElement('option');
    option.value = model.name;
    option.textContent = model.name;
    llmSelect.appendChild(option);

    // Select the first model by default
    if (index === 0) {
      option.selected = true;
      showInputSection() // Show input section when default model is selected
    }
  });

  // Show/hide input section based on LLM selection
  llmSelect.addEventListener('change', function () {
    showInputSection();
  });

  // Set the selected LLM if already chosen or from localStorage
  selectedLLM = localStorage.getItem('selectedLLM');
  if (selectedLLM) {
    llmSelect.value = selectedLLM;
  }

}

// Function to handle LLM selection
function selectLLM() {
  const llmSelect = document.getElementById('llmSelect');
  selectedLLM = llmSelect.value; // Update selected LLM
  localStorage.setItem('selectedLLM', selectedLLM); // Save selected LLM to localStorage
  location.reload();
}


// Loader during questions submitting
function toggleLoader(show) {
  const loader = document.getElementById('loader');
  loader.style.display = show ? 'block' : 'none';

  // Disable or enable LLM select and input field based on the 'show' parameter
  const llmSelect = document.getElementById('llmSelect');
  const userInput = document.getElementById('userQuestion');
  llmSelect.disabled = show;
  userInput.disabled = show;

}

// Show the input section only when a LLM is selected
function showInputSection() {
  const llmSelect = document.getElementById('llmSelect');
  const inputSection = document.getElementById('inputSection');
  inputSection.style.display = llmSelect.value ? 'block' : 'none';
}


// Variable used to store the output of a previous LLM
let previousLLMResponse = [];


// This function is used to query the LLM
async function getLLMResponse(userQuestion) {
  const selectedLLM = document.getElementById('llmSelect').value;
  // Stores all the messages sent to the LLM
  let messages = []
  if (previousLLMResponse.length != 0) {
    //  In this case, there are already messages sent in the conversation
    messages = previousLLMResponse.concat([
      {
        "role": "user",
        "content": userQuestion
      }]);
  } else {
    //  In this case, the conversation has just started
    messages = [
      {
        "role": "user",
        "content": userQuestion
      }];
  }
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "model": selectedLLM,
      "messages": messages,
      "stream": false
    })
  });

  if (response.ok) {
    const responseData = await response.json();
    return responseData["message"]; // Extract LLM response content
  } else {
    return 'Failed to get response from LLM'; // Return default message on failure
  }
}


// Question submitting
async function submitQuery() {
  const selectedLLM = document.getElementById('llmSelect').value;
  const userQuestion = document.getElementById('userQuestion').value;
  // Do nothing if the input is empty
  if (userQuestion.trim() === '') {
    return;
  }

  if (!selectedLLM) {
    alert('Please select an LLM.');
    return;
  }

  if (!userQuestion) {
    alert('Please enter a prompt.');
    return;
  }


  // Loading icon appear
  toggleLoader(true);


  // Mandatory formalism to create chat Q&A : the chatContainer will contain all the exchanges with the LLM 
  const chatContainer = document.getElementById('chatContainer');

  // Display user's question
  const userQuestionDiv = document.createElement('div');
  userQuestionDiv.classList.add('chat-message', 'question');
  userQuestionDiv.textContent = userQuestion;

  // chatContainer is appended with the question
  chatContainer.appendChild(userQuestionDiv)

  // Fetch response from LLM API
  const llmResponse = await getLLMResponse(userQuestion);

  // Add user question and LLM answer to the array previousLLMResponse containing chat history
  input_user_paylod = {
    "role":"user",
    "content":userQuestion}
  previousLLMResponse = previousLLMResponse.concat([input_user_paylod, llmResponse])

  
  // Display LLM's answer
  const llmAnswerDiv = document.createElement('div');
  llmAnswerDiv.classList.add('chat-message', 'answer');
  llmAnswerDiv.textContent = llmResponse["content"];

  // chatContainer is appended with the answer
  chatContainer.appendChild(llmAnswerDiv);


  // Clear the input field and focus on it
  document.getElementById('userQuestion').value = '';
  document.getElementById('userQuestion').focus();

  // Loading icon disappear
  toggleLoader(false);

};


// Function to handle "Enter" key press in the input field
document.getElementById('userQuestion').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    submitQuery(); // Call the submitQuery function on "Enter" key press
  }
});

// Fetch LLM models and populate dropdown when the page loads
document.addEventListener('DOMContentLoaded', function () {
  fetchLLMModels();
});
