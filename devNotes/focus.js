/* eslint-disable no-useless-escape */
const { log } = require('../index.js');

// log(` { 'k1': '{ j: 45 }', 'k2': 123 }  `);

log(`[agent/action] [1:chain:AgentExecutor] Agent selected action: {
  \"tool\": \"GETFROMVECTORDATABASE\",
  \"toolInput\": {
    \"input\": \"{\\\"question\\\":\\\"What is MCO doing with GenAI?\\\",\\\"user_email\\\":\\\"noreply@scottsuhy.com\\\"}\"
  },
  \"log\": \"Invoking \\\"GETFROMVECTORDATABASE\\\" with {\\\"input\\\":\\\"{\\\\\\\"question\\\\\\\":\\\\\\\"What is MCO doing with GenAI?\\\\\\\",\\\\\\\"user_email\\\\\\\":\\\\\\\"noreply@scottsuhy.com\\\\\\\"}\\\"}\\n\",
  \"messageLog\": [
    {
      \"lc\": 1,
      \"type\": \"constructor\",
      \"id\": [
        \"langchain_core\",
        \"messages\",
        \"AIMessage\"
      ],
      \"kwargs\": {
        \"content\": \"\",
        \"additional_kwargs\": {
          \"function_call\": {
            \"name\": \"GETFROMVECTORDATABASE\",
            \"arguments\": \"{\\\"input\\\":\\\"{\\\\\\\"question\\\\\\\":\\\\\\\"What is MCO doing with GenAI?\\\\\\\",\\\\\\\"user_email\\\\\\\":\\\\\\\"noreply@scottsuhy.com\\\\\\\"}\\\"}\"
          }
        }
      }
    }
  ]
}`);
