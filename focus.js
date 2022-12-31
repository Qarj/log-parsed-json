const log = require('./index.js');
const fs = require('fs');

const myObject = {
    abc: 123,
    def: 'test',
    ghi: {
        jkl: 'test',
    },
};

const someOtherObject = {
    zzz: 123,
    jj: 'test',
};

someOtherObject.abc = myObject;
myObject.xyz = someOtherObject;
let scenario = {
    abc: myObject,
    def: someOtherObject,
};

scenario = `{
  abc: <ref *1> {
    abc: 123,
    def: 'test',
    ghi: { jkl: 'test' },
    xyz: { zzz: 123, jj: 'test', abc: [Circular *1] }
  },
  def: <ref *2> {
    zzz: 123,
    jj: 'test',
    abc: <ref *1> {
      abc: 123,
      def: 'test',
      ghi: { jkl: 'test' },
      xyz: [Circular *2]
    }
  }
}
`;

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}
