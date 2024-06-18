const { firstJson } = require('../index.js');

const completion = `A JSON parser! { name: "Alice', ”age': 26 }
`;

console.log(firstJson(completion, { attemptRepairOfBadlyBrokenQuotes: true }));
