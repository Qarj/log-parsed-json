const { firstJson } = require('./index.js');

const completion = `Thought: "I need to search for developer jobs in London"
Action: SearchTool
ActionInput: { location: "London", 'title': "developer" }
`;

console.log(firstJson(completion));
