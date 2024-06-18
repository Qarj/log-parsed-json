const { firstJson } = require('../index.js');

const completion = `A JSON parser! { "name": Alice, age: 26, isAlive: true }`;

console.log(firstJson(completion, { attemptRepairOfMissingValueQuotes: true }));
