const { log } = require('../index.js');

log('Hello World!');
log(123);
log(true);
log(['test']);
log({ test: 'test', test2: 2, test3: true, test4: ['test', 1, true, [2]], test5: { test: 'test' } });
log(`Some text { test: 'test' } and some more text`);
log(`some text { key1: true, 'key2': "  { inner: 'value', } " } text { a: 1 } text`);

const { repairJson } = require('../index.js');

console.log(repairJson(`{ 'k1': 'v1', 'k2': 123 }`));
console.log(repairJson("{ a: 'somestring', b: 42, e: { c: 82, d: [Circular *1] } }"));

const { toArrayOfPlainStringsOrJson } = require('../index.js');

console.log(toArrayOfPlainStringsOrJson(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`));

const { canParseJson } = require('../index.js');

console.log(canParseJson(`{ 'k1': 'v1', k2: 123 }`));
console.log(canParseJson(`{ 'k1': "v1", "k2": 123 }`));
console.log(canParseJson(`"test"`));
console.log(canParseJson(123));
console.log(canParseJson(true));

console.log();

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

console.log(isJSON(`{ 'k1': 'v1', k2: 123 }`));
console.log(isJSON(`{ 'k1': "v1", "k2": 123 }`));
console.log(isJSON(`"test"`));
console.log(isJSON(123));
console.log(isJSON(true));

log(`{
  "name": "John Doe",
  "age": 30,
  "isEmployed": true,
  "salary": -75000.50,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212-555-1234"
    },
    {
      "type": "work",
      "number": "646-555-5678"
    }
  ],
  "skills": ["programming", "design", "communication"],
  "education": [
    {
      "degree": "B.Sc. Computer Science",
      "university": "State University",
      "graduationYear": 2015
    },
    {
      "degree": "M.Sc. Computer Science",
      "university": "Tech Institute",
      "graduationYear": 2017,
      "thesis": null
    }
  ],
  "projects": [
    {
      "name": "Project Alpha",
      "description": "A project to develop something innovative.",
      "status": "completed"
    },
    {
      "name": "Project Beta",
      "description": "An ongoing project to improve existing systems.",
      "status": "in progress"
    }
  ],
  "preferences": {
    "contactMethod": "email",
    "language": "en-US",
    "timeZone": "America/New_York"
  },
  "metadata": {
    "created": "2023-01-01T12:00:00Z",
    "updated": "2023-04-01T09:30:00Z"
  },
  "financial": {
    "accountBalance": 1.2345e+10,
    "transactionAmount": -123456.789,
    "interestRate": 5.12e-4
  }
}
`);
